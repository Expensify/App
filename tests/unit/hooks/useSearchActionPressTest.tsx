import {renderHook} from '@testing-library/react-native';

import useSearchActionPress, {EMPTY_SEARCH_ACTION_INPUTS} from '@hooks/useSearchActionPress';

import CONST from '@src/CONST';

const mockInterceptSearchSubmitPress = jest.fn<boolean, [string | undefined]>();
const mockReadSearchActionInputs = jest.fn();

jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({
    useSearchSubmitPopoverGuard: () => ({interceptSearchSubmitPress: mockInterceptSearchSubmitPress}),
}));

jest.mock('@hooks/usePaymentContext', () => ({
    __esModule: true,
    default: () => ({readSearchActionInputs: mockReadSearchActionInputs}),
}));

const PRESS_TIME_INPUTS = {...EMPTY_SEARCH_ACTION_INPUTS, amountOwed: 1234};

describe('useSearchActionPress', () => {
    beforeEach(() => {
        mockInterceptSearchSubmitPress.mockReset().mockReturnValue(false);
        mockReadSearchActionInputs.mockReset().mockResolvedValue(PRESS_TIME_INPUTS);
    });

    it('intercepts the press before the first await when the submit-to popover just closed', async () => {
        // Given this press just dismissed the submit-to popover, so the intercept reports it
        mockInterceptSearchSubmitPress.mockReturnValue(true);
        const {result} = renderHook(() => useSearchActionPress());

        // When the row reads its press-time inputs for Submit
        const pendingInputs = result.current(CONST.SEARCH.ACTION_TYPES.SUBMIT);

        // Then the intercept ran before the first await, ahead of the microtask that resets the flag
        expect(mockInterceptSearchSubmitPress).toHaveBeenCalledTimes(1);
        expect(mockInterceptSearchSubmitPress).toHaveBeenCalledWith(CONST.SEARCH.ACTION_TYPES.SUBMIT);
        await expect(pendingInputs).resolves.toBeUndefined();
        expect(mockReadSearchActionInputs).not.toHaveBeenCalled();
    });

    it('reads the inputs once for an action that uses them', async () => {
        // Given no popover to intercept the press and a Submit action
        const {result} = renderHook(() => useSearchActionPress());

        // When the row reads its press-time inputs
        const inputs = await result.current(CONST.SEARCH.ACTION_TYPES.SUBMIT);

        // Then the shared reader ran once and its values reach the row
        expect(mockReadSearchActionInputs).toHaveBeenCalledTimes(1);
        expect(inputs).toEqual(PRESS_TIME_INPUTS);
    });

    it('skips the read for an action that only navigates', async () => {
        // Given no popover to intercept the press and a View action
        const {result} = renderHook(() => useSearchActionPress());

        // When the row reads its press-time inputs
        const inputs = await result.current(CONST.SEARCH.ACTION_TYPES.VIEW);

        // Then the hook skips the read and returns the empty inputs, so the handler call keeps one shape
        expect(mockReadSearchActionInputs).not.toHaveBeenCalled();
        expect(inputs).toBe(EMPTY_SEARCH_ACTION_INPUTS);
    });
});
