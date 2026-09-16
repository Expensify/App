import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import CardSelectionStep from '@pages/workspace/companyCards/assignCard/CardSelectionStep';

import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {UnassignedCard} from '@src/types/onyx/Card';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

// 13 cards (> STANDARD_LIST_ITEM_LIMIT) so the pin actually reorders. IDs are zero-padded to keep the natural order numeric.
const mockCards = Array.from({length: 13}, (_, index) => {
    const id = String(index + 1).padStart(2, '0');
    return {cardID: id, cardName: `111111111111${id}`};
}) as unknown as UnassignedCard[];

// The card selected when the step opens sorts to the middle, so seeing it first proves pinning put it there.
const mockAssignCard = {isEditing: false, cardToAssign: {encryptedCardNumber: '07'}};

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/InteractiveStepWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

jest.mock('@hooks/useOnyx', () => {
    const ONYXKEYS = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => (key === ONYXKEYS.ASSIGN_CARD ? [mockAssignCard] : [undefined]));
});
jest.mock('@hooks/useCardsList', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useCardFeeds', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardFeedIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: jest.fn(() => ({BrokenMagnifyingGlass: undefined}))}));
jest.mock('@hooks/useBottomSafeSafeAreaPaddingStyle', () => jest.fn(() => ({})));
jest.mock('@hooks/usePersonalDetailByLogin', () => jest.fn(() => 'Assignee'));
jest.mock('@hooks/usePressLoading', () => jest.fn(() => ({isLoading: false, startWithLoading: jest.fn()})));
jest.mock('@libs/CardUtils', () => ({
    getFilteredCardList: jest.fn(() => mockCards),
    getPlaidInstitutionIconUrl: jest.fn(() => undefined),
    getCardFeedIcon: jest.fn(() => undefined),
    getCompanyCardFeed: jest.fn(() => 'feed'),
    lastFourNumbersFromCardName: jest.fn(() => '1234'),
    maskCardNumber: jest.fn((cardName: string) => cardName),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

type MockListItem = {value: string; keyForList: string; isSelected?: boolean; text?: string};

type MockSelectionListProps = {
    data: MockListItem[];
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    disableMaintainingScrollPosition?: boolean;
    onSelectRow: (item: MockListItem) => void;
};

function stepElement() {
    return (
        <CardSelectionStep
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only route.params is read in this step
            route={{params: {policyID: 'policy1', feed: 'feed', cardID: '07'}} as never}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- navigation object is unused in this test
            navigation={{} as never}
        />
    );
}

describe('CardSelectionStep', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected card to the top on open', () => {
        render(stepElement());

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // "01" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('01');
        expect(props?.initiallyFocusedItemKey).toBe('07');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
        expect(props?.disableMaintainingScrollPosition).toBe(true);
    });

    it('keeps the originally pinned card at the top while the live selection changes', () => {
        render(stepElement());

        // Simulate the user picking a different card; the frozen pin must not jump to it.
        act(() => {
            getSelectionListProps()?.onSelectRow({value: '03', keyForList: '03'});
        });

        const props = getSelectionListProps();
        const order = props?.data.map((item) => item.value) ?? [];
        expect(order.at(0)).toBe('07');
        expect(order.indexOf('07')).toBeLessThan(order.indexOf('03'));
        // The checkmark still follows the live value.
        expect(props?.data.find((item) => item.value === '03')?.isSelected).toBe(true);
        expect(props?.data.find((item) => item.value === '07')?.isSelected).toBe(false);
    });
});
