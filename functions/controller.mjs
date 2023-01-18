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
import {
    admin,
    renderBlog,
    renderSearch,
    renderPost,
    renderEditPosts,
    renderGallery,
    verifyUser,
    getAllTags,
    makeMetaTags,
    formatDatesDescending,
} from "./server-functions.mjs";
// for emailing the mailing list each new post:
import cookieParser from "cookie-parser";
// contact form & email subscribers
import { emailMe, sendMailingListUpdate } from "./email.mjs";
// project scripts:
import baguaInfo from "./iching-bagua-info.mjs";
import definitions from "./iching-definitions.mjs";
import getMoonSunTidesData from "./moon-sun-tides.mjs";
// for __dirname in module:
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

/* SERVER CONFIG */

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

/* SERVER ROUTES */

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

// contact form
app.get("/contact", function (req, res) {
    res.send(`
        <form action="/contact-thanks">
            <label>email: <input name="email" type="email" /></label>
            <label><input name="single_page_site" type="checkbox"/> single page site</label>
            <label><input name="multiple_pages_single_site" type="checkbox"/> multiple pages for single site</label>
            <label><input name="multiple_sites" type="checkbox"/> multiple sites</label>
            <button type="submit">contact me</button>
        </form>
    `);
});

app.get("/contact-thanks", function (req, res) {
    emailMe(req.query, res);
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

/* END SERVER ROUTES */

/* APPLY FUNCTIONS */

const func = functions.https.onRequest(app),
    sendEmail = functions.firestore
        .document("posts/{postId}")
        // Background triggers like onCreate must always return a
        // Promise or null. Async functions always return a Promise.
        .onCreate(sendMailingListUpdate);

export { func, sendEmail };
