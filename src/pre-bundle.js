import {
    addPost,
    addDraft,
    deletePost,
    deleteDraft,
    uploadImageAndGetURL,
    addSubscriber,
} from "../functions/models.mjs";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../functions/database.mjs";

// SUBSCRIBE FORM

addSubscribeFormHandler();

function addSubscribeFormHandler() {
    const formElem = document.querySelector(".subscribe-form");
    formElem && (formElem.onsubmit = (e) => handleSubscribe(e));
}

async function handleSubscribe(e) {
    e.preventDefault();
    const email = e.target.email.value,
        message = await addSubscriber(email);
    alert(message);
}

// EDIT POST FORM

addEditFormHandlers();

function addEditFormHandlers() {
    const changeImage = document.querySelector("#change-image"),
        uploadButton = document.querySelector("#upload-post"),
        saveDraftButton = document.querySelector("#save-draft"),
        deletePostButton = document.querySelector("#delete-post");
    if (changeImage) {
        changeImage.onchange = (e) => handleChangeImage(e);
        changeImage.required = !getFormData().feature_image;
    }
    uploadButton && (uploadButton.onclick = handleAddPost);
    saveDraftButton && (saveDraftButton.onclick = handleAddDraft);
    deletePostButton && (deletePostButton.onclick = handleDeletePost);
}

async function handleChangeImage(e) {
    const { post_id } = getFormData(),
        file = e.target.files[0],
        url = await uploadImageAndGetURL(post_id, file);
    document.querySelector("#feature-image").value = url;
    document.querySelector("#image-preview").src = url;
    await handleAddDraft();
    return;
}

async function handleAddPost() {
    const post = getFormData();
    await addPost(post).then((postAdded) => {
        if (postAdded) {
            alert("Post uploaded!");
            window.location.href = "/admin";
        }
    });
    return;
}

async function handleAddDraft() {
    const post = getFormData();
    await addDraft(post);
    alert("Draft uploaded!");
    return;
}

async function handleDeletePost() {
    const { post_id } = getFormData(),
        deletingPost = confirm(`Delete post with ID: ${post_id}`),
        deletingDraft = confirm(`Delete draft with ID: ${post_id}`);
    deletingPost && (await deletePost(post_id));
    deletingDraft && (await deleteDraft(post_id));
    if (deletingPost || deletingDraft) {
        const message = `${capitalize(
            [deletingPost && "post", deletingDraft && "draft"]
                .filter(Boolean)
                .join(" and ")
        )} deleted!`;
        alert(message);
        window.location.href = "/admin";
    }
    return;
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function getFormData() {
    const formElem = document.querySelector("#edit-post-form");
    return Object.fromEntries(new FormData(formElem).entries());
}

// AUTH

addAuthHandlers();

onAuthStateChanged(
    auth,
    async (user) => (document.cookie = await makeCookie(user))
);

async function makeCookie(user) {
    const token = (await user?.getIdToken()) || "",
        time = token ? 432000 : 0;
    return `__session=${token}; expires=${time}; path=/`;
}

function addAuthHandlers() {
    const signInElem = document.getElementById("sign-in-form"),
        signOutElem = document.getElementById("sign-out");
    signInElem && (signInElem.onsubmit = (e) => signIn(e));
    signOutElem &&
        (signOutElem.onclick = async () => {
            await signOut(auth);
            document.cookie = await makeCookie();
            window.location.href = "/";
        });
}

async function signIn(e) {
    e.preventDefault();
    const { email, password } = e.target;
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );
        document.cookie = await makeCookie(userCredential.user);
        window.location.href = "/admin";
    } catch (err) {
        alert(err);
    }
    return;
}
