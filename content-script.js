
console.log("hello world")

if (window.location.href.indexOf('accuplacerpracticetest.com') > -1) {
    const questionId = ".mtq_question_text h3";
    const hintId = ".mtq_question_text div";
    const imageId = "";
    const correctAnswerId = ".mtq_marker.mtq_correct_marker";
    const inCorrectAnswerId = ".mtq_marker.mtq_wrong_marker";
    const answerContentId = ".mtq_answer_text";
    const explanationAnswerId = ".mtq_explanation-text";

    const getContent = (key, element) => {
        let elem = element.querySelector(key);
        if (elem && elem.innerHTML && elem.innerHTML.indexOf("MathJax") > -1) {
            return elem.innerHTML;
        }
        return elem?.innerText ?? "";
    }

    const getQuestionData = (element) => {
        let question = getContent(questionId, element);
        let hint = getContent(hintId, element);
        let explanationAnswer = getContent(explanationAnswerId, element);

        let correctAnswersElement = element.querySelectorAll(correctAnswerId);
        let inCorrectAnswersElement = element.querySelectorAll(inCorrectAnswerId);

        let correctAnswers = [];
        correctAnswersElement?.forEach((element) => {
            let text = getContent(answerContentId, element.parentElement.parentElement);
            if (text && correctAnswers.indexOf(text) == -1) {
                correctAnswers.push(text);
            }
        });
        let inCorrectAnswers = [];
        inCorrectAnswersElement?.forEach((element) => {
            let text = getContent(answerContentId, element.parentElement.parentElement);
            if (text && inCorrectAnswers.indexOf(text) == -1) {
                inCorrectAnswers.push(text);
            }
        });

        return {
            question,
            hint,
            correctAnswers,
            inCorrectAnswers,
            explanationAnswer
        }
    }

    setTimeout(() => {

        let questionsElement = document.querySelectorAll(".mtq_question");
        let questions = [];
        questionsElement.forEach((element) => {
            let questionData = getQuestionData(element);
            questions.push(questionData);
        });
        if (questions.length > 0) {
            let name = document.querySelector('.entry-title[itemprop="headline"]').innerText;
            downloadJson(JSON.stringify(questions), name + '.json', 'text/plain');
        }
    }, 1000);


    function downloadJson(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}