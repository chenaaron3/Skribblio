console.log("CONTENT APPEARED!")

let newPage = true;
let choices = [];
let ready = true;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "getCurrentWord") {
            let wordDiv = document.getElementById("currentWord");
            sendResponse({ currentWord: wordDiv.textContent });
        }
        else if (request.action === "tryWord") {
            let chatInput = document.getElementById("inputChat");
            chatInput.value = request.word;
            sendResponse({})
        }
        else if (request.action === "initChatInput") {
            if (!newPage) {
                return;
            }
            newPage = false;
            let chatInput = document.getElementById("inputChat");
            chatInput.addEventListener("keyup", function(event) {
                if (event.key === "Enter") {
                    if(choices.length > 0) {
                        if (ready) {
                            ready = false;
                            chatInput.value = choices.shift();
                            setTimeout(() => {
                                ready = true;
                            }, 1000);
                        }
                    }
                }
            });
            sendResponse({chatInput: chatInput})
        }
        else if (request.action === "setChoices") {
            choices = request.choices;
        }
    }
);