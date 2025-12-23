// Mock implementation of marked for Jest tests
module.exports = {
  marked: jest.fn((text) => Promise.resolve(`<p>${text}</p>`)),
};
