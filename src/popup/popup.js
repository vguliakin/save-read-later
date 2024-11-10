const template = document.querySelector("#li_template");
const emptyList = document.querySelector("#empty_list");
const btnReset = document.querySelector(".btn_reset");

document.addEventListener("DOMContentLoaded", () => {
  const listElement = document.querySelector("ul");

  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    displayList(data.selectedTextList);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.selectedTextList) {
      displayList(changes.selectedTextList.newValue);
    }
  });

  function displayList(list) {
    console.log(list);
    if (list && list.length === 0) {
      emptyList.classList.remove('disabled');
    } else if (!list) {
      const lists = document.querySelectorAll("li");
      lists.forEach((elem) => {
        elem.remove();
      });
    } else {
      emptyList.classList.add('disabled');
      list.forEach((text) => {
        cloneText(text);
      });
    }
  }

  function cloneText(text) {  
    const element = template.content.cloneNode(true);
    element.querySelector(".selectedText").textContent = text;
  listElement.appendChild(element);
  }
});

btnReset.addEventListener("click", () => {
  chrome.storage.local.remove("selectedTextList", () => {
    if (chrome.runtime.lastError) {
      console.error("Error removing key:", chrome.runtime.lastError);
    }
  });
});
