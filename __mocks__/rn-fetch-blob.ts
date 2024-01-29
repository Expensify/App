type RnFetchBlob = {
    DocumentDir: jest.Mock;
    ImageCache: jest.Mock;
};

const RnFetchBlobMock: RnFetchBlob = {
    DocumentDir: jest.fn(),
    ImageCache: jest.fn(),
};

export default RnFetchBlobMock;
