import admin from "firebase-admin";
import serviceAccount from "./node-blog-369520-firebase-adminsdk-68fp3-c4f95da553.json" assert { type: "json" };
import { getPublishedPosts, parseFormDataForUpload } from "./models.mjs";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* RENDERING (Handlebars) */

async function renderHome(res) {
    const posts = formatDatesDescending(await getPublishedPosts());
    res.render("home", {
        latest_post: posts[0],
        projects: getHomePageProjects(posts),
        tags: getAllTags(posts),
        meta_tags: makeMetaTags(),
    });
}

async function renderBlog(res, pageNum) {
    res.render("blog", await paginate(pageNum));
}

async function renderSearch(res, searchPosts, pageNum, search_type, query) {
    res.render("search", {
        ...(await paginate(pageNum, searchPosts)),
        query,
        search_type: search_type === "query" ? "search" : search_type,
        searching: `${search_type}=${query}&`,
    });
}

async function renderPost(res, post, is_draft) {
    res.render("post", {
        ...(await getNavMenuData()),
        post: updateDate(post),
        is_draft,
        meta_tags: makeMetaTags([post]),
    });
}

async function renderPreview(res, p) {
    const post = { ...p };
    post.date = { seconds: ~~(new Date().getTime() / 1000) };
    const parsed = parseFormDataForUpload(post);
    await admin.firestore().collection("drafts").doc(post.post_id).set(parsed);
    const previewPost = {
        ...parsed,
        date: post.date,
        post_id: post.post_id,
    };
    await renderPost(res, previewPost, true);
}

async function renderEditPosts(res) {
    const getSorted = async (type) =>
        formatDatesDescending(await getDocsHelper(type));
    res.render("edit-posts", {
        posts: await getSorted("posts"),
        drafts: await getSorted("drafts"),
    });
}

async function renderEditDraft(res, type, post_id) {
    const doc = await admin.firestore().collection(type).doc(post_id).get();
    if (doc) {
        const post = { ...doc.data(), post_id: doc.id };
        res.render("edit-post", post || {});
    }
}

async function renderAdmin(req, res) {
    const { is_new, id: post_id } = req.query,
        type = ["posts", "drafts"].find((t) => t === req.query.type);
    is_new
        ? res.render("edit-post", {})
        : post_id && type
        ? renderEditDraft(res, type, post_id)
        : renderEditPosts(res);
}

async function renderGallery(res) {
    res.render("gallery", await getNavMenuData());
}

async function renderContact(res, isConfirm, error) {
    res.render("contact", {
        ...(await getNavMenuData()),
        confirm:
            isConfirm &&
            (error
                ? `I'm sorry, but there was an error submitting the form. Please email me directly at <a href="mailto:al@fern.haus">al@fern.haus</a>.`
                : "Thank you for reaching out! I will be in touch with you shortly."),
    });
}

async function renderUnsubscribe(res, message) {
    res.render("unsubscribe", {
        ...(await getNavMenuData()),
        message,
    });
}

/* MISC */

function getHomePageProjects(posts) {
    return posts
        .filter((post) => post.tags.includes("projects"))
        .map((post) => ({
            post_id: post.post_id,
            name: post.post_id.replaceAll("-", " "),
            image: post.feature_image,
        }));
}

async function paginate(pageNum, searchPosts) {
    const postsPerPage = 4,
        page_num = isNaN(pageNum) || ~~+pageNum < 1 ? 1 : ~~+pageNum,
        start = page_num * postsPerPage - postsPerPage,
        end = start + postsPerPage,
        all_posts = await getPublishedPosts(),
        all_tags = getAllTags(all_posts),
        arr = searchPosts || all_posts,
        posts = formatDatesDescending(arr).slice(start, end),
        total_posts = arr.length,
        total_pages = Math.ceil(total_posts / postsPerPage),
        prev_page = page_num > 1 && page_num - 1,
        next_page = page_num < total_pages && page_num + 1;
    return {
        all_tags,
        posts,
        page_num,
        total_pages,
        prev_page,
        next_page,
        projects: getProjectsData(),
        meta_tags: makeMetaTags(posts),
    };
}

async function getNavMenuData() {
    return {
        all_tags: getAllTags(await getPublishedPosts()),
        projects: getProjectsData(),
    };
}

async function getDocsHelper(type) {
    const snapshot = await admin.firestore().collection(type).get();
    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        post_id: doc.id,
    }));
}

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
        "Prova Lab": { slug: "prova-lab" },
        Mushrooms: { slug: "mushrooms" },
        "Moon-Sun-Tides API": { slug: "moon-sun-tides-api" },
        "Kings Corner": { slug: "kings-corner" },
        "Dharma Gem": { slug: "dharma-gem" },
        "I-Ching": { slug: "iching" },
        Timers: { slug: "timers" },
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
    const utcDate = new Date(timestamp.seconds * 1000),
        localDateString = utcDate.toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
        }),
        d = new Date(localDateString),
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
    return `${month} ${day}, ${year} at ${hour}:${minutes} ${amPm} PST`;
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
            "https://fern.haus/assets/ocean-gliderport-background.jpg",
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

export {
    admin,
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
};
