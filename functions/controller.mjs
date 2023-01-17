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
// project scripts:
import baguaInfo from "./iching-bagua-info.mjs";
import definitions from "./iching-definitions.mjs";
import getMoonSunTidesData from "./moon-sun-tides.mjs";
// for __dirname in module:
import { dirname } from "path";
import { fileURLToPath } from "url";
import { start } from "repl";
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

const POSTS_PER_PAGE = 4;

app.get("/", function (req, res) {
    setCDNHeaders(res);
    getPublishedPosts()
        .then((posts) => formatDatesDescending(posts))
        .then((posts) =>
            res.render("home", {
                latest_post: posts[0],
                projects: posts
                    .filter((post) => post.tags.includes("projects"))
                    .map((post) => ({
                        post_id: post.post_id,
                        name: post.post_id.replaceAll("-", " "),
                        image: post.feature_image,
                    })),
                tags: getAllTags(posts),
                meta_tags: makeMetaTags(),
            })
        );
});

app.get("/blog", function (req, res) {
    const { page } = req.query;
    setCDNHeaders(res);
    renderBlog(res, page);
});

app.get("/search", function (req, res) {
    setCDNHeaders(res);
    const { tag, query, page } = req.query,
        promise = tag
            ? getPostsWithTag(tag)
            : query && getPostsContaining(query);
    promise?.then((posts) =>
        renderSearch(res, posts, page, tag ? "tag" : "query", tag || query)
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
// http://localhost:5000/moon-sun-tides-api/?latitude=32.8400896&longitude=-117.2078592&date=2022-11-30
app.get("/moon-sun-tides-api", function (req, res) {
    getMoonSunTidesData(req, res);
});

// 404 page must be final route declaration:
app.get("*", function (req, res) {
    setCDNHeaders(res);
    res.redirect("/404.html");
});

// SERVER RENDER FUNCTIONS

async function renderBlog(res, pageNum) {
    const { all_posts, posts, page_num, total_pages, prev_page, next_page } =
            await paginate(pageNum),
        all_tags = getAllTags(all_posts);
    res.render("blog", {
        posts,
        all_tags,
        top_tags: all_tags,
        projects: getProjectsData(),
        meta_tags: makeMetaTags(posts),
        page_num,
        total_pages,
        prev_page,
        next_page,
    });
}

async function paginate(pageNum, searchPosts) {
    const page_num = isNaN(pageNum) || ~~+pageNum < 1 ? 1 : ~~+pageNum,
        all_posts = await getPublishedPosts(),
        posts = postsForPage(
            formatDatesDescending(searchPosts || all_posts),
            page_num
        ),
        total_posts = (searchPosts || all_posts)?.length,
        total_pages =
            ~~(total_posts / POSTS_PER_PAGE) +
            (total_posts % POSTS_PER_PAGE ? 1 : 0),
        prev_page = page_num > 1 && page_num - 1,
        next_page = page_num < total_pages && page_num + 1;
    return {
        all_posts,
        posts,
        page_num,
        total_pages,
        prev_page,
        next_page,
    };
}

function postsForPage(posts, pageNum) {
    const start = pageNum * POSTS_PER_PAGE - POSTS_PER_PAGE,
        end = start + POSTS_PER_PAGE;
    return posts.slice(start, end);
}

async function renderSearch(res, searchPosts, pageNum, search_type, query) {
    const { all_posts, posts, page_num, total_pages, prev_page, next_page } =
            await paginate(pageNum, searchPosts),
        all_tags = getAllTags(all_posts);
    res.render("search", {
        posts,
        all_tags,
        // top_tags: getAllTags(posts),
        projects: getProjectsData(),
        search_type: search_type === "query" ? "search" : search_type,
        query,
        meta_tags: makeMetaTags(posts),
        page_num,
        total_pages,
        prev_page,
        next_page,
        searching: `${search_type}=${query}&`,
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
    return [...new Set(posts.map((post) => post.tags).flat())].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );
}

function getProjectsData() {
    return {
        Mushrooms: { slug: "mushrooms" },
        "Moon-Sun-Tides API": { slug: "moon-sun-tides-api" },
        "Kings Corner": { slug: "kings-corner" },
        "Prova Lab": { slug: "prova-lab" },
        "I-Ching": { slug: "iching" },
        Timers: { slug: "timers" },
        "Dharma Gem": { slug: "dharma-gem" },
        "Dharma Deck": { slug: "dharma-deck" },
        "Buddhist eBook": { slug: "buddhist-ebook" },
        // "My Map": { slug: "my-map" },
    };
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
    const post = postsData?.length === 1 && postsData[0],
        title = post?.title
            ? `${post.title} — Alec Fernandes`
            : "Alec Fernandes",
        subtitle =
            post?.subtitle ||
            "Writer and web developer. Follow me @alec4nandes on most major socials.",
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
                rel="noopener"
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
            target="_blank" rel="noopener">
                read more</a> |
            <a href="${baseUrl}/unsubscribe/?email=${to}"
            target="_blank" rel="noopener">
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
