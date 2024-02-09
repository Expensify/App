// This mock is required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules

const Reanimated = require('react-native-reanimated/mock');

Reanimated.default.call = () => {};
module.exports = Reanimated;
