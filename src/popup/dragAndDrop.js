import { saveNotes } from '../utils/storage.js';

/**
 * Enables drag-and-drop reordering of notes.
 *
 * @param {HTMLElement} notesListElement
 */
export function enableDragAndDrop(notesListElement) {
  let draggedItem = null;

  notesListElement.addEventListener('dragstart', (e) => {
    if (e.target && e.target.classList.contains('note')) {
      draggedItem = e.target;
      draggedItem.classList.add('dragging');
    }
  });

  notesListElement.addEventListener('dragover', (e) => {
    e.preventDefault();

    const target = e.target.closest('.note');

    if (target && target !== draggedItem) {
      const rect = target.getBoundingClientRect();
      const next = e.clientY - rect.top > rect.height / 2;

      notesListElement.insertBefore(
        draggedItem,
        next ? target.nextSibling : target
      );
    }
  });

  notesListElement.addEventListener('drop', async () => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;

      await saveNewOrder(notesListElement);
    }
  });

  notesListElement.addEventListener('dragend', () => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;
    }
  });
}

/**
 * Saves the new order of notes after drag-and-drop.
 *
 * @param {HTMLElement} notesListElement
 */
async function saveNewOrder(notesListElement) {
  const noteElements = Array.from(notesListElement.querySelectorAll('.note'));
  const updatedNotes = noteElements.map((li) => {
    return {
      id: li.dataset.noteId,
      text: li.querySelector('.note-text').textContent,
    };
  });

  await saveNotes(updatedNotes);
}
