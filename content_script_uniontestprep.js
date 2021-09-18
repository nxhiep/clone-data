const KEY = 'clone_data_hello_world';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getTopicName() {
    let prefix = '/asvab/practice-test/';
    let pathname = window.location.pathname;
    let offset = pathname.indexOf(prefix) + prefix.length;
    let limit = pathname.indexOf('/', offset);
    return pathname.substring(offset, limit);
}

function getQuestionId() {
    let prefix = '/pages/';
    let pathname = window.location.pathname;
    let offset = pathname.indexOf(prefix) + prefix.length;
    return pathname.substring(offset, pathname.length);
}

function getCookie(key) {
    var name = key + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(key, value) {
    var d = new Date();
    d.setTime(d.getTime() + 1 * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

var stop = typeof getCookie(KEY) === 'undefined' || getCookie(KEY) == 'true';

if (window.location.href.indexOf('uniontestprep.com') > -1) {
    if (!stop) {
        selectQuestion();
    }

    let buttonStart = document.createElement('button');
    buttonStart.innerHTML = 'Start';
    buttonStart.onclick = () => {
        setCookie(KEY, 'false');
        selectQuestion();
    }
    buttonStart.setAttribute('style', `
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 10px 30px;
        border-radius: 10px;
        background: green;
        color: white;
    `);
    let buttonStop = document.createElement('button');
    buttonStop.innerHTML = 'Stop';
    buttonStop.onclick = () => {
        setCookie(KEY, 'true');
    }
    buttonStop.setAttribute('style', `
        position: fixed;
        top: 10px;
        left: 120px;
        padding: 10px 30px;
        border-radius: 10px;
        background: red;
        color: white;
    `);
    document.body.appendChild(buttonStart);
    document.body.appendChild(buttonStop);
}

async function selectQuestion() {
    let formElement = document.querySelector('form');
    if (!formElement) {
        window.alert('OK');
        return;
    }
    await sleep(500);
    let explanationElement = formElement.querySelectorAll('fieldset');
    if (!explanationElement) {
        window.alert('OK');
        return;
    }
    if (explanationElement.length > 1) {
        explanationElement = explanationElement[explanationElement.length - 1];
    } else {
        explanationElement = null;
    }
    let check = Object.values(explanationElement.querySelectorAll('.font-bold')).find((a) => a.innerText == 'Explanation:');
    console.log("check", check)
    if (check) {
        let question = await getQuestion(formElement, explanationElement);
        console.log("question", question)
        let buttonNextQuestion = document.querySelector('#btn-next-question');

        // TODO
        fetch("http://localhost:4000/save-data", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        }).then(res => {
            console.log("Request complete! response:", res);
            if (res.status == 200) {
                setTimeout(() => {
                    buttonNextQuestion && buttonNextQuestion.click();
                }, 300);
            } else {
                window.alert('xxxxxxxxxxxxxxxxxxxxxxx')
            }
        });
        return question;
    } else {
        let input = formElement.querySelector('#answer-options input');
        input && input.click();
        let showAnswerElement = formElement.querySelector('a[href="?show_explanation=true"]')
        showAnswerElement && showAnswerElement.click();
    }
    return null;
}

async function getQuestion(formElement, explanationElement) {
    let button = formElement.querySelector('#question-aid button');
    let modalId = '';
    if (button) {
        modalId = button.getAttribute('data-target');
        button.click();
    }
    await sleep(1000);
    let imageElement = modalId ? document.querySelector(modalId + ' img') : null;
    let image = imageElement && imageElement.getAttribute('src') || '';
    let paragraphElement = modalId ? document.querySelector(modalId + ' .markdown-content') : null;
    let paragraph = paragraphElement && paragraphElement.innerHTML || '';
    let questionElement = formElement.querySelector('#question-text');
    let answersElement = formElement.querySelector('#answer-options');
    let text = questionElement.querySelector('.markdown-content').innerHTML;
    let answers = Object.values(answersElement.querySelectorAll('.markdown-content')).map(e => e.innerHTML.replace('\n', ''));
    let explanationContentElement = explanationElement.querySelectorAll('.markdown-content');
    let explanation = '', correctAnswer = '';
    if (explanationContentElement.length == 2) {
        explanation = explanationContentElement[explanationContentElement.length - 1].innerHTML;
        correctAnswer = explanationContentElement[explanationContentElement.length - 2].innerHTML;
    } else if (explanationContentElement.length == 1) {
        explanation = explanationContentElement[0].innerHTML;
        let x = answersElement.querySelector('input[checked="checked"]');
        if (x) {
            correctAnswer = x.parentElement.querySelector('.markdown-content').innerHTML
        }
    }
    return {
        id: getQuestionId(),
        topicName: getTopicName(),
        text: text.replace('\n', ''),
        answer: answers,
        explanation: explanation.replace('\n', ''),
        correctAnswer: correctAnswer.replace('\n', ''),
        image: image.replace('\n', ''),
        paragraph: paragraph.replace('\n', ''),
    }
}