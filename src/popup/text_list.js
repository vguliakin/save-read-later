import { saveNotes, getNotes } from '../utils/storage.js';
import { enableDragAndDrop } from './dragAndDrop.js';

/** @type {HTMLElement|null} */
let currentEditingItem = null;

/**
 * Displays a list of notes in the popup
 *
 * @param {{id: string, text: string, url: string}[]} notesList - The list of texts to display.
 * @param {HTMLElement} notesListElement - The HTML element where the list items will be added.
 * @param {HTMLElement} labelEmptyList - The label shows a message when the list is empty.
 */
export function displayList(notesList, notesListElement, labelEmptyList) {
  if (!notesList || notesList.length === 0) {
    labelEmptyList.classList.remove('disabled');
  } else {
    labelEmptyList.classList.add('disabled');

    notesList.forEach((noteObj) => {
      const listItem = createNoteElement(noteObj);
      notesListElement.appendChild(listItem);
    });

    enableDragAndDrop(notesListElement);
    attachGlobalEventHandlers(notesListElement);
  }
}

/**
 * Remove all notes from the list.
 */
export function resetList() {
  const notesListElement = document.querySelector('#notes-list');
  notesListElement.innerHTML = '';
}

/**
 * Creates a note element from the template.
 * @param {{id: string, text: string, url: string}[]} noteObj
 */
function createNoteElement(noteObj) {
  const template = document.querySelector('#note_item_template');
  const noteElement = template.content.cloneNode(true);
  const li = noteElement.querySelector('li');

  li.dataset.noteId = noteObj.id;
  li.querySelector('.note-text').textContent = noteObj.text;
  li.dataset.url = noteObj.url;

  if (noteObj.image) {
    const img = document.createElement('img');
    img.src = noteObj.image;
    img.style.maxWidth = '100%';
    li.insertBefore(img, li.querySelector('.note-actions'));
  }

  return li;
}

/**
 * Switches a note element to the edit mode by replacing it with the edit template.
 *
 * @param {HTMLElement} originalItem
 * @param {string} text
 */
function switchToEditMode(originalItem, text) {
  resetLastEditNote();

  const template = document.querySelector('#edit_item_template');
  const editElement = template.content.cloneNode(true);

  const editListElement = editElement.querySelector('li');
  const inputField = editListElement.querySelector('.text-input');

  editListElement.dataset.noteId = originalItem.dataset.noteId;

  originalItem.replaceWith(editListElement);

  inputField.value = text;
  inputField.style.height = inputField.scrollHeight + 'px';

  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // disable newline insertion
      const original = currentEditingItem?.originalItem;
      saveEditedNote(editListElement, inputField, original);
    }
  });

  currentEditingItem = {
    originalItem,
    parentElement: originalItem.parentElement,
    editElement: editListElement,
  };
}

/**
 * Resets the last edit note to its original state if any exists.
 */
function resetLastEditNote() {
  if (
    currentEditingItem &&
    currentEditingItem.parentElement.contains(currentEditingItem.editElement)
  ) {
    currentEditingItem.editElement.replaceWith(currentEditingItem.originalItem);
    currentEditingItem = null;
  }
}

/**
 * Shows an error message below the input field.
 *
 * @param {HTMLTextAreaElement} inputField
 * @param {string} message
 */
function showError(inputField, message) {
  const existingError = inputField.parentNode.querySelector('.error-message');

  if (existingError) existingError.remove();

  const errorMessage = document.createElement('span');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;
  inputField.parentNode.appendChild(errorMessage);
}

/**
 *
 * @param {HTMLElement} editListElement
 * @param {HTMLTextAreaElement} inputField
 * @param {HTMLElement} originalItem
 */
async function saveEditedNote(editListElement, inputField, originalItem) {
  const updatedText = inputField.value.trim();

  if (!updatedText) {
    showError(inputField, 'Note text cannot be empty!');
    return;
  }

  const noteId = editListElement.dataset.noteId;

  try {
    const notes = await getNotes();

    const noteIndex = notes.findIndex((n) => n.id === noteId);
    console.log(notes, noteId);
    console.log(noteIndex);
    if (noteIndex === -1) {
      console.error('Invalid note index');
      return;
    }

    // If text is the same as original, just revert back
    if (notes[noteIndex].text === updatedText) {
      editListElement.replaceWith(originalItem);
      currentEditingItem = null;
      return;
    }

    // Update the note text and save
    notes[noteIndex].text = updatedText;

    await saveNotes(notes);

    const notesListElement = document.querySelector('#notes-list');
    const labelEmptyList = document.querySelector('#empty_list');
    resetList();
    displayList(notes, notesListElement, labelEmptyList);

    currentEditingItem = null;
  } catch (err) {
    console.error('Error saving edited note: ', err);
    showError(inputField, 'Failed to save note. Please try again.');
  }
}

/**
 * Deletes a note by its unique ID.
 *
 * @param {string} noteId
 */
async function deleteNoteById(noteId) {
  try {
    const notes = await getNotes();
    const updateNotes = notes.filter((n) => n.id !== noteId);

    await saveNotes(updateNotes);

    resetList();
    displayList(
      updateNotes,
      document.querySelector('#notes-list'),
      document.querySelector('#empty_list')
    );
  } catch (err) {
    console.error('Error deleting note: ', err);
  }
}

/**
 * Attaches event delegation handlers for edit, delete, save, and cancel actions.
 *
 * @param {HTMLElement} notesListElement
 */
function attachGlobalEventHandlers(notesListElement) {
  notesListElement.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Select a note
    const noteLi = target.closest('.note, .edit-note');
    console.log('Clicked <li> dataset:', noteLi.dataset);
    console.log('Clicked noteId =', noteLi.dataset.noteId);

    if (!noteLi) return;

    // Clear selection of other notes
    if (noteLi.classList.contains('note')) {
      notesListElement
        .querySelectorAll('.note')
        .forEach((n) => n.classList.remove('selected'));
      noteLi.classList.add('selected');
    }

    if (target.classList.contains('source-btn')) {
      const noteUrl = noteLi.dataset.url;

      if (noteUrl) {
        chrome.tabs.create({ url: noteUrl });
      }
    }

    if (target.classList.contains('edit-btn')) {
      const text = noteLi.querySelector('.note-text').textContent;
      switchToEditMode(noteLi, text);
    }

    if (target.classList.contains('delete-btn')) {
      const noteId = noteLi.dataset.noteId;
      deleteNoteById(noteId);
    }

    if (target.classList.contains('save-btn')) {
      const inputField = noteLi.querySelector('.text-input');
      const originalItem = currentEditingItem?.originalItem;
      saveEditedNote(noteLi, inputField, originalItem);
    }

    if (target.classList.contains('cancel-btn')) {
      if (currentEditingItem) {
        currentEditingItem.editElement.replaceWith(
          currentEditingItem.originalItem
        );
        currentEditingItem = null;
      }
    }
  });
}
