import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import DynamicCategoryDefaultTaxRatePage from '@pages/workspace/categories/DynamicCategoryDefaultTaxRatePage';

import CONST from '@src/CONST';
import type {Policy, TaxRate} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

let mockIsFocused = true;
let mockPolicy: Policy | undefined;
let mockPersistedTaxRate: string | undefined;

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
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

// Return the persisted rate and use the taxID itself as the display text so the alphabetical sort is predictable.
jest.mock('@libs/CategoryUtils', () => ({
    getCategoryDefaultTaxRate: jest.fn(() => mockPersistedTaxRate),
    formatDefaultTaxRateText: jest.fn((_translate: unknown, taxID: string) => taxID),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
}));

jest.mock('@userActions/Policy/Category', () => ({
    setPolicyCategoryTax: jest.fn(),
}));

const POLICY_ID = 'policy1';
const CATEGORY_NAME = 'Travel';

type MockTaxItem = {value: string; keyForList?: string; text?: string; isSelected?: boolean};

type MockSelectionListProps = {
    data: MockTaxItem[];
    onSelectRow?: (item: MockTaxItem) => void;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
};

/** Build a policy whose taxRates.taxes has `count` entries keyed id00..id{count-1} (zero-padded so the text sort is numeric). */
function buildPolicyWithTaxes(count: number): Policy {
    const taxes: Record<string, TaxRate> = {};
    for (let index = 0; index < count; index++) {
        const key = `id${String(index).padStart(2, '0')}`;
        taxes[key] = {name: key, value: '0%'} as TaxRate;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
    return {taxRates: {name: 'Tax', defaultExternalID: 'id00', foreignTaxDefault: 'id00', taxes}} as Policy;
}

function renderPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub; the page only reads route.params
    const props = {route: {params: {policyID: POLICY_ID, categoryName: CATEGORY_NAME}}} as React.ComponentProps<typeof DynamicCategoryDefaultTaxRatePage>;
    return render(<DynamicCategoryDefaultTaxRatePage {...props} />);
}

describe('DynamicCategoryDefaultTaxRatePage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: narrow the props captured from the mocked SelectionList
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockIsFocused = true;
        mockPolicy = buildPolicyWithTaxes(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        // "id07" sorts to the middle, so seeing it at the top proves pinning (not the natural order) put it there.
        mockPersistedTaxRate = 'id07';
    });

    it('pins the persisted tax rate to the top on open', () => {
        renderPage();

        const props = getSelectionListProps();

        expect(props?.data.at(0)?.keyForList).toBe('id07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        expect(props?.initiallyFocusedItemKey).toBe('id07');
        // Alphabetically "id00" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('id00');
        // Keyboard focus starts on the selected rate, and shouldUpdateFocusedIndex + no mount scroll keep the list from auto-scrolling on select.
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the persisted rate pinned while the live selection changes during the same session', () => {
        renderPage();

        let props = getSelectionListProps();
        const otherItem = props?.data.find((item) => item.keyForList === 'id03');
        expect(otherItem).toBeDefined();

        act(() => {
            if (!otherItem) {
                return;
            }
            props?.onSelectRow?.(otherItem);
        });

        props = getSelectionListProps();

        // The originally persisted rate stays pinned at the top; the newly selected one does not jump above it.
        expect(props?.data.at(0)?.keyForList).toBe('id07');
        expect(props?.data.at(0)?.isSelected).toBe(false);
        expect(props?.data.find((item) => item.keyForList === 'id03')?.isSelected).toBe(true);
        expect(props?.data.findIndex((item) => item.keyForList === 'id03')).toBeGreaterThan(0);
    });

    it('does not reorder when the list is under the item-limit threshold', () => {
        mockPolicy = buildPolicyWithTaxes(CONST.STANDARD_LIST_ITEM_LIMIT - 2);

        renderPage();

        const props = getSelectionListProps();

        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural alphabetical order is preserved.
        expect(props?.data.at(0)?.keyForList).toBe('id00');
        expect(props?.data.findIndex((item) => item.keyForList === 'id07')).toBe(7);
    });
});
