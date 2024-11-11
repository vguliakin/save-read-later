import { deleteText, resetList } from './utils.js';

const template = document.querySelector('#li_template');
const emptyList = document.querySelector('#empty_list');
const btnReset = document.querySelector('.btn_reset');

document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.querySelector('ul');

  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving data:', chrome.runtime.lastError.message);
      return;
    }

    if (!data || data.selectedTextList === undefined) {
      console.error("The selected text doesn't exist in storage");
      return;
    }

    try {
      displayList(data.selectedTextList);
    } catch (e) {
      console.error('Something went wrong:', e);
    }
  });

  function addTextToList(list) {
    list.forEach((text, index) => {
      cloneText(text, index);
    });
  }

  function displayList(list) {
    if (!list || list.length === 0) {
      emptyList.classList.remove('disabled');
    } else {
      emptyList.classList.add('disabled');
      addTextToList(list);
    }
  }

  function cloneText(text, index) {
    const element = template.content.cloneNode(true);
    const listItem = element.querySelector('li');
    const btnDelete = element.querySelector('.delete-btn');

    btnDelete.addEventListener('click', () => deleteText(index, listItem));
    console.log('Item,', index, 'was created');

    element.querySelector('.selectedText').textContent = text;
    listElement.appendChild(element);
  }
});

btnReset.addEventListener('click', () => {
  chrome.storage.local.remove('selectedTextList', () => {
    if (chrome.runtime.lastError) {
      console.error('Error removing key:', chrome.runtime.lastError);
      return;
    }

    resetList();
    emptyList.classList.remove('disabled');
  });
});


