import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { admin, renderContact } from "./server-functions.mjs";

dotenv.config();

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

function emailMe(formData, res) {
    const from = formData.email;
    if (!from.trim().length) {
        renderContact(res, true, true);
        return;
    }
    const mailOptions = {
        from,
        to: process.env.DB_USER,
        subject: `${from} wants a website!`,
        html: `<pre>${JSON.stringify(formData, null, 4)}</pre>`,
    };
    transporter.sendMail(mailOptions, (error, data) => {
        console.log(error || "Sent: " + JSON.stringify(data, null, 4));
        renderContact(res, true, error);
    });
}

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

export { emailMe, sendMailingListUpdate };
