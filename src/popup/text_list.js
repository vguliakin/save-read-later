import { updateSelectedTextList } from './storage.js';

export function displayList(list, listElement, emptyListElement) {
  if (!list || list.length === 0) {
    emptyListElement.classList.remove('disabled');
  } else {
    emptyListElement.classList.add('disabled');
    console.log(emptyListElement.classList);
    list.forEach((text, index) => {
      cloneText(text, index, listElement);
    });
  }
}

export function resetList() {
  const lists = document.querySelectorAll('li');
  lists.forEach((elem) => {
    elem.remove();
  });
}

export function cloneText(text, index, listElement) {
  const template = document.querySelector('#li_template');
  const element = template.content.cloneNode(true);
  const listItem = element.querySelector('li');
  const btnDelete = element.querySelector('.delete-btn');

  btnDelete.addEventListener('click', () => deleteText(index, listItem));

  element.querySelector('.selectedText').textContent = text;
  listElement.appendChild(element);
}

function deleteText(index, listItem) {
  const emptyList = document.querySelector('#empty_list');

  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    const updatedList = data.selectedTextList;

    if (updatedList && index > -1) {
      updatedList.splice(index, 1);

      updateSelectedTextList(updatedList, () => {
        if (updatedList.length === 0) {
          emptyList.classList.remove('disabled');
        }
        listItem.remove();
      });
    }
  });
}
