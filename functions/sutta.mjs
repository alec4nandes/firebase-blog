import fetch from "node-fetch";

export default async function getSutta(suttaId) {
    const data = await getData(suttaId),
        {
            uid: sutta_id,
            title: sutta_title,
            author,
            previous,
            next,
        } = data.translation,
        firstNumIndex = [...sutta_id].findIndex(Number),
        section = sutta_id.slice(0, firstNumIndex),
        chapter = sutta_id.replace(section, ""),
        chapterData =
            suttaId.includes(".") && (await getData(suttaId.split(".")[0])),
        {
            uid,
            translated_title,
            blurb: chapter_description,
        } = chapterData?.suttaplex || {},
        chapter_title = chapterData && `${uid}: ${translated_title}`,
        suttaInfo = {
            sutta_id,
            section,
            chapter,
            chapter_title,
            chapter_description,
            sutta_title,
            author,
            prev_id: previous.uid,
            next_id: next.uid,
            sutta_description: data.suttaplex.blurb,
            // data,
        },
        sectionInfo = await getSectionInfo(section),
        lines = await getSuttaChapterText(sutta_id);
    return {
        ...suttaInfo,
        ...sectionInfo,
        lines,
    };

    async function getData(suttaId) {
        const endpoint = `https://suttacentral.net/api/suttas/${suttaId}/sujato?siteLanguage=en`;
        return await (await fetch(endpoint)).json();
    }

    async function getSectionInfo(section) {
        const endpoint = `https://suttacentral.net/api/suttas/${section}/sujato?siteLanguage=en`,
            data = await (await fetch(endpoint)).json(),
            {
                translated_title: title,
                original_title: pali,
                blurb: description,
            } = data?.suttaplex || {},
            isDhp = section === "dhp";
        return {
            section_title: !title && isDhp ? "Dhammapada" : title,
            section_pali: !pali && isDhp ? "Dhammapada" : pali,
            section_description:
                !description && isDhp
                    ? "One of the most widely read collections of basic Buddhist teachings."
                    : description,
        };
    }

    async function getSuttaChapterText(suttaId) {
        const endpoint = `https://suttacentral.net/api/bilarasuttas/${suttaId}/sujato`,
            { translation_text } = await (await fetch(endpoint)).json(),
            lines = Object.values(translation_text).filter(Boolean);
        return lines;
    }
}
