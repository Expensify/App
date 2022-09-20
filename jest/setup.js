import fs from 'fs';
import path from 'path';
import 'react-native-gesture-handler/jestSetup';
import _ from 'underscore';

require('react-native-reanimated/lib/reanimated2/jestUtils').setUpTests();

jest.mock('react-native-blob-util', () => ({}));

// These two mocks are required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

// The main app uses a NativeModule called BootSplash to show/hide a splash screen. Since we can't use this in the node environment
// where tests run we simulate a behavior where the splash screen is always hidden (similar to web which has no splash screen at all).
jest.mock('../src/libs/BootSplash', () => ({
    hide: jest.fn(),
    getVisibilityStatus: jest.fn().mockResolvedValue('hidden'),
}));

// Local notifications (a.k.a. browser notifications) do not run in native code. Our jest tests will also run against
// any index.native.js files as they are using a react-native plugin. However, it is useful to mock this behavior so that we
// can test the expected web behavior and see if a browser notification would be shown or not.
jest.mock('../src/libs/Notification/LocalNotification', () => ({
    showCommentNotification: jest.fn(),
}));

/**
 * @param {String} imagePath
 */
function mockImages(imagePath) {
    const imageFilenames = fs.readdirSync(path.resolve(__dirname, `../assets/${imagePath}/`));
    // eslint-disable-next-line rulesdir/prefer-early-return
    _.each(imageFilenames, (fileName) => {
        if (/\.svg/.test(fileName)) {
            jest.mock(`../assets/${imagePath}/${fileName}`, () => () => '');
        }
    });
}

// We are mocking all images so that Icons and other assets cannot break tests. In the testing environment, importing things like .svg
// directly will lead to undefined variables instead of a component or string (which is what React expects). Loading these assets is
// not required as the test environment does not actually render any UI anywhere and just needs them to noop so the test renderer
// (which is a virtual implemented DOM) can do it's thing.
mockImages('images');
mockImages('images/avatars');
mockImages('images/bankicons');
mockImages('images/product-illustrations');
jest.mock('../src/components/Icon/Expensicons', () => {
    const reduce = require('underscore').reduce;
    const Expensicons = jest.requireActual('../src/components/Icon/Expensicons');
    return reduce(Expensicons, (prev, _curr, key) => {
        // We set the name of the anonymous mock function here so we can dynamically build the list of mocks and access the
        // "name" property to use in accessibility hints for element querying
        const fn = () => '';
        Object.defineProperty(fn, 'name', {value: key});
        return {...prev, [key]: fn};
    }, {});
});
