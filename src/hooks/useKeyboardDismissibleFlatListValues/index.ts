function useKeyboardDismissibleFlatListValues() {
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

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: jest.fn().mockReturnValue({
            keyboardHeight: createMockSharedValue(0),
            keyboardOffset: createMockSharedValue(0),
            scrollY: createMockSharedValue(0),
            onScroll: mockScrollHandler,
            contentSizeHeight: createMockSharedValue(0),
            layoutMeasurementHeight: createMockSharedValue(0),
            setListBehavior: mockSetListBehavior,
        }),
    };
}

export default useKeyboardDismissibleFlatListValues;
