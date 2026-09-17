import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import SpendRuleCategoryBase from '@components/SpendRules/configuration/SpendRuleCategoryBase';

import CONST from '@src/CONST';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    const ReactMock = jest.requireActual<typeof React>('react');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn((callback: () => void) => {
            ReactMock.useEffect(() => {
                if (!mockIsFocused) {
                    return;
                }

                return callback();
            }, [callback, mockIsFocused]);
        }),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScrollView', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/FormAlertWithSubmitButton', () => jest.fn(() => null));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Telescope: 'telescope'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        // Return the last key segment so each category's text is its own value (e.g. "software").
        translate: (key: string) => key.split('.').pop() ?? key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

const {CATEGORIES} = CONST.SPEND_RULES;

type MockCategoryItem = {
    value: SpendRuleCategory;
    isSelected?: boolean;
    keyForList?: string;
    text?: string;
};

type MockSelectionListProps = {
    data: MockCategoryItem[];
    onSelectRow?: (item: MockCategoryItem) => void;
    textInputOptions?: {
        onChangeText?: (value: string) => void;
    };
};

function renderSpendRuleCategoryBase(categories: SpendRuleCategory[] = []) {
    return render(
        <SpendRuleCategoryBase
            categories={categories}
            onCategoriesChange={jest.fn()}
        />,
    );
}

describe('SpendRuleCategoryBase', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: narrow the props captured from the mocked SelectionList so assertions can read the category items
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockIsFocused = true;
    });

    it('pins the initially selected categories to the top on open', () => {
        // Both categories sort late alphabetically, so pinning is what moves them to the top.
        renderSpendRuleCategoryBase([CATEGORIES.SOFTWARE, CATEGORIES.TRAVEL_AGENCIES]);

        const props = getSelectionListProps();

        expect(props?.data.slice(0, 2).map((item) => item.value)).toEqual([CATEGORIES.SOFTWARE, CATEGORIES.TRAVEL_AGENCIES]);
        expect(props?.data.at(0)?.isSelected).toBe(true);
        expect(props?.data.at(1)?.isSelected).toBe(true);
        // Alphabetically "airlines" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe(CATEGORIES.AIRLINES);
    });

    it('keeps the initial pinned order when a category is toggled during the same session', () => {
        renderSpendRuleCategoryBase([CATEGORIES.SOFTWARE, CATEGORIES.TRAVEL_AGENCIES]);

        let props = getSelectionListProps();
        const airlinesItem = props?.data.find((item) => item.value === CATEGORIES.AIRLINES);
        expect(airlinesItem).toBeDefined();

        act(() => {
            if (!airlinesItem) {
                return;
            }
            props?.onSelectRow?.(airlinesItem);
        });

        props = getSelectionListProps();

        // The originally selected categories stay pinned; the newly toggled one does not jump above them.
        expect(props?.data.slice(0, 2).map((item) => item.value)).toEqual([CATEGORIES.SOFTWARE, CATEGORIES.TRAVEL_AGENCIES]);
        expect(props?.data.find((item) => item.value === CATEGORIES.AIRLINES)?.isSelected).toBe(true);
        expect(props?.data.findIndex((item) => item.value === CATEGORIES.AIRLINES) ?? -1).toBeGreaterThan(1);
    });

    it('keeps the selected category pinned to the top while searching', () => {
        renderSpendRuleCategoryBase([CATEGORIES.SOFTWARE]);

        let props = getSelectionListProps();

        act(() => {
            props?.textInputOptions?.onChangeText?.('s');
        });

        props = getSelectionListProps();

        // "software" sorts late alphabetically but must stay pinned at the very top of the filtered results.
        expect(props?.data.at(0)?.value).toBe(CATEGORIES.SOFTWARE);
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // The search matched more than just the pinned item, so its top position is meaningful.
        expect(props?.data.length ?? 0).toBeGreaterThan(1);
    });
});
