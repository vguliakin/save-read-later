

export function checkLastError(error, error_type) {
  if (error) {
    console.error(error_type, error.message);
    return;
  }
}

export function checkExistingInStorage(data) {
  if (!data || data.selectedTextList === undefined) {
    console.error("The selected text doesn't exist in storage");
    return;
  }
}