import { getNotes, clearNotes } from '../utils/storage.js';
import { displayList, resetList } from './text_list.js';

document.addEventListener('DOMContentLoaded', async () => {
  const notesListElement = document.querySelector('#notes-list');
  const labelEmptyList = document.querySelector('#empty_list');
  const btnReset = document.querySelector('.btn_reset');

  try {
    const selectedTextList = await getNotes();
    resetList();
    displayList(selectedTextList, notesListElement, labelEmptyList);
  } catch (err) {
    console.error('Error loading notes: ', err);
    labelEmptyList.classList.remove('disabled');
  }

  btnReset.addEventListener('click', async () => {
    try {
      await clearNotes();
      resetList();
      labelEmptyList.classList.remove('disabled');
    } catch {
      console.error('Error clearing notes:', error);
    }
  });
});
