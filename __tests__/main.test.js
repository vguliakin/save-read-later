
const { myFunc } = require("../src/main");

it('My First Test', () => 
    expect(myFunc(3, 3)).toBe(6)
);