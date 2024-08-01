// __mocks__/react-native-reanimated/index.js
const actualAnimated = jest.requireActual('react-native-reanimated/mock');

const mock = {
    ...actualAnimated,
    createAnimatedPropAdapter: jest.fn(),
    useReducedMotion: jest.fn(),
};

export default mock;
