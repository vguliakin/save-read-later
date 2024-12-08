const { setupContextMenu, handleContextMenuClick } = require('../src/background');

// Helper function to reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('setupContextMenu', () => {
  it('should create a context menu with the correct parameters', () => {
    setupContextMenu();
    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: 'saveToBrain',
      title: 'Add random color to Popup',
      contexts: ['selection'],
    });
  });
});

describe('handleContextMenuClick', () => {
  it('should save selected text to chrome.storage.local and send a message', () => {
    // Arrange
    const info = {
      menuItemId: 'saveToBrain',
      selectionText: 'My selected text',
    };
    const tab = { id: 123 };

    // Mock the storage get call to return an empty list initially
    chrome.storage.local.get.mockImplementation((_, callback) => {
      callback({ selectedTextList: [] });
    });

    // Mock the storage set call to simulate successful saving
    chrome.storage.local.set.mockImplementation((_, callback) => {
      callback(); 
    });

    // Act
    handleContextMenuClick(info, tab);

    // Assert: Ensure we fetched existing data
    expect(chrome.storage.local.get).toHaveBeenCalledWith({ selectedTextList: [] }, expect.any(Function));

    // Assert: Ensure we set new data correctly
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { selectedTextList: ['My selected text'] },
      expect.any(Function)
    );

    // Assert: Ensure we send a message to the tab
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
      action: 'showFeedback',
      text: 'My selected text',
    });
  });

  it('should not do anything if no selection text is provided', () => {
    const info = { menuItemId: 'saveToBrain', selectionText: '' };
    const tab = { id: 456 };

    handleContextMenuClick(info, tab);
    // If no selectionText, we expect no storage calls and no sendMessage calls
    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
  });

  it('should log an error if setting data fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const info = { menuItemId: 'saveToBrain', selectionText: 'Fail test' };
    const tab = { id: 789 };

    chrome.storage.local.get.mockImplementation((_, callback) => {
      callback({ selectedTextList: ['existing'] });
    });

    // Simulate runtime error
    chrome.runtime.lastError = { message: 'Storage error' };

    chrome.storage.local.set.mockImplementation((_, callback) => {
      callback(); // callback triggers the error check
    });

    handleContextMenuClick(info, tab);

    // Ensure it logs the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error saving data:',
      'Storage error'
    );

    consoleErrorSpy.mockRestore();
  });
});
