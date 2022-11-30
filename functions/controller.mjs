import functions from "firebase-functions";
import express from "express";
import hbs from "express-handlebars";
import bodyParser from "body-parser";
import {
    getPublishedPosts,
    getPostsWithTag,
    getPostsContaining,
    getPostData,
    removeSubscriber,
    parseFormDataForUpload,
} from "./models.mjs";
// for emailing the mailing list each new post:
import admin from "firebase-admin";
import serviceAccount from "./node-blog-369520-firebase-adminsdk-68fp3-0d9391300a.json" assert { type: "json" };
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import { find } from "geo-tz";
// for __dirname in module:
import { dirname } from "path";
import { fileURLToPath } from "url";
import baguaInfo from "./iching-bagua-info.mjs";
import definitions from "./iching-definitions.mjs";
const __dirname = dirname(fileURLToPath(import.meta.url));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
dotenv.config();

// SERVER

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine(
    "hbs",
    hbs.engine({
        extname: "hbs",
        defaultLayout: null,
        // layoutsDir: __dirname + "/views/",
        partialsDir: __dirname + "/views/partials/",
        helpers: {
            ifArray: function (elem, options) {
                return Array.isArray(elem) && elem.length > 1
                    ? options.fn(this)
                    : options.inverse(this);
            },
            ifSelectedBagua: function (selectedBagua, baguaName, options) {
                console.log(selectedBagua, baguaName);
                if (selectedBagua === baguaName) {
                    return options.fn(this);
                }
            },
        },
    })
);
app.set("view engine", "hbs");
app.set("views", "./views");

function setCDNHeaders(res) {
    // CDN caching with Firebase Hosting:
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
}

// SERVER ROUTES

app.get("/", function (req, res) {
    setCDNHeaders(res);
    getPublishedPosts().then((posts) => renderHome(res, posts));
});

app.get("/search", function (req, res) {
    setCDNHeaders(res);
    const { tag, query } = req.query,
        promise = tag
            ? getPostsWithTag(tag)
            : query && getPostsContaining(query);
    promise?.then((posts) =>
        renderSearch(res, posts, tag ? "tag" : "query", tag || query)
    ) || res.redirect("/404.html");
});

app.get("/post", function (req, res) {
    setCDNHeaders(res);
    const post_id = req.query.id;
    getPostData(post_id, "posts").then((post) =>
        post ? renderPost(res, post) : res.redirect("/404.html")
    );
});

app.get("/admin", function (req, res) {
    res.setHeader("Cache-Control", "private");
    verifyUser(req)
        .then((decodedToken) => {
            // const uid = decodedToken.uid;
            const { is_new, id: post_id } = req.query,
                type = ["posts", "drafts"].find((t) => t === req.query.type);
            is_new
                ? res.render("edit-post", {})
                : post_id && type
                ? // can't read drafts unless logged in:
                  admin
                      .firestore()
                      .collection(type)
                      .doc(post_id)
                      .get()
                      .then((doc) => doc && { ...doc.data(), post_id: doc.id })
                      .then((post) => res.render("edit-post", post || {}))
                : renderEditPosts(res);
        })
        .catch((err) => {
            req.cookies?.user
                ? res.send(err + " /// " + req.cookies.user)
                : res.redirect("/sign-in.html");
        });
});

app.post("/preview", function (req, res) {
    res.setHeader("Cache-Control", "private");
    verifyUser(req).then((decodedToken) => {
        // const uid = decodedToken.uid;
        const post = { ...req.body, date: { seconds: ~~(Date.now() / 1000) } },
            parsed = parseFormDataForUpload(post);
        // delete post.feature_image_select;
        admin
            .firestore()
            .collection("drafts")
            .doc(post.post_id)
            .set(parsed)
            .then(
                async () =>
                    await renderPost(
                        res,
                        {
                            ...parsed,
                            date: post.date,
                            post_id: post.post_id,
                        },
                        true
                    )
            );
    });
});

app.get("/unsubscribe", function (req, res) {
    const { email } = req.query;
    unsub(email);
    async function unsub(email) {
        const message = await removeSubscriber(email);
        res.render("unsubscribe", {
            message,
            projects: getProjectsData(),
            all_tags: getAllTags(await getPublishedPosts()),
        });
        return;
    }
});

app.get("/gallery", function (req, res) {
    renderGallery(res);
});

