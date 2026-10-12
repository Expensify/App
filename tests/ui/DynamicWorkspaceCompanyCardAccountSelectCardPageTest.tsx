import {render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import DynamicWorkspaceCompanyCardAccountSelectCardPage from '@pages/workspace/companyCards/DynamicWorkspaceCompanyCardAccountSelectCardPage';
import {getExportMenuItem} from '@pages/workspace/companyCards/utils';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

/** Build `count` export-account options; the option at `selectedIndex` is the saved one. */
function buildExportData(count: number, selectedIndex: number) {
    return Array.from({length: count}, (_, index) => {
        const value = `acct${String(index + 1).padStart(2, '0')}`;
        return {value, keyForList: value, text: value, isSelected: index === selectedIndex};
    });
}

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@pages/workspace/companyCards/utils', () => ({getExportMenuItem: jest.fn()}));
jest.mock('@pages/workspace/accounting/utils', () => ({getCurrentAccountingIntegrationName: jest.fn(() => '')}));

jest.mock('@hooks/useCardsList', () => jest.fn(() => [Object.fromEntries([['07', {}]])]));
jest.mock('@hooks/useCardFeeds', () => jest.fn(() => [undefined]));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({})));
jest.mock('@hooks/useWorkspaceAccountID', () => jest.fn(() => 1));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: ''})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: jest.fn(() => ({Telescope: undefined}))}));
jest.mock('@libs/CardUtils', () => ({
    getCompanyCardFeed: jest.fn(() => 'feed'),
    getDomainOrWorkspaceAccountID: jest.fn(() => 1),
    isExpensifyCard: jest.fn(() => false),
}));
jest.mock('@libs/PolicyUtils', () => ({getConnectedIntegration: jest.fn(() => 'quickbooksOnline')}));
jest.mock('@navigation/Navigation', () => ({getActiveRoute: jest.fn(() => ''), goBack: jest.fn()}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

type MockSelectorItem = {value: string; keyForList: string; isSelected?: boolean};

type MockSelectionScreenProps = {
    data: MockSelectorItem[];
    initiallyFocusedOptionKey?: string;
    shouldUpdateFocusedIndex?: boolean;
};

function pageElement() {
    return (
        <DynamicWorkspaceCompanyCardAccountSelectCardPage
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only route.params is read in this page
            route={{params: {policyID: 'policy1', feed: 'feed', cardID: '07'}} as never}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- navigation object is unused in this test
            navigation={{} as never}
        />
    );
}

describe('DynamicWorkspaceCompanyCardAccountSelectCardPage', () => {
    const mockedGetExportMenuItem = jest.mocked(getExportMenuItem);
    const mockedSelectionScreen = jest.mocked(SelectionScreen);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionScreen in this test
    const getScreenProps = () => mockedSelectionScreen.mock.lastCall?.[0] as MockSelectionScreenProps | undefined;

    beforeEach(() => {
        mockedSelectionScreen.mockClear();
    });

    it('pins the initially selected export account to the top on open', () => {
        // 13 options (> STANDARD_LIST_ITEM_LIMIT), saved one in the middle.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test builds only the fields this page reads
        mockedGetExportMenuItem.mockReturnValue({data: buildExportData(13, 6), exportType: 'exportType'} as never);
        render(pageElement());

        const props = getScreenProps();
        expect(props?.data.at(0)?.value).toBe('acct07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // "acct01" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('acct01');
        expect(props?.initiallyFocusedOptionKey).toBe('acct07');
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('does not reorder when the list is under the item-limit threshold', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test builds only the fields this page reads
        mockedGetExportMenuItem.mockReturnValue({data: buildExportData(5, 3), exportType: 'exportType'} as never);
        render(pageElement());

        const props = getScreenProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural order is kept.
        expect(props?.data.at(0)?.value).toBe('acct01');
    });
});
