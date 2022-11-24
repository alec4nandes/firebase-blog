import { firestore, storage } from "./database.mjs";
import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import {
    deleteObject,
    getDownloadURL,
    listAll,
    ref,
    uploadBytes,
} from "firebase/storage";

async function getPublishedPosts() {
    return await getPostsData("posts");
}

async function getDrafts() {
    return await getPostsData("drafts");
}

async function getPostsData(type) {
    const querySnapshot = await getDocs(collection(firestore, type)),
        result = [];
    querySnapshot.forEach((doc) =>
        result.push({
            ...doc.data(),
            post_id: doc.id,
        })
    );
    return result;
}

async function getPostsWithTag(tag) {
    const posts = await getPublishedPosts();
    return posts.filter((post) => post.tags.includes(tag));
}

async function getPostsContaining(query) {
    const posts = await getPublishedPosts();
    return posts.filter((post) =>
        Object.values(post)
            .filter(
                (value) => typeof value === "string" || Array.isArray(value)
            )
            .find((value) =>
                Array.isArray(value)
                    ? value.find((item) =>
                          item.toUpperCase().includes(query.toUpperCase())
                      )
                    : value.toUpperCase().includes(query.toUpperCase())
            )
    );
}

async function getPostData(post_id, type) {
    const post = post_id && (await getDoc(doc(firestore, type, post_id))),
        data = post?.data();
    return data && { ...data, post_id: post.id };
}

async function addPost(post) {
    const { post_id } = post,
        canProceed = // see if overwriting
            (await getDoc(doc(firestore, "posts", post_id))).exists()
                ? confirm(
                      "There is a published post with this ID. Would you like to overwrite?"
                  )
                : true;
    if (canProceed) {
        await uploadHelper(post, "posts");
        await deleteDoc(doc(firestore, "drafts", post_id));
        await deleteUnusedImages(post_id);
    }
    return canProceed;
}

async function addDraft(post) {
    return await uploadHelper(post, "drafts");
}

async function uploadHelper(post, type) {
    const { post_id } = post,
        parsed = parseFormDataForUpload(post);
    return await setDoc(doc(firestore, type, post_id), parsed);
}

function parseFormDataForUpload(post) {
    const copy = { ...post };
    delete copy.post_id;
    delete copy.feature_image_select;
    copy.tags = copy.tags.split(",").map((tag) => tag.trim());
    copy.date = new Date();
    return copy;
}

async function deletePost(post_id) {
    return await deleteHelper("posts", post_id);
}

async function deleteDraft(post_id) {
    return await deleteHelper("drafts", post_id);
}

async function deleteHelper(type, post_id) {
    const ref = doc(firestore, type, post_id);
    await deleteDoc(ref);
    await deleteUnusedImages(post_id);
    return;
}

async function deleteUnusedImages(post_id) {
    const featureImages = (
            await Promise.all(
                ["posts", "drafts"].map(
                    async (type) => await getFeatureImage(type, post_id)
                )
            )
        ).filter(Boolean),
        listRef = ref(storage, post_id),
        { items } = await listAll(listRef);
    for (const item of items) {
        !featureImages.includes(await getDownloadURL(item)) &&
            (await deleteObject(item));
    }
    return;
}

async function getFeatureImage(type, post_id) {
    const ref = doc(firestore, type, post_id),
        post = await getDoc(ref);
    return post?.data()?.feature_image;
}

async function uploadImageAndGetURL(post_id, file) {
    const imageRef = ref(storage, post_id + "/" + file.name);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
}

async function addSubscriber(email) {
    if (email) {
        await updateDoc(doc(firestore, "mailing list", "subscribers"), {
            all: arrayUnion(email),
        });
        return "Thank you for subscribing!";
    } else {
        return "Please enter your email address.";
    }
}

async function removeSubscriber(email) {
    try {
        await updateDoc(doc(firestore, "mailing list", "subscribers"), {
            all: arrayRemove(email),
        });
        return `The email address "${email}" will no longer receive updates for this blog.`;
    } catch (error) {
        return "There was an error unsubscribing. Please refresh the page.";
    }
}

export {
    getPublishedPosts,
    getDrafts,
    getPostsWithTag,
    getPostsContaining,
    getPostData,
    addPost,
    addDraft,
    deletePost,
    deleteDraft,
    uploadImageAndGetURL,
    addSubscriber,
    removeSubscriber,
};