// I-Ching routes
app.get("/iching/cast", function (req, res) {
    const { lines } = req.query;
    res.render("iching-cast", {
        lines,
        meta: {
            title: `I-Ching: ${lines ? "Custom Reading" : "Get a Reading"}`,
            description: lines
                ? "View this specific reading of the ancient Chinese oracle, the I-Ching!"
                : "Get a reading from the ancient Chinese oracle, the I-Ching!",
            url: `https://fern.haus/iching/cast${
                lines ? "/?lines=$lines_param" : ""
            }`,
            image: "https://fern.haus/images/fern-haus-site-logo.png",
        },
    });
});

app.get("/iching/bagua", function (req, res) {
    const { bagua } = req.query;
    res.render("iching-bagua", {
        bagua,
        all_bagua_info: baguaInfo,
        bagua_info: baguaInfo[bagua],
        meta: {
            title: `I-Ching: Bagua${bagua ? ` — ${bagua}` : ""}`,
            description: bagua
                ? "Learn all about the bagua $bagua and its trigram!"
                : "Learn all about the 8 bagua and their trigrams!",
            url: `https://fern.haus/iching/bagua${
                bagua ? "/?bagua=$bagua" : ""
            }`,
            image: "https://fern.haus/images/fern-haus-site-logo.png",
        },
    });
});

app.get("/iching/text", function (req, res) {
    res.render("iching-text", {
        definitions: convertKeysToLinks(definitions),
        table_data: getHexagramTableData(),
    });
    function convertKeysToLinks(definitions) {
        return Object.fromEntries(
            Object.entries(definitions).map(([key, def]) => [
                key
                    .split("/")
                    .map(
                        (bagua) =>
                            `<a href="/iching/bagua/?bagua=${bagua}">${bagua}</a>`
                    )
                    .join(" / "),
                def,
            ])
        );
    }
    function getHexagramTableData() {
        const baguaNames = [
            "heaven",
            "earth",
            "fire",
            "water",
            "lake",
            "mountain",
            "thunder",
            "wind",
            "",
        ];
        let result = [];
        for (let i = 0; i < baguaNames.length; i++) {
            result.push(new Array(baguaNames.length).fill(""));
        }
        Object.entries(definitions).forEach(([key, value]) => {
            const names = key.split("/"),
                [i1, i2] = names
                    // the columns should be the top trigrams
                    // because the headings are on top:
                    .reverse()
                    .map((name, i) => baguaNames.indexOf(name)),
                heading = `<a href="/iching/bagua/?bagua=${
                    names[1]
                }">${names[1].slice(0, 4)}</a>`;
            result[i1 + 1][
                i2 + 1
            ] = `<a href="/iching/text#${value.number}">${value.number}</a>`;
            result[0][i2 + 1] = heading;
            result[i2 + 1][0] = heading;
        });
        return result;
    }
});

// Moon Tides api route
// sample:
// http://localhost:5000/moon-tides/?latitude=32.8400896&longitude=-117.2078592&date=2022-11-30

