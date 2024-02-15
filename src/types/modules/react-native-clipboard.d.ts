declare module '@react-native-clipboard/clipboard/jest/clipboard-mock' {
    const mockClipboard: {
        getString: jest.MockedFunction<() => Promise<string>>;
        getImagePNG: jest.MockedFunction<() => void>;
        getImageJPG: jest.MockedFunction<() => void>;
        setImage: jest.MockedFunction<() => void>;
        setString: jest.MockedFunction<() => void>;
        hasString: jest.MockedFunction<() => Promise<boolean>>;
        hasImage: jest.MockedFunction<() => Promise<boolean>>;
        hasURL: jest.MockedFunction<() => Promise<boolean>>;
        addListener: jest.MockedFunction<() => void>;
        removeAllListeners: jest.MockedFunction<() => void>;
        useClipboard: jest.MockedFunction<() => [string, jest.MockedFunction<() => void>]>;
    };
    export default mockClipboard;
}
