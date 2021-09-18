window.onload = () => {

	let questionElement = document.getElementById('question-id');
	let imageElement = document.getElementById('image-id');
	let hintElement = document.getElementById('hint-id');
	let correctAnswerElement = document.getElementById('correct-answer-id');
	let inCorrectAnswerElement = document.getElementById('incorrect-answer-id');
	let explanationElement = document.getElementById('explanation-id');
	let nextQuestionElement = document.getElementById('next-question-id');
	let previewPanel = document.getElementById("preview-panel");
	let clearDataButton = document.getElementById("clear-data");

	const getQuestionData = () => {
		let questionId = questionElement.value;
		let imageId = imageElement.value;
		let hintId = hintElement.value;
		let correctAnswerId = correctAnswerElement.value;
		let inCorrectAnswerId = inCorrectAnswerElement.value;
		let explanationId = explanationElement.value;
		let nextQuestionId = nextQuestionElement.value;
		return { questionId, hintId, imageId, correctAnswerId, inCorrectAnswerId, explanationId, nextQuestionId };
	}

	const setQuestionData = (data) => {
		let { questionId, hintId, imageId, correctAnswerId, inCorrectAnswerId, explanationId, nextQuestionId } = data;
		questionElement.value = questionId;
		imageElement.value = imageId;
		hintElement.value = hintId;
		correctAnswerElement.value = correctAnswerId;
		inCorrectAnswerElement.value = inCorrectAnswerId;
		explanationElement.value = explanationId;
		nextQuestionElement.value = nextQuestionId;
		chrome.storage.sync.set({ "data": data });
	}

	const onChangeQuestionKey = () => {
		let question = getQuestionData();
		console.log(question)
		setQuestionData(question);
	}

	questionElement.addEventListener("blur", onChangeQuestionKey);
	imageElement.addEventListener("blur", onChangeQuestionKey);
	hintElement.addEventListener("blur", onChangeQuestionKey);
	correctAnswerElement.addEventListener("blur", onChangeQuestionKey);
	inCorrectAnswerElement.addEventListener("blur", onChangeQuestionKey);
	explanationElement.addEventListener("blur", onChangeQuestionKey);
	nextQuestionElement.addEventListener("blur", onChangeQuestionKey);

	clearDataButton.addEventListener('click', () => {
		chrome.storage.sync.clear();
		setQuestionData({});
	})

	chrome.storage.sync.get("data", ({ data }) => {
		setQuestionData(data);
	});

	const onGetQuestion = () => {
		chrome.storage.sync.get("data", ({ data }) => {
			let questionData = getQuestionData();
			chrome.storage.sync.set({ "question": questionData });
		});
	}

	const onPreview = async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: onGetQuestion,
		});
		setTimeout(() => {
			chrome.storage.sync.get("question", ({ question }) => {
				previewPanel.innerHTML = Object.keys(question).map((key) => {
					return `
						<div class='q-item'>${key} : ${question[key]}</div>
					`;
				}).join('');
			});
		}, 500);
	}

	let previewButton = document.getElementById('preview-question');
	previewButton.addEventListener('click', onPreview);
}