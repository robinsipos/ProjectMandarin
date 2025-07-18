// js/quizLogic.js
import * as DataManager from './dataManager.js';
import * as UIManager from './uiManager.js';
import * as SettingsManager from './settingsManager.js';

let quizState = {
    quizPool: [],
    fullAnswerPool: [],
    currentQuestion: null,
    questionCounter: 0,
    score: 0,
    startTime: null,
    quizResults: []
};

export const initializeQuiz = async (keepSettings = false) => {
    if (!keepSettings) {
        SettingsManager.saveCurrentSettings();
    }

    const selectedLevels = SettingsManager.getSetting('savedLevels');
    const selectedQuantity = SettingsManager.getSetting('savedQuantity');

    // Ensure vocab data is loaded before proceeding
    if (Object.keys(DataManager.getVocabByLevels(selectedLevels)).length === 0) {
         await DataManager.loadVocabData();
    }

    const combinedVocab = DataManager.getVocabByLevels(selectedLevels);
    if (combinedVocab.length === 0) {
        alert("No vocabulary available for the selected HSK levels. Please select at least one HSK level with valid words.");
        UIManager.showScreen('quizSettings');
        return;
    }

    quizState.fullAnswerPool = DataManager.getAllUniqueAnswers();

    const filteredVocab = combinedVocab.filter(item => item && item.answer && typeof item.answer === 'string');
    let quizPool = [...filteredVocab].sort(() => 0.5 - Math.random());

    if (selectedQuantity !== 'all' && quizPool.length > parseInt(selectedQuantity, 10)) {
        quizPool = quizPool.slice(0, parseInt(selectedQuantity, 10));
    }
    quizState.quizPool = quizPool;

    if (quizPool.length === 0) {
        alert("Not enough unique questions available with current settings. Please select more HSK levels or reduce the quantity.");
        UIManager.showScreen('quizSettings');
        return;
    }

    Object.assign(quizState, { score: 0, questionCounter: 0, quizResults: [], startTime: new Date() });

    UIManager.showScreen('quiz');
    loadQuestion();
};

export const loadQuestion = () => {
    UIManager.resetQuizUI();
    if (quizState.questionCounter >= quizState.quizPool.length) {
        setTimeout(() => endQuiz(), 400);
        return;
    }

    quizState.currentQuestion = quizState.quizPool[quizState.questionCounter];

    UIManager.updateQuizQuestion(
        quizState.currentQuestion,
        quizState.questionCounter,
        quizState.quizPool.length,
        quizState.score
    );
    // Ensure pinyin display is updated based on current settings
    UIManager.updatePinyinDisplay(quizState.currentQuestion.pinyin, SettingsManager.getSetting('showPinyin'));

    const options = generateOptions(quizState.currentQuestion.answer);
    UIManager.displayOptions(options, checkAnswer);
};

const checkAnswer = (selectedButton) => {
    const selectedAnswer = selectedButton.textContent;
    const { answer, explanation, funFact } = quizState.currentQuestion;
    const isCorrect = selectedAnswer === answer;

    UIManager.highlightAnswer(selectedButton, answer);

    quizState.quizResults.push({ question: quizState.currentQuestion, userAnswer: selectedAnswer, isCorrect });

    const nextStep = () => {
        quizState.questionCounter++;
        loadQuestion();
    };

    if (isCorrect) {
        quizState.score++;
        UIManager.displayFeedback("Correct!", true);
        setTimeout(UIManager.hideFeedback, 1200);
        setTimeout(nextStep, 1200);
    } else {
        UIManager.displayFeedback("Not quite...", false);
        setTimeout(UIManager.hideFeedback, 1500);
        setTimeout(() => {
            if (explanation || funFact) {
                UIManager.populateHintModal(quizState.currentQuestion);
                UIManager.toggleModal('hint', true);
            } else {
                nextStep();
            }
        }, 1500);
    }
};

export const endQuiz = () => {
    UIManager.updateResultsScreen(quizState.quizResults, quizState.startTime);
    UIManager.showScreen('results');
};

const generateOptions = (correctAnswer) => {
    const options = new Set([correctAnswer]);
    let potentialIncorrectAnswers = quizState.fullAnswerPool.filter(ans => ans !== correctAnswer);

    while (options.size < 4 && potentialIncorrectAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * potentialIncorrectAnswers.length);
        const chosenIncorrect = potentialIncorrectAnswers.splice(randomIndex, 1)[0];
        options.add(chosenIncorrect);
    }

    let placeholderIndex = 0;
    while (options.size < 4) {
        options.add(`Option ${++placeholderIndex}`);
    }

    return Array.from(options).sort(() => 0.5 - Math.random());
};

export const getQuizState = () => quizState;