import { getSelectedTextList, updateSelectedTextList } from './storage.js';

let currentEditingItem = null;

/**
 * Displays a list of texts on the UI (popup window).
 * If the list is empty, it will display message that the list is empty.
 *
 * @param {Array<string>} selectedTextList - The list of texts to display.
 * @param {HTMLElement} notesListElement - The HTML element where the list items will be added.
 * @param {HTMLElement} labelEmptyList - The label shows a message when the list is empty.
 * @returns {void}
 */
export function displayList(
  selectedTextList,
  notesListElement,
  labelEmptyList
) {
  if (!selectedTextList || selectedTextList.length === 0) {

    labelEmptyList.classList.remove('disabled');

  } else {
    labelEmptyList.classList.add('disabled');

    selectedTextList.forEach((text, index) => {
      cloneText(text, index, notesListElement);
    });
  }
}

/**
 * Reset the entire list of selected texts.
 *
 * @returns {void}
 */
export function resetList() {
  const notesListElement = document.querySelector('#notes-list');
  notesListElement.innerHTML = '';
}

/**
 * Clones a template list item and updates it with the selected text.
 * Sets up a delete button event listener to remove the item from the list.
 *
 * @param {String} text - The text to display in the list item.
 * @param {Number} index - The index of the text in the list, used for indentify the item to delete.
 * @param {HTMLElement} notesListElement - The HTML element to which the cloned item will be appended.
 * @returns {HTMLElement} - Returns the list item which was created.
 *
 * @todo Seperate the logic of creating items and setting up the buttons
 */
export function cloneText(text, index, notesListElement) {
  // UI Note Template
  const template = document.querySelector('#li_template');
  const noteElement = template.content.cloneNode(true);

  // UI List of Notes
  const listElement = noteElement.querySelector('li');

  // UI Buttons
  const deleteButton = noteElement.querySelector('.delete-btn');
  const editButton = noteElement.querySelector('.edit-btn');

  // Sets the selected text as a Note
  listElement.querySelector('.note-text').textContent = text;

  // Button Handlers
  deleteButton.addEventListener('click', () =>
    deleteHandler(index, listElement)
  );
  editButton.addEventListener('click', () =>
    editHandler(index, listElement, text, notesListElement)
  );

  // Sets the CSS style for Notes element
  setNotesListUIBehavior(listElement);

  notesListElement.appendChild(noteElement);

  return listElement;
}

/**
 * Edit Handler that is triggered when the user clicks on 'Edit' button
 * and changes the status of the note to Edit
 *
 * @param {Number} index - The index of the text in the list, used for indentify the item to delete.
 * @param {HTMLElement} listElement - Note element with buttons and text
 * @param {String} text - The text to display in the list item.
 * @param {HTMLElement} notesListElement - The HTML element to which the cloned item will be appended.
 *
 */
function editHandler(index, listElement, text, notesListElement) {
  // UI Edit Template
  const template = document.querySelector('#edit_template');
  const noteEditElement = template.content.firstElementChild.cloneNode(true);

  // UI Edit Template Elements
  const inputField = noteEditElement.querySelector('.text-input');
  const btnSave = noteEditElement.querySelector('.save-btn');
  const btnCancel = noteEditElement.querySelector('.cancel-btn');

  inputField.value = text;

  // Checks whether any items are currently being edited
  resetLastEditNote();

  // Changes the state of the item to Edit
  changeStateToEdit(listElement, noteEditElement, notesListElement);

  inputField.style.height = inputField.scrollHeight + 'px';

  btnSave.addEventListener('click', () =>
    saveEditedNote(noteEditElement, inputField, index, listElement)
  );

  btnCancel.addEventListener('click', () => {
    noteEditElement.replaceWith(listElement);
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
function deleteHandler(index, listItem) {
  const emptyList = document.querySelector('#empty_list');

  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    let updatedList = data.selectedTextList;

    console.log("Before deletion:", updatedList);

    if (updatedList && index > -1 && index < updatedList.length) {
      updatedList.splice(index, 1);

      updateSelectedTextList(updatedList, () => {
        getSelectedTextList((latestList) => {
          resetList();
          displayList(latestList, document.querySelector('#notes-list'), emptyList);

          if (latestList.length === 0) {
            emptyList.classList.remove('disabled');
          }

        })

        listItem.remove();
        
        if (updatedList.length === 0) {
          emptyList.classList.remove('disabled');
        }
        console.log(`List = ${updatedList}`);
      });
    }
  });
}

function setNotesListUIBehavior(listElement) {
  listElement.addEventListener('mouseenter', () => {
    listElement.classList.add('.hover');
  });

  listElement.addEventListener('mouseleave', () => {
    listElement.classList.remove('.hover');
  });

  listElement.addEventListener('click', () => {
    document
      .querySelectorAll('.note')
      .forEach((n) => n.classList.remove('selected'));

    listElement.classList.add('selected');
  });
}

function resetLastEditNote() {
  if (currentEditingItem) {
    const { originalItem, parentElement } = currentEditingItem;

    // Ensure DOM elements are still valid
    if (originalItem && parentElement.contains(currentEditingItem.editElement)) {
      parentElement.replaceChild(originalItem, currentEditingItem.editElement);
    }

    currentEditingItem = null;
  }
}

function changeStateToEdit(listElement, noteEditElement, notesListElement) {
  listElement.replaceWith(noteEditElement);

  currentEditingItem = {
    originalItem: listElement,
    parentElement: notesListElement,
    editElement: noteEditElement,
  };
}

function showError(noteEditElement, message) {
  const existingError = noteEditElement.parentNode.querySelector('.error-message');

  if (existingError) {
    existingError.remove();
  }

  const errorMessage = document.createElement('span');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;

  noteEditElement.parentNode.appendChild(errorMessage);
}

function saveEditedNote(noteEditElement, inputField, index, listElement) {
  const updatedText = inputField.value.trim(); // Trim any extra spaces
  
  if (!updatedText) {
    showError(noteEditElement, 'Note text cannot be empty!');
    return
  } else {
    const existingError = noteEditElement.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    const updatedList = data.selectedTextList || [];

    // Update the text at the correct index
    const duplicateIndex = updatedList.findIndex(
      (item, i) => item === updatedText && i !== index
    );

    const originalText = updatedList[index];
    
    if (updatedText === originalText) {
      return;
    }

    updatedList[index] = updatedText;

    // if (duplicateIndex !== -1) {
    //   showError(noteEditElement, 'Note text cannot be empty!');
    //   return
    // }

    // if (updatedList.includes(updatedText)) {
    //   showError(noteEditElement, 'Note text cannot be empty!');
    //   return
    // }
  
    updateSelectedTextList(updatedList, () => {

      if (chrome.runtime.lastError) {
        showError(noteEditElement, 'Failed to save note. Please try again.');
        return;
      }

      const updatedListElement = cloneText(
        updatedText,
        index,
        listElement
      );

      noteEditElement.replaceWith(updatedListElement);

      // resetList(notesListElement);
      // displayList(updatedList, notesListElement, document.querySelector('#empty_list'));

      currentEditingItem = null;
    });
  });
}
