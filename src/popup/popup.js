import { getSelectedTextList, clearSelectedTextList } from './storage.js';
import { displayList, resetList } from './text_list.js';

document.addEventListener('DOMContentLoaded', () => {
  const notesListElement = document.querySelector('#notes-list');
  const labelEmptyList = document.querySelector('#empty_list');
  const btnReset = document.querySelector('.btn_reset');

  getSelectedTextList((selectedTextList) => {
    resetList();
    displayList(selectedTextList, notesListElement, labelEmptyList);
  });

  btnReset.addEventListener('click', () => {
    clearSelectedTextList(() => {
      labelEmptyList.classList.remove('disabled');
      resetList();
    });
  });
});
