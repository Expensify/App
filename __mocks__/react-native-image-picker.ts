type ReactNativeImagePicker = {
    showImagePicker: jest.Mock;
    launchCamera: jest.Mock;
    launchImageLibrary: jest.Mock;
};

const ReactNativeImagePickerMock: ReactNativeImagePicker = {
    showImagePicker: jest.fn(),
    launchCamera: jest.fn(),
    launchImageLibrary: jest.fn(),
};

export default ReactNativeImagePickerMock;
