import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import SpendRuleCardPage from '@pages/workspace/rules/SpendRules/SpendRuleCardPage';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;

const POLICY_ID = 'policy1';
const RULE_ID = 'rule1';

let mockCardsList: Record<string, unknown>;
let mockSpendRuleForm: {cardIDs: string[]} | undefined;

/** Build a WORKSPACE_CARDS_LIST-shaped object with `count` Expensify cards keyed by cardID. */
function buildCardsList(count: number): Record<string, unknown> {
    const cardsList: Record<string, unknown> = {cardList: {}};
    for (let index = 1; index <= count; index++) {
        cardsList[String(index)] = {
            cardID: index,
            accountID: index,
            bank: CONST.EXPENSIFY_CARD.BANK,
            lastFourPAN: '1234',
            nameValuePairs: {cardTitle: `Card ${index}`},
        };
    }
    return cardsList;
}

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/CardListItem', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/FormAlertWithSubmitButton', () => jest.fn(() => null));
jest.mock('@components/ScrollView', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardFeedIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: jest.fn(() => ({HandCard: 'hand-card'}))}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useCanWriteCardSpendRules', () => jest.fn(() => true));
jest.mock('@hooks/useControlOnlyRuleUpgradeRedirect', () => jest.fn());
jest.mock('@hooks/useDefaultFundID', () => jest.fn(() => 'fund1'));
jest.mock('@hooks/usePressLoading', () => jest.fn(() => ({isLoading: false, startWithLoading: (fn: () => void) => fn()})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatPhoneNumber: (value: string) => value,
    })),
);
// useSearchResults returns [inputValue, setInputValue, filteredData]; filter the pre-pinned list by value substring,
// preserving order (matching the real hook's identity-sort behaviour) so the test can exercise the search path.
jest.mock('@hooks/useSearchResults', () =>
    jest.fn((data: Array<{value?: string}>) => {
        const [input, setInput] = mockUseState('');
        const filtered = input ? data.filter((item) => item.value?.includes(input)) : data;
        return [input, setInput, filtered];
    }),
);
jest.mock('@hooks/useOnyx', () => {
    const onyxKeys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => {
        if (typeof key === 'string' && key.startsWith(onyxKeys.COLLECTION.WORKSPACE_CARDS_LIST)) {
            return [mockCardsList];
        }
        if (typeof key === 'string' && key.startsWith(onyxKeys.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS)) {
            return [{cardRules: {}, hasOnceLoaded: true, isLoading: false}];
        }
        if (key === onyxKeys.FORMS.SPEND_RULE_FORM) {
            return [mockSpendRuleForm];
        }
        return [undefined];
    });
});

jest.mock('@libs/CardUtils', () => ({
    filterInactiveCards: (cards: unknown) => cards,
    filterCardsByPersonalDetails: () => true,
    getCardFeedIcon: () => 'icon',
    sortCardsByCardholderName: (cards: unknown[]) => cards,
}));
jest.mock('@libs/OptionsListUtils', () => ({getHeaderMessage: () => ''}));
jest.mock('@libs/PersonalDetailsUtils', () => ({temporaryGetDisplayNameOrDefault: () => ''}));
jest.mock('@libs/SpendRulesUtils', () => ({getSpendRuleFormValuesFromCardRule: () => ({cardIDs: []})}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/actions/User', () => ({updateDraftSpendRule: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({openPolicyExpensifyCardsPage: jest.fn()}));

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string}>;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub. The page only reads route.params
    const props = {route: {params: {policyID: POLICY_ID, ruleID: RULE_ID}}} as unknown as React.ComponentProps<typeof SpendRuleCardPage>;
    return render(<SpendRuleCardPage {...props} />);
}

describe('SpendRuleCardPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockCardsList = buildCardsList(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        // Cards 5 and 9 sort to the middle, so seeing them first proves pinning (not the natural order) put them there.
        mockSpendRuleForm = {cardIDs: ['5', '9']};
    });

    it('pins the pre-selected cards to the top on open', () => {
        renderPage();

        const props = getSelectionListProps();
        expect(props?.data.slice(0, 2).map((card) => card.value)).toEqual(['5', '9']);
        // Card 1 would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('1');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps a pinned card at the top of the search results', () => {
        // Pin card 12; searching "2" matches both 2 and 12, and 2 sorts first — so 12 leading proves the pin held.
        mockSpendRuleForm = {cardIDs: ['12']};
        renderPage();

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('2');
        });

        const props = getSelectionListProps();
        expect(props?.data.map((card) => card.value)).toEqual(['12', '2']);
    });

    it('does not reorder when the card list is under the item-limit threshold', () => {
        mockCardsList = buildCardsList(CONST.STANDARD_LIST_ITEM_LIMIT - 2);
        mockSpendRuleForm = {cardIDs: ['5']};

        renderPage();

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural order is preserved.
        expect(props?.data.at(0)?.value).toBe('1');
    });
});
