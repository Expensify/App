import {fireEvent, render, screen} from '@testing-library/react-native';

import BlockingView from '@components/BlockingViews/BlockingView';
import LHNEmptyState from '@components/LHNOptionsList/LHNEmptyState';
import type Text from '@components/Text';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

let mockActiveTab: string = CONST.INBOX_TAB.UNREAD;
const mockFireworks: IconAsset = () => null;
let mockIcon: IconAsset | undefined = mockFireworks;
const mockSetActiveTab = jest.fn();
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(({CustomSubtitle}: {CustomSubtitle: React.ReactNode}) => CustomSubtitle));
jest.mock('@components/Text', () => jest.requireActual<{Text: typeof Text}>('react-native').Text);
jest.mock('@components/TextLink', () => jest.requireActual<{Text: typeof Text}>('react-native').Text);
jest.mock('@components/TextBlock', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<{Text: typeof Text}>('react-native');
    return ({text}: {text: string}) => ReactLocal.createElement(RN.Text, null, text);
});
jest.mock('@components/Icon', () => () => null);
jest.mock('@hooks/useTheme', () => () => ({
    textSupporting: 'supporting',
    icon: 'icon',
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    emptyStateFireworksStaticIllustration: {width: 120, height: 90},
    alignItemsCenter: {},
    justifyContentCenter: {},
    textAlignCenter: {},
    textSupporting: {},
    textStrong: {},
    mt5: {},
    ph4: {},
    mb2: {},
    flexRow: {},
    flexWrap: {},
    textNormal: {},
    mh1: {},
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: (): {Fireworks: IconAsset | undefined} => ({
        Fireworks: mockIcon,
    }),
    useMemoizedLazyExpensifyIcons: () => ({
        MagnifyingGlass: 'search',
        Plus: 'plus',
    }),
}));
jest.mock('@hooks/useSidebarOrderedReports', () => ({
    useSidebarOrderedReportsState: () => ({activeTab: mockActiveTab}),
    useSidebarOrderedReportsActions: () => ({setActiveTab: mockSetActiveTab}),
}));
describe('LHNEmptyState', () => {
    beforeEach(() => {
        jest.mocked(BlockingView).mockClear();
        mockSetActiveTab.mockClear();
        mockIcon = mockFireworks;
    });
    it.each([
        [CONST.INBOX_TAB.UNREAD, 'common.emptyLHN.noUnreadChats'],
        [CONST.INBOX_TAB.TODO, 'common.emptyLHN.noTodos'],
    ])('keeps the %s tab copy and See all chats action', (tab, title) => {
        // Given an empty filtered tab with a typed Fireworks illustration
        mockActiveTab = tab;
        // When the real empty state renders and the link is pressed
        render(<LHNEmptyState />);
        fireEvent.press(screen.getByText('common.emptyLHN.seeAllChats'));
        // Then the selected copy, illustration dimensions and ALL navigation remain intact
        expect(jest.mocked(BlockingView).mock.lastCall?.[0]).toMatchObject({
            title,
            accessibilityLabel: title,
            icon: mockFireworks,
            iconWidth: 120,
            iconHeight: 90,
        });
        expect(mockSetActiveTab).toHaveBeenCalledWith(CONST.INBOX_TAB.ALL);
    });
    it('keeps the ALL empty state title and subtitle', () => {
        // Given the unfiltered inbox tab
        mockActiveTab = CONST.INBOX_TAB.ALL;
        // When the real empty state renders
        render(<LHNEmptyState />);
        // Then its illustration and all three subtitle segments remain present
        expect(jest.mocked(BlockingView).mock.lastCall?.[0]).toMatchObject({
            title: 'common.emptyLHN.title',
            accessibilityLabel: 'common.emptyLHN.title',
            icon: mockFireworks,
            iconWidth: 120,
            iconHeight: 90,
        });
        expect(screen.getByText('common.emptyLHN.subtitleText1')).toBeTruthy();
        expect(screen.getByText('common.emptyLHN.subtitleText2')).toBeTruthy();
        expect(screen.getByText('common.emptyLHN.subtitleText3')).toBeTruthy();
    });
    it('renders nothing when the illustration hook has no icon', () => {
        // Given the defensive state allowed by the hook type
        mockActiveTab = CONST.INBOX_TAB.ALL;
        mockIcon = undefined;
        // When the empty state renders
        const result = render(<LHNEmptyState />);
        // Then no incomplete BlockingView is created
        expect(result.toJSON()).toBeNull();
        expect(BlockingView).not.toHaveBeenCalled();
    });
});