app.get("/moon-tides", function (req, res) {
    // TODO: add moon data from lune package (not local - "universal")
    // moon data: next full, next new, current percent, phase name
    // TODO: filter station data to get tides (next high && low)
    sendData();

    async function sendData() {
        const { latitude, longitude, date } = req.query,
            sending =
                !isNaN(latitude) && !isNaN(longitude)
                    ? await handleLocalData(
                          { latitude: +latitude, longitude: +longitude },
                          date
                      )
                    : { error_message: "invalid coordinates" };
        res.send(sending);
    }

    async function handleLocalData(coords, date) {
        const { latitude, longitude } = coords,
            stations = await getNOAAStations(),
            nearestStation = findNearestStation({
                stations,
                latitude,
                longitude,
            });
        res.send({
            coords,
            nearest_NOAA_station: {
                name: nearestStation.name,
                id: nearestStation.id,
                latitude: nearestStation.lat,
                longitude: nearestStation.lng,
            },
            tides: await getTidesData(
                { latitude, longitude },
                nearestStation,
                date
            ),
            solar: await getSolarData({ latitude, longitude }, date),
        });
    }

    async function getNOAAStations() {
        const response = await fetch(
                "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json"
            ),
            { stations } = await response.json();
        return stations;
    }

    function findNearestStation({ stations, latitude, longitude }) {
        let shortestDistance, nearestStation;
        stations
            // only check tidal stations
            .filter((station) => station.tidal)
            .forEach((station) => {
                const { lat, lng } = station,
                    // pythag theorem (distance is hypotenuse)
                    trigDist = Math.sqrt(
                        Math.abs(latitude - lat) ** 2 +
                            Math.abs(longitude - lng) ** 2
                    );
                if (
                    // could be set to zero if standing on exact coordinate
                    // of NOAA station
                    (!shortestDistance && shortestDistance !== 0) ||
                    trigDist < shortestDistance
                ) {
                    shortestDistance = trigDist;
                    nearestStation = station;
                }
            });
        return nearestStation;
    }

    async function getTidesData({ latitude, longitude }, nearestStation, date) {
        // scanning from yesterday to tomorrow to avoid any timezone issues
        const response = await fetch(
                `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${date.replaceAll(
                    "-",
                    ""
                )}&range=48&product=predictions&datum=mllw&interval=hilo&format=json&units=metric&time_zone=lst_ldt&station=${
                    nearestStation.id
                }`
            ),
            tides = await response.json(),
            timeZone = find(latitude, longitude),
            offset =
                new Date(
                    new Date().toLocaleString("en-US", {
                        timeZone,
                    })
                ).getHours() - new Date().getHours(),
            parseTides = (type) =>
                tides.predictions
                    .filter((tide) => tide.type === type)
                    // .map((tide) => new Date(tide.t).toUTCString());
                    .map((tide) =>
                        new Date(
                            `${tide.t} GMT${offset < 0 ? "-" : "+"}${Math.abs(
                                offset
                            )}`
                        ).toUTCString()
                    )
                    .slice(0, 2);
        console.log("OFFSET:", offset, "timeZone:", timeZone);
        return {
            high_tides: parseTides("H"),
            low_tides: parseTides("L"),
        };
    }

    async function getSolarData({ latitude, longitude }, date) {
        const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`
            ),
            { results } = await response.json(),
            { sunrise, sunset, solar_noon, day_length } = results,
            parseResult = (dateTime) => new Date(dateTime).toUTCString();
        return {
            sunrise: parseResult(sunrise),
            sunset: parseResult(sunset),
            solar_noon: parseResult(solar_noon),
            day_length,
        };
    }
});

// 404 page must be final route declaration:
app.get("*", function (req, res) {
    setCDNHeaders(res);
    res.redirect("/404.html");
});

// SERVER RENDER FUNCTIONS

function renderHome(res, posts) {
    const all_tags = getAllTags(posts);
    res.render("home", {
        posts: formatDatesDescending(posts),
        all_tags,
        top_tags: all_tags,
        projects: getProjectsData(),
        meta_tags: makeMetaTags(posts),
    });
}

async function renderSearch(res, posts, search_type, query) {
    res.render("search", {
        posts: formatDatesDescending(posts),
        all_tags: getAllTags(await getPublishedPosts()),
        top_tags: getAllTags(posts),
        projects: getProjectsData(),
        search_type,
        query,
        meta_tags: makeMetaTags(posts),
    });
}

async function renderPost(res, post, is_draft) {
    res.render("post", {
        post: updateDate(post),
        all_tags: getAllTags(await getPublishedPosts()),
        projects: getProjectsData(),
        is_draft,
        meta_tags: makeMetaTags([post]),
    });
}

async function renderEditPosts(res) {
    res.render("edit-posts", {
        posts: formatDatesDescending(await getDocsHelper("posts")),
        drafts: formatDatesDescending(await getDocsHelper("drafts")),
    });
}

async function getDocsHelper(type) {
    const snapshot = await admin.firestore().collection(type).get();
    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        post_id: doc.id,
    }));
}

async function renderGallery(res) {
    res.render("gallery", {
        projects: getProjectsData(),
        all_tags: getAllTags(await getPublishedPosts()),
    });
}

// SERVER MISC

// verify user token cookie
async function verifyUser(req) {
    const token = req.cookies.__session || "";
    return await admin.auth().verifyIdToken(token);
}

function getAllTags(posts) {
    return [...new Set(posts.map((post) => post.tags).flat())].sort();
}

function getProjectsData() {
    const baseUrl = "https://fern.haus";
    return Object.fromEntries([
        ["Kings Corner", { url: `${baseUrl}/arcade` }],
        ["Prova Lab", { url: "https://provalabsocialinnovation.com" }],
        ["Dharma Gem", { url: `${baseUrl}/dharma-gem` }],
        ["Mushrooms", { url: `${baseUrl}/mushrooms` }],
        ["Timers", { url: `${baseUrl}/timers` }],
        ["I-Ching", { url: `${baseUrl}/iching` }],
        ["Dharma Deck", { url: `${baseUrl}/dharma-deck` }],
        [
            "Buddhist eBook",
            {
                url: `${baseUrl}/Weekly%20Suttas,%20Vol%201.epub`,
            },
        ],
        ["Custom Map", { url: `${baseUrl}/my-map` }],
    ]);
}

function formatDatesDescending(posts) {
    return posts
        .sort((a, b) => b.date.seconds - a.date.seconds)
        .map((post) => updateDate(post));
}

function updateDate(post) {
    return {
        ...post,
        date: formatDate(post.date),
    };
}

function formatDate(timestamp) {
    // return milliseconds, then JS parses to date on client side
    return timestamp.seconds * 1000;
}

function makeMetaTags(postsData) {
    const post = postsData.length === 1 && postsData[0],
        title = post?.title
            ? `${post.title} — Alec Fernandes`
            : "Alec Fernandes — Modern Mindful Code",
        subtitle =
            post?.subtitle ||
            "Enhance everyday mindfulness with meditation tips and elegant code.",
        feature_image =
            post?.feature_image ||
            "https://fern.haus/images/ocean-gliderport-background.jpg",
        url = getURL(post);
    return `
        <title>${title}</title>
        <meta name="type" property="og:type" content="website" />
        <meta name="title" property="og:title" content="${title}" />
        <meta name="url" property="og:url" content="${url}" />
        <meta name="description" property="og:description" content="${subtitle}" />
        <meta name="image" property="og:image" content="${feature_image}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@alec4nandes" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${subtitle}" />
        <meta name="twitter:image" content="${feature_image}" />`;
}

function getURL(post) {
    return `https://fern.haus${post ? `/post/?id=${post.post_id}` : ""}`;
}

// END SERVER

// MAILING LIST NEW POST ALERT

// google account credentials used to send email
const transporter = nodemailer.createTransport({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    secure: true,
    auth: {
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
    },
});

async function sendMailingListUpdate(snap, context) {
    const subscribers = await admin
            .firestore()
            .collection("mailing list")
            .doc("subscribers")
            .get(),
        bcc = subscribers.data().all,
        data = snap.data(),
        { postId } = context.params;
    // send individually in loop so each one has custom
    // unsubscribe link at bottom. also prevents reply-alls
    bcc.forEach((to) => {
        const mailOptions = {
            from: process.env.DB_USER,
            to,
            subject: data.title,
            html: getHtml(data, postId, to),
        };
        transporter.sendMail(mailOptions, (error, data) => {
            console.log(error || "Sent: " + JSON.stringify(data, null, 4));
        });
    });
    return;
}

function getHtml(data, postId, to) {
    const { subtitle, feature_image, feature_image_caption, content } = data,
        baseUrl = "https://fern.haus";
    return `
        ${subtitle ? `<p><strong>${subtitle}</strong></p>` : ""}
        <p>
            <a
                target="_blank"
                rel="noreferrer"
                href="${baseUrl}/post/?id=${postId}"
            >
                read at ${baseUrl}
            </a>
        </p>
        ${
            feature_image
                ? `<img src="${feature_image}" alt=""
                    style="max-width: 100%; margin: auto;"/>`
                : ""
        }
        ${
            feature_image && feature_image_caption
                ? `<br/><em>${feature_image_caption}</em>`
                : ""
        }
        <hr/>
        <div class="content">
            ${content}
        </div>
        <p>
            <a href="${baseUrl}"
            target="_blank" rel="noreferrer">
                read more</a> |
            <a href="${baseUrl}/unsubscribe/?email=${to}"
            target="_blank" rel="noreferrer">
                click here to unsubscribe</a>
        </p>`;
}

// APPLY FUNCTIONS

const func = functions.https.onRequest(app),
    sendEmail = functions.firestore
        .document("posts/{postId}")
        // Background triggers like onCreate must always return a
        // Promise or null. Async functions always return a Promise.
        .onCreate(sendMailingListUpdate);

export { func, sendEmail };
