import type {addItem} from 'react-native-dev-menu';

type ReactNativeDevMenuMock = {
    addItem: typeof addItem;
};

const reactNativeDevMenuMock: ReactNativeDevMenuMock = {
    addItem: jest.fn(),
};

export default reactNativeDevMenuMock;
