import functions from "firebase-functions";
import express from "express";
import hbs from "express-handlebars";
import bodyParser from "body-parser";
import {
    getPostsWithTag,
    getPostsContaining,
    getPostData,
    removeSubscriber,
} from "./models.mjs";
import {
    renderHome,
    renderBlog,
    renderSearch,
    renderPost,
    renderPreview,
    renderAdmin,
    renderGallery,
    renderContact,
    renderUnsubscribe,
    verifyUser,
    render404,
} from "./server-functions.mjs";

import { emailMe, sendMailingListUpdate } from "./email.mjs";
import cookieParser from "cookie-parser";
import getMoonSunTidesData from "./moon-sun-tides.mjs";
import {
    renderIChingCast,
    renderIChingBagua,
    renderIChingText,
} from "./iching-render.mjs";
// for __dirname in module:
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import fs from "fs";

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
    renderHome(res);
});

app.get("/blog", function (req, res) {
    const { page: pageNum } = req.query;
    setCDNHeaders(res);
    renderBlog(res, pageNum);
});

app.get("/search", function (req, res) {
    setCDNHeaders(res);
    const { tag, query, page: pageNum } = req.query,
        promise = tag
            ? getPostsWithTag(tag)
            : query && getPostsContaining(query);
    promise?.then((posts) => {
        const search_type = tag ? "tag" : "query";
        renderSearch(res, posts, pageNum, search_type, tag || query);
    }) || res.redirect("/404.html");
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
            renderAdmin(req, res);
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
        renderPreview(res, req.body);
    });
});

app.get("/unsubscribe", function (req, res) {
    const { email } = req.query;
    removeSubscriber(email).then((message) => renderUnsubscribe(res, message));
});

app.get("/gallery", function (req, res) {
    renderGallery(res);
});

// contact form
app.get("/contact", function (req, res) {
    renderContact(res);
});

app.get("/contact-thanks", function (req, res) {
    emailMe(req.query, res);
});

// I-Ching routes

app.get("/iching/cast", function (req, res) {
    const { lines } = req.query;
    renderIChingCast(res, lines);
});

app.get("/iching/bagua", function (req, res) {
    const { bagua } = req.query;
    renderIChingBagua(res, bagua);
});

app.get("/iching/text", function (req, res) {
    renderIChingText(res);
});

// Moon-Sun-Tides API route, sample:
// http://localhost:5000/moon-sun-tides-api/?latitude=32.8400896&longitude=-117.2078592&date=2022-11-30
app.get("/moon-sun-tides-api", function (req, res) {
    getMoonSunTidesData(req, res);
});

app.get("/404", function (req, res) {
    render404(res);
});

// 404 page must be final route declaration:
app.get("*", function (req, res) {
    setCDNHeaders(res);
    res.redirect("/404");
});

/* APPLY FUNCTIONS */

const func = functions.https.onRequest(app),
    sendEmail = functions.firestore
        .document("posts/{postId}")
        // Background triggers like onCreate must always return a
        // Promise or null. Async functions always return a Promise.
        .onCreate(sendMailingListUpdate);

export { func, sendEmail };
