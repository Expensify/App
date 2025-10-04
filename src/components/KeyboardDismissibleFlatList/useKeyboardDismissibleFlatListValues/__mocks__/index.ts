const createMockSharedValue = (initialValue = 0) => ({
    value: initialValue,
    get: jest.fn().mockReturnValue(initialValue),
    set: jest.fn(),
    addListener: jest.fn().mockReturnValue(0),
    removeListener: jest.fn(),
    modify: jest.fn(),
});

const mockScrollHandler = jest.fn();
const mockSetListBehavior = jest.fn();

const mockContextValue = {
    keyboardHeight: createMockSharedValue(0),
    keyboardOffset: createMockSharedValue(0),
    scrollY: createMockSharedValue(0),
    onScroll: mockScrollHandler,
    contentSizeHeight: createMockSharedValue(0),
    layoutMeasurementHeight: createMockSharedValue(0),
    setListBehavior: mockSetListBehavior,
};

const mockUseKeyboardDismissibleFlatListValues = jest.fn().mockReturnValue(mockContextValue);

export default mockUseKeyboardDismissibleFlatListValues;
