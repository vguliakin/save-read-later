import { updateSelectedTextList } from './storage.js';

let currentEditingItem = null;
/**
 * Displays a list of texts on the UI (popup window).
 * If the list is empty, it will display message that the list is empty.
 *
 * @param {Array<string>} list - The list of texts to display.
 * @param {HTMLElement} listElement - The HTML element where the list items will be added.
 * @param {HTMLElement} emptyListElement - The HTML element shown a message when the list is empty.
 * @returns {void}
 */
export function displayList(list, listElement, emptyListElement) {
  if (!list || list.length === 0) {
    emptyListElement.classList.remove('disabled');
  } else {
    emptyListElement.classList.add('disabled');
    list.forEach((text, index) => {
      cloneText(text, index, listElement);
    });
  }
}

/**
 * Reset the entire list of selected texts.
 *
 * @returns {void}
 */
export function resetList() {
  const listElement = document.querySelector('#notes-list');
  listElement.innerHTML = '';
}

/**
 * Clones a template list item and updates it with the selected text.
 * Sets up a delete button event listener to remove the item from the list.
 *
 * @param {String} text - The text to display in the list item.
 * @param {Number} index - The index of the text in the list, used for indentify the item to delete.
 * @param {HTMLElement} listElement - The HTML element to which the cloned item will be appended.
 * @returns {HTMLElement} - Returns the list item which was created.
 *
 * @todo Seperate the logic of creating items and setting up the buttons
 */
export function cloneText(text, index, listElement) {
  const template = document.querySelector('#li_template');
  const element = template.content.cloneNode(true);

  const listItem = element.querySelector('li');
  const btnDelete = element.querySelector('.delete-btn');
  const btnEdit = element.querySelector('.edit-btn');

  btnDelete.addEventListener('click', () => deleteText(index, listItem));
  btnEdit.addEventListener('click', () =>
    editNote(index, listItem, text, listElement)
  );

  listItem.addEventListener('mouseenter', () => {
    listItem.classList.add('.hover');
  });

  listItem.addEventListener('mouseleave', () => {
    listItem.classList.remove('.hover');
  });

  listItem.addEventListener('click', () => {
    document
      .querySelectorAll('.note')
      .forEach((n) => n.classList.remove('selected'));

    listItem.classList.add('selected');
  });

  listItem.querySelector('.note-text').textContent = text;
  listElement.appendChild(element);

  return listItem;
}

function editNote(i, ee, text, li) {
  const template = document.querySelector('#edit_template');
  const element = template.content.firstElementChild.cloneNode(true);

  const inputField = element.querySelector('.text-input');
  const btnSave = element.querySelector('.save-btn');
  const btnCancel = element.querySelector('.cancel-btn');

  inputField.value = text;

  if (currentEditingItem) {
    const { originalItem, parentElement } = currentEditingItem;

    parentElement.replaceChild(originalItem, currentEditingItem.editElement);
    currentEditingItem = null;
  }

  ee.replaceWith(element);

  currentEditingItem = {
    originalItem: ee,
    parentElement: li,
    editElement: element,
  };

  btnSave.addEventListener('click', () => {
    const updatedText = inputField.value;

    chrome.storage.local.get({ selectedTextList: [] }, (data) => {
      const updatedList = data.selectedTextList;
      updatedList[i] = updatedText;

      updateSelectedTextList(updatedList, () => {
        resetList(li);
        displayList(updatedList, li, document.querySelector('#empty_list'));

        currentEditingItem = null;
      });
    });
  });

  btnCancel.addEventListener('click', () => {
    element.replaceWith(ee);

    currentEditingItem = null;
  });
}

/**
 * Deletes a text item from the selectedTextList stored in Chrome's local storage.
 * Updates the UI to reflect the changes by removing the list item and enabling the
 * "empty list" message if no items remain.
 *
 * @param {*} index
 * @param {*} listItem
 *
 * @todo Seperate the code on two functions, one for storage logic another for UI logic
 */
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
