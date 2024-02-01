import type {addItem} from 'react-native-dev-menu';

type ReactNativeDevMenu = {
    addItem: typeof addItem;
};

const ReactNativeDevMenuMock: ReactNativeDevMenu = {
    addItem: jest.fn(),
};

export default ReactNativeDevMenuMock;
