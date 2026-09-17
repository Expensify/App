import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import PronounsPage from '@pages/settings/Profile/PronounsPage';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

// "theyThemTheirs" sits near the end of the alphabetical list, so seeing it first proves pinning (not the sort).
const SELECTED_VALUE = 'theyThemTheirs';
const SELECTED_PRONOUN = `${CONST.PRONOUNS.PREFIX}${SELECTED_VALUE}`;
const mockPersonalDetails = {accountID: 1, pronouns: SELECTED_PRONOUN};

// Capture the latest focus-effect callback so a test can simulate the screen regaining focus (e.g. returning from an overlay).
const mockFocus: {callback?: () => void} = {};
jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn((callback: () => void) => {
            mockFocus.callback = callback;
        }),
    };
});

jest.mock('@components/withCurrentUserPersonalDetails', () => {
    const ReactActual: typeof React = jest.requireActual('react');
    return {
        __esModule: true,
        default: (Component: React.ComponentType<{currentUserPersonalDetails: typeof mockPersonalDetails}>) => (props: Record<string, unknown>) =>
            ReactActual.createElement(Component, {...props, currentUserPersonalDetails: mockPersonalDetails}),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/CollapsibleHeaderOnKeyboard', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [false]));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@userActions/PersonalDetails', () => ({updatePronouns: jest.fn()}));

type MockPronounItem = {value?: string; keyForList?: string; isSelected?: boolean};

type MockSelectionListProps = {
    data: MockPronounItem[];
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
    onSelectRow?: (item: MockPronounItem) => void;
};

describe('PronounsPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the pre-selected pronoun to the top of the search results', () => {
        render(<PronounsPage />);

        // "pronouns." is a prefix of every row's text, so this matches the whole list.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('pronouns.');
        });

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(SELECTED_PRONOUN);
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // "callMeByMyName" sorts first, so it would lead if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe(`${CONST.PRONOUNS.PREFIX}callMeByMyName`);
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the saved pronoun pinned (not the unsaved selection) when the screen regains focus', () => {
        render(<PronounsPage />);

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('pronouns.');
        });

        // Pick a different row in the middle of the results and select it (staged, not yet saved).
        const middleItem = getSelectionListProps()?.data.find((item) => item.value !== SELECTED_PRONOUN);
        act(() => {
            if (!middleItem) {
                return;
            }
            getSelectionListProps()?.onSelectRow?.(middleItem);
        });

        // Fire the focus effect, which re-snapshots the frozen selection; it must stay on the saved pronoun.
        act(() => {
            mockFocus.callback?.();
        });

        const props = getSelectionListProps();
        // The saved pronoun stays pinned at the top; the unsaved selection must not jump there.
        expect(props?.data.at(0)?.value).toBe(SELECTED_PRONOUN);
        expect(props?.data.at(0)?.value).not.toBe(middleItem?.value);
        // The checkmark still follows the live (unsaved) selection.
        expect(props?.data.find((item) => item.value === middleItem?.value)?.isSelected).toBe(true);
    });
});
