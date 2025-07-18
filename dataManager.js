// js/dataManager.js
let vocabData = {}; // This will hold the fetched vocabulary

export const loadVocabData = async () => {
    try {
        const response = await fetch('data/vocab.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        vocabData = await response.json();
        console.log("Vocabulary data loaded successfully.");
    } catch (error) {
        console.error("Could not load vocabulary data:", error);
        // Fallback or error handling for the user
    }
};

export const getVocabByLevels = (levels) => {
    return levels.flatMap(level => vocabData[`hsk${level}`] || []);
};

export const getAllUniqueAnswers = () => {
    const allAnswers = new Set();
    for (const level in vocabData) {
        vocabData[level].forEach(item => {
            allAnswers.add(item.answer);
        });
    }
    return Array.from(allAnswers);
};