/**
 * @jest-environment jest-environment-jsdom
 */

const { showToast } = require('../../src/scripts/content');


describe('showToast', () => {
 beforeEach(() => {
  document.body.innerHTML = '';
  jest.useFakeTimers();
 });

 afterEach(() => {
  jest.useRealTimers();
 });

 it('should create and remove a toast', () => {
  const message = "Cool beans";
  showToast(message);

  const toast = document.querySelector('.toast');
  
  expect(toast).not.toBeNull();
  expect(toast.textContent).toBe("Cool beans");

  expect(toast.classList.contains('hide')).toBe(false);

  jest.advanceTimersByTime(3000);
  expect(toast.classList.contains('hide')).toBe(true);

  jest.advanceTimersByTime(500);
  expect(document.querySelector('.toast')).toBeNull();
 });


});