import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import OptionListContextProvider, {useOptionsList} from '@components/OptionListContextProvider';
import useOnyx from '@hooks/useOnyx';
import {createOptionList} from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/OptionsListUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/OptionsListUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createOptionList: jest.fn(),
        processReport: jest.fn(() => ({reportOption: null})),
        createOptionFromReport: jest.fn(),
    };
});

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));

const mockCreateOptionList = createOptionList as jest.MockedFunction<typeof createOptionList>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUsePersonalDetails = usePersonalDetails as jest.MockedFunction<typeof usePersonalDetails>;

const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <OptionListContextProvider>{children}</OptionListContextProvider>;

describe('OptionListContextProvider', () => {
    let onyxState: Record<string, unknown>;
    let onyxSourceValues: Record<string, unknown>;

    beforeEach(() => {
        jest.clearAllMocks();

        onyxState = {
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'en'},
            [ONYXKEYS.COLLECTION.REPORT]: {},
        };

        onyxSourceValues = {
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
            [ONYXKEYS.COLLECTION.REPORT]: {},
            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {},
        };

        mockCreateOptionList.mockReturnValue({reports: [], personalDetails: []});
        mockUsePersonalDetails.mockReturnValue({});

        mockUseOnyx.mockImplementation(((key: string) => {
            if (key === ONYXKEYS.DERIVED.REPORT_ATTRIBUTES) {
                return [onyxState[key], {sourceValue: onyxSourceValues[key]}];
            }

            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return [onyxState[key], {sourceValue: onyxSourceValues[key]}];
            }

            if (key === ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
                return [undefined, {sourceValue: onyxSourceValues[key]}];
            }

            return [undefined];
        }) as typeof useOnyx);
    });

    it('ignores locale changes before options are initialized', () => {
        const {rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        expect(mockCreateOptionList).not.toHaveBeenCalled();

        onyxState = {
            ...onyxState,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'es'},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
        };
        rerender({shouldInitialize: false});

        expect(mockCreateOptionList).not.toHaveBeenCalled();
    });

    it('refreshes options once after initialization when locale changes', () => {
        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        expect(mockCreateOptionList).toHaveBeenCalledTimes(1);

        mockCreateOptionList.mockClear();

        onyxState = {
            ...onyxState,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'fr'},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
        };
        rerender({shouldInitialize: false});

        expect(mockCreateOptionList).toHaveBeenCalledTimes(1);
    });
});
