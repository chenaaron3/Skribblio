console.log("POPUP APPEARED")

function fillPopup() {
    let popup = document.getElementById('popup');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getCurrentWord" }, function (response) {
            // determine if there is an active game or not
            let currentWord = response.currentWord;
            if (currentWord) {
                let text = document.createElement('h1');
                text.innerHTML = "Current Word: " + currentWord;
                popup.appendChild(text);
                chrome.tabs.sendMessage(tabs[0].id, { action: "initChatInput" }, function (response) {});
                populateChoices(currentWord);
            }
            else {
                let text = document.createElement('h1');
                text.innerHTML = "No Active Game!";
                popup.appendChild(text)
            }
        });
    });
}

// finds choices based on currentWord
function populateChoices(currentWord) {
    let letterIndex = {};
    for (let i = 0; i < currentWord.length; ++i) {
        // if is a known letter
        if (currentWord.charAt(i) != "_") {
            letterIndex[i] = currentWord.charAt(i);
        }
    }
    // get public words
    fetch("https://skribbliohints.github.io/words.json")
        .then(response => response.json())
        .then(json => {
            let choices = []
            Object.keys(json).forEach(element => {
                // if same length
                if (element.length == currentWord.length) {
                    // if matches all hinted letters
                    let match = Object.keys(letterIndex).every(index => element.charAt(index) == letterIndex[index])
                    if (!match)
                        return;
                    choices.push(element)
                }
            });
            choices.sort(function (a, b) { return json[b].count - json[a].count });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "setChoices", choices: choices }, function (response) {
                });
            });
            choices.forEach(element => {
                // add element
                let choice = document.createElement('p');
                choice.innerHTML = `${element}\t${json[element].count}`;
                choice.onclick = () => {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "tryWord", word: element }, function (response) {
                        });
                    });
                };
                popup.appendChild(choice)
            })
        })
        .catch(err => console.log(err));
}

fillPopup();