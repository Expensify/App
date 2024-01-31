type ReactNativePdfMock = {
    DocumentDir: jest.Mock;
    ImageCache: jest.Mock;
};

const reactNativePdfMock: ReactNativePdfMock = {
    DocumentDir: jest.fn(),
    ImageCache: jest.fn(),
};

export default reactNativePdfMock;
