import {renderHook} from '@testing-library/react-native';

import useLastFocusedValue from '@hooks/useLastFocusedValue';

let mockIsFocused = true;
jest.mock('@hooks/useIsScreenFocused', () => ({
    __esModule: true,
    default: () => mockIsFocused,
}));

let mockShouldUseNarrowLayout = false;
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

type HookProps = {value: number | undefined};

function renderBankAccountIDHook(initialBankAccountID: number | undefined) {
    const initialProps: HookProps = {value: initialBankAccountID};
    return renderHook(({value}: HookProps) => useLastFocusedValue(value), {initialProps});
}

describe('useLastFocusedValue', () => {
    beforeEach(() => {
        mockIsFocused = true;
        mockShouldUseNarrowLayout = false;
    });

    it('returns the live value while the screen has focus', () => {
        // Given a focused screen showing a banner for bank account 1
        const {result, rerender} = renderBankAccountIDHook(1);

        // When the banner's bank account changes
        rerender({value: 2});

        // Then the change shows right away, because the user is looking at the screen
        expect(result.current).toBe(2);
    });

    it('keeps the last focused value while another screen covers it', () => {
        // Given a focused screen showing a banner for bank account 1
        const {result, rerender} = renderBankAccountIDHook(1);

        // When the RHP covers the screen and saving onboarding there retires the banner
        mockIsFocused = false;
        rerender({value: undefined});

        // Then the banner stays, so it doesn't vanish behind the RHP
        expect(result.current).toBe(1);
    });

    it('catches up once the screen is focused again', () => {
        // Given a covered screen that kept bank account 1 while the banner was retired
        const {result, rerender} = renderBankAccountIDHook(1);
        mockIsFocused = false;
        rerender({value: undefined});

        // When the RHP closes and the screen is focused again
        mockIsFocused = true;
        rerender({value: undefined});

        // Then the banner goes away, along with the RHP closing
        expect(result.current).toBeUndefined();

        // And it stays gone if the screen is covered again later
        mockIsFocused = false;
        rerender({value: undefined});
        expect(result.current).toBeUndefined();
    });

    it('returns the live value on narrow layout even while another screen covers it', () => {
        // Given a narrow layout screen showing a banner for bank account 1
        mockShouldUseNarrowLayout = true;
        const {result, rerender} = renderBankAccountIDHook(1);

        // When the full screen RHP covers it and saving onboarding there retires the banner
        mockIsFocused = false;
        rerender({value: undefined});

        // Then the banner goes away while hidden, so it doesn't jump as the user navigates back
        expect(result.current).toBeUndefined();
    });
});
