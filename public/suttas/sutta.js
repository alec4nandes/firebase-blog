const suttapitaka = {
    dn: 34,
    mn: 152,
    sn: 56,
    an: 11,
    kp: 9,
    dhp: 383,
    ud: 8,
    iti: 112,
    snp: 5,
};

async function getData(suttaId) {
    const endpoint = `https://suttacentral.net/api/suttas/${suttaId}/sujato?siteLanguage=en`;
    return await (await fetch(endpoint)).json();
}

async function getSutta(suttaId, data) {
    data = data || (await getData(suttaId));
    const {
            uid: sutta_id,
            title: sutta_title,
            author,
            previous,
            next,
        } = data.translation,
        firstNumIndex = [...sutta_id].findIndex(Number),
        section = sutta_id.slice(0, firstNumIndex),
        chapter = sutta_id.replace(section, ""),
        suttaInfo = {
            sutta_id,
            section,
            chapter,
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

async function getRandomSutta() {
    const sections = Object.keys(suttapitaka),
        section = getRandomItem(sections),
        randomChapter = getRandomNumber(suttapitaka[section]) + 1;
    let suttaId = `${section}${randomChapter}`,
        data = await getData(suttaId);
    // validate random chapter number: see if it needs .1 subsection
    if (!data.translation) {
        console.log(suttaId, "does not exist.");
        suttaId += ".1";
        console.log("trying", suttaId, "instead.");
        // get random subsection
        const subsections = await getSuttaSubsections(suttaId);
        suttaId = getRandomItem(subsections);
        data = await getData(suttaId);
    }
    return await getSutta(suttaId, data);

    function getRandomItem(arr) {
        return arr[getRandomNumber(arr.length)];
    }

    function getRandomNumber(max) {
        return ~~(Math.random() * max);
    }

    async function getSuttaSubsections(suttaId, result = []) {
        const endpoint = `https://suttacentral.net/api/suttas/${suttaId}/sujato?siteLanguage=en`,
            { translation } = await (await fetch(endpoint)).json(),
            { next, uid } = translation;
        result.push(uid);
        if (next) {
            const { uid: nextSuttaId } = next,
                chapter = suttaId.split(".")[0];
            if (nextSuttaId?.includes(chapter)) {
                result = await getSuttaSubsections(nextSuttaId, result);
            }
        }
        return result;
    }
}

export { suttapitaka, getSutta, getRandomSutta };
