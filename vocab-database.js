// vocab-database.js

export const vocab = {
    hsk1: [
        { simplified: "爱", pinyin: "ài", answer: "to love", explanation: "The character 爱 (ài) is crucial in words like 'lover' (爱人 àirén) and 'hobby' (爱好 àihào)." },
        { simplified: "八", pinyin: "bā", answer: "eight" },
        { simplified: "爸爸", pinyin: "bàba", answer: "father" },
        // ...continue with the rest of your HSK1 entries
    ],
    hsk2: [
        // ...HSK2 entries
    ],
    hsk3: [
        // ...HSK3 entries
    ],
    hsk4: [
        // ...HSK4 entries
    ],
    hsk5: [
        // ...HSK5 entries
    ]
};

export function getAllUniqueAnswers() {
    const allAnswers = new Set();
    for (const level in vocab) {
        vocab[level].forEach(item => {
            allAnswers.add(item.answer);
        });
    }
    return Array.from(allAnswers);
}

export function getVocabByLevels(levels) {
    return levels.flatMap(level => vocab[`hsk${level}`] || []);
}
