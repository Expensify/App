const provider = {
    createAsyncRunner: jest.fn(),
    createRuntimeForThread: jest.fn(() => ({setOnFrameCallback: jest.fn(), setOnDepthFrameCallback: jest.fn()})),
    bindUIUpdatesToController: jest.fn(() => ({remove: jest.fn()})),
};

// eslint-disable-next-line import/prefer-default-export -- mirrors the package, which exports `provider` by name
export {provider};
