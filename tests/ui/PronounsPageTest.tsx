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

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
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

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string; isSelected?: boolean}>;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

describe('PronounsPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
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
});
