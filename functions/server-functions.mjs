import admin from "firebase-admin";
import serviceAccount from "./node-blog-369520-firebase-adminsdk-68fp3-c4f95da553.json" assert { type: "json" };
import { getPublishedPosts } from "./models.mjs";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* RENDERING (Handlebars) */

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

async function renderGallery(res) {
    res.render("gallery", {
        projects: getProjectsData(),
        all_tags: getAllTags(await getPublishedPosts()),
    });
}

async function renderContact(res, isConfirm, error) {
    res.render("contact", {
        projects: getProjectsData(),
        all_tags: getAllTags(await getPublishedPosts()),
        confirm:
            isConfirm &&
            (error
                ? `I'm sorry, but there was an error submitting the form. Please email me directly at <a href="mailto:al@fern.haus">al@fern.haus</a>.`
                : "Thank you for reaching out! I will be in touch with you shortly."),
    });
}

/* MISC */

async function paginate(pageNum, searchPosts) {
    const postsPerPage = 4,
        page_num = isNaN(pageNum) || ~~+pageNum < 1 ? 1 : ~~+pageNum,
        start = page_num * postsPerPage - postsPerPage,
        end = start + postsPerPage,
        all_posts = await getPublishedPosts(),
        arr = searchPosts || all_posts,
        posts = formatDatesDescending(arr).slice(start, end),
        total_posts = arr.length,
        total_pages = Math.ceil(total_posts / postsPerPage),
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
    // return milliseconds, then JS parses to date on client side
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
    renderBlog,
    renderSearch,
    renderPost,
    renderEditPosts,
    renderGallery,
    renderContact,
    verifyUser,
    getAllTags,
    makeMetaTags,
    formatDatesDescending,
    getProjectsData,
};
