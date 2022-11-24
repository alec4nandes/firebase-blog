import functions from "firebase-functions";
import express from "express";
import engines from "consolidate";
import bodyParser from "body-parser";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./database.mjs";
import {
    getPublishedPosts,
    getPostsWithTag,
    getPostsContaining,
    getPostData,
    getDrafts,
    addDraft,
    removeSubscriber,
} from "./models.mjs";
// for emailing the mailing list each new post:
import admin from "firebase-admin";
import serviceAccount from "./node-blog-369520-firebase-adminsdk-68fp3-0d9391300a.json" assert { type: "json" };
import dotenv from "dotenv";
import nodemailer from "nodemailer";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
dotenv.config();

// SERVER

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("hbs", engines.handlebars);
app.set("views", "./views");
app.set("view engine", "hbs");

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
    // setCDNHeaders(res);
    if (auth.currentUser) {
        const { is_new, id: post_id } = req.query,
            type = ["posts", "drafts"].find((t) => t === req.query.type);
        is_new
            ? res.render("edit-post", {})
            : post_id && type
            ? getPostData(post_id, type).then((post) =>
                  res.render("edit-post", post || {})
              )
            : renderEditPosts(res);
    } else {
        res.redirect("/sign-in.html");
    }
});

app.post("/admin", function (req, res) {
    // setCDNHeaders(res);
    const { email, password } = req.body;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            res.redirect("/admin");
        })
        .catch((error) => {
            const { code, message } = error;
            console.warn(code + ": " + message);
        });
});

app.post("/preview", function (req, res) {
    // setCDNHeaders(res);
    const post = { ...req.body, date: { seconds: ~~(Date.now() / 1000) } };
    // delete post.feature_image_select;
    addDraft(post);
    renderPost(res, post, true);
});

app.get("/sign-out", function (req, res) {
    // setCDNHeaders(res);
    signOut(auth).then(() => res.redirect("/"));
});

app.get("/unsubscribe", function (req, res) {
    // setCDNHeaders(res);
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

app.get("/auth", function (req, res) {
    auth.currentUser
        ? admin
              .auth()
              .createCustomToken(auth.currentUser.uid)
              .then((token) => res.send({ token }))
              .catch((error) => res.send({}))
        : res.send({});
});

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
        posts: formatDatesDescending(await getPublishedPosts()),
        drafts: formatDatesDescending(await getDrafts()),
    });
}

// SERVER MISC

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
    const d = new Date(timestamp.seconds * 1000),
        months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        month = months[d.getMonth()],
        day = d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        hour = hours % 12 || 12,
        minutes = ("" + d.getMinutes()).padStart(2, "0"),
        amPm = hours < 12 ? "am" : "pm";
    return `${month} ${day}, ${year} at ${hour}:${minutes} ${amPm}`;
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
        baseUrl = `https://node-blog-369520.web.app`;
    return `
        ${subtitle ? `<p><strong>${subtitle}</strong></p>` : ""}
        <a
            target="_blank"
            rel="noreferrer"
            href="${baseUrl}/post/?id=${postId}"
        >
            read at ${baseUrl}
        </a>
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
