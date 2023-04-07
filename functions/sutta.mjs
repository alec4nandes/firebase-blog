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
        section_id = sutta_id.slice(0, firstNumIndex),
        chapter_number = sutta_id.replace(section_id, ""),
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
            section_id,
            chapter_number,
            chapter_title,
            chapter_description,
            sutta_title,
            author,
            prev_id: previous.uid,
            next_id: next.uid,
            sutta_description: data.suttaplex.blurb,
            // data,
        },
        sectionInfo = await getSectionInfo(section_id),
        lines = await getSuttaChapterText(sutta_id);
    return {
        ...suttaInfo,
        ...sectionInfo,
        lines,
        display: {
            linesHTML: lines.map((line) => line.trim()).join("<br/>"),
            annotations: [],
        },
    };

    async function getData(suttaId) {
        const endpoint = `https://suttacentral.net/api/suttas/${suttaId}/sujato?siteLanguage=en`;
        return await (await fetch(endpoint)).json();
    }

    async function getSectionInfo(sectionId) {
        const endpoint = `https://suttacentral.net/api/suttas/${sectionId}/sujato?siteLanguage=en`,
            data = await (await fetch(endpoint)).json(),
            {
                translated_title: title,
                original_title: pali,
                blurb: description,
            } = data?.suttaplex || {},
            isDhp = sectionId === "dhp";
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
            lines = Object.values(translation_text)
                .filter(Boolean)
                .map((line) => line.replaceAll("<j>", ""));
        return lines;
    }
}
