
const emptyList = document.querySelector('#empty_list');

export function deleteText(index, listItem) {
  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    const updatedList = data.selectedTextList;

    if (updatedList && index > -1) {
      updatedList.splice(index, 1);

      console.log('Item:', index, 'was deleted');

      chrome.storage.local.set({ selectedTextList: updatedList }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error updating storage:', chrome.runtime.lastError);
          return;
        }

        if (updatedList.length === 0) {
          emptyList.classList.remove('disabled');
        }

        listItem.remove();
      });
    }
  });
}

export function resetList() {
  const lists = document.querySelectorAll('li');
  lists.forEach((elem) => {
    elem.remove();
  });
}
