import { updateSelectedTextList } from "./storage.js";

let draggedItem = null;

export function enableDragAndDrop(notesListElement) {
  notesListElement.addEventListener('dragstart', (e) => {
    if (e.target && e.target.classList.contains('note')) {
      draggedItem = e.target;
      e.target.classList.add('dragging');
    }
  });

  notesListElement.addEventListener('dragover', (e) => {
    e.preventDefault();

    const target = e.target;
    if (target && target.classList.contains('note') && target !== draggedItem) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) > rect.height / 2;

      notesListElement.insertBefore(draggedItem, next ? target.nextSibling : target);
    }
  });

  notesListElement.addEventListener('drop', () => {
    draggedItem.classList.remove('dragging');
    draggedItem = null;

    saveNewNotesOrder(notesListElement);
  });

  notesListElement.addEventListener('dragend', () => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
  });
}

function saveNewNotesOrder(notesListElement) {
  const updatedList = Array.from(notesListElement.querySelectorAll('.note'))
    .map((note) => note.querySelector('.note-text').textContent);

  updateSelectedTextList(updatedList, () => {
    console.log('New order saved:', updatedList);
  });
}