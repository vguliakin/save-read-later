import {
  getSelectedTextList,
  clearSelectedTextList,
} from './storage.js';
import { displayList, resetList } from './text_list.js';

document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.querySelector('ul');
  const emptyList = document.querySelector('#empty_list');
  const btnReset = document.querySelector('.btn_reset');

  getSelectedTextList((selectedTextList) => {
    displayList(selectedTextList, listElement, emptyList);
  });

  btnReset.addEventListener('click', () => {
    clearSelectedTextList(() => {
      emptyList.classList.remove('disabled');
      resetList();
    });
  });
});
