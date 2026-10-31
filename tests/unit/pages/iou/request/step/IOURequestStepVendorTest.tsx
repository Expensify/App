import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type PolicyVendors from '@src/types/onyx/PolicyVendor';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

// Vendors the page reads from the policyVendors_ Onyx collection; set per test before rendering.
const mockState: {policyVendors?: PolicyVendors} = {};

// The page is wrapped in data-fetching HOCs and a transition wrapper; make them pass-through so we can render the
// inner component directly and inspect the props it hands to SelectionList.
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => (Component: ComponentType) => Component);
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: ComponentType) => Component);
jest.mock(
    '@pages/iou/request/step/StepScreenWrapper',
    () =>
        ({children}: {children: (props: {didScreenTransitionEnd: boolean}) => React.ReactNode}) =>
            children({didScreenTransitionEnd: true}),
);

jest.mock('@components/SelectionList', () => jest.fn(() => null));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Telescope: 1}),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => true}),
}));

jest.mock('@hooks/useDelegateAccountID', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

// Return the mocked vendors for the policyVendors_ collection and nothing for the other reads.
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => (typeof key === 'string' && key.startsWith('policyVendors_') ? [mockState.policyVendors] : [undefined]),
}));

jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/usePolicyForTransaction', () => ({
    __esModule: true,
    default: () => ({policy: {id: '1'}}),
}));

// Only the vendor helpers the page uses are mocked; sortVendors sorts by name like the real one.
jest.mock('@libs/PolicyUtils', () => ({
    hasVendorFeature: () => true,
    getVendorEmptyState: () => ({title: '', subtitle: ''}),
    sortVendors: (vendors: Array<{name: string}>) => [...vendors].sort((a, b) => a.name.localeCompare(b.name)),
}));

jest.mock('@libs/actions/Policy/Vendor', () => ({
    openPolicyVendorsPage: jest.fn(),
}));

jest.mock('@libs/actions/IOU/UpdateMoneyRequest', () => ({
    updateMoneyRequestVendor: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn()},
}));

const IOURequestStepVendor = require<{
    default: ComponentType<{report: Report; route: {params: {action: string; iouType: string; transactionID: string; reportActionID: string}}; transaction: Transaction}>;
}>('@pages/iou/request/step/IOURequestStepVendor').default;

const getListProps = () => {
    const props = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('SelectionList was not rendered');
    }
    return props;
};

const buildPolicyVendors = (count: number): PolicyVendors =>
    Array.from({length: count}).reduce<PolicyVendors>((acc, _unused, index) => {
        const id = `v${String(index + 1).padStart(2, '0')}`;
        acc[id] = {externalID: id, name: `Vendor ${String(index + 1).padStart(2, '0')}`, enabled: true};
        return acc;
    }, {});

const renderPicker = (currentVendorID?: string) =>
    render(
        <IOURequestStepVendor
            report={createMock<Report>({reportID: 'r1', policyID: '1'})}
            route={{params: {action: CONST.IOU.ACTION.EDIT, iouType: CONST.IOU.TYPE.SUBMIT, transactionID: 't1', reportActionID: 'ra1'}}}
            transaction={createMock<Transaction>({transactionID: 't1', reimbursable: false, comment: currentVendorID ? {vendor: {externalID: currentVendorID}} : undefined})}
        />,
    );

describe('IOURequestStepVendor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState.policyVendors = undefined;
    });

    it('pins the currently selected vendor to the top of a long list, above the "None" row', () => {
        // Given a long list (>= item-limit threshold) whose selected vendor sits in the middle
        mockState.policyVendors = buildPolicyVendors(13);

        // When the picker opens with vendor 07 selected
        renderPicker('v07');

        // Then the selected vendor is pinned to the very top, with the "None" clear row directly below it
        const {data} = getListProps();
        expect(data.at(0)?.keyForList).toBe('v07');
        expect(data.at(1)?.keyForList).toBe('clear-vendor');
        // ...and the rest keep their alphabetical order
        expect(data.at(2)?.keyForList).toBe('v01');
    });

    it('keeps the selected vendor pinned at the top of the search results', () => {
        // Given a long list that opened with vendor 07 selected (pinned to the top)
        mockState.policyVendors = buildPolicyVendors(13);
        renderPicker('v07');

        // When a search matches the selected vendor along with others
        act(() => {
            getListProps().textInputOptions?.onChangeText?.('Vendor 0');
        });

        // Then the selected vendor stays first in the filtered results (pinning happens before filtering)...
        const {data} = getListProps();
        expect(data.at(0)?.keyForList).toBe('v07');
        // ...and the "None" clear row is hidden while searching
        expect(data.some((item) => item.keyForList === 'clear-vendor')).toBe(false);
    });

    it('does not set an initial focus key, so staging a selection never auto-scrolls the list', () => {
        // Given a long list with a mid-list selection
        mockState.policyVendors = buildPolicyVendors(13);

        // When the picker opens
        renderPicker('v07');

        // Then no focus key is passed (the selection is already pinned to the top) and mount-scroll is disabled,
        // so tapping a row to stage it does not scroll the list to the tapped item
        const {initiallyFocusedItemKey, shouldScrollToFocusedIndexOnMount} = getListProps();
        expect(initiallyFocusedItemKey).toBeUndefined();
        expect(shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('does not reorder a list below the item-limit threshold', () => {
        // Given a short list (< item-limit threshold) with a mid-list selection
        mockState.policyVendors = buildPolicyVendors(5);

        // When the picker opens with vendor 03 selected
        renderPicker('v03');

        // Then the natural order is kept: the "None" row stays on top and the selected vendor stays in place
        const {data} = getListProps();
        expect(data.at(0)?.keyForList).toBe('clear-vendor');
        expect(data.at(1)?.keyForList).toBe('v01');
        expect(data.find((item) => item.isSelected)?.keyForList).toBe('v03');
    });

    it('hides the "None" row while searching', () => {
        // Given an open picker with a selected vendor
        mockState.policyVendors = buildPolicyVendors(13);
        renderPicker('v07');

        // When the user searches for a single specific vendor
        act(() => {
            getListProps().textInputOptions?.onChangeText?.('Vendor 09');
        });

        // Then only the matching vendor shows and the "None" clear row is filtered out
        const {data} = getListProps();
        expect(data.map((item) => item.keyForList)).toEqual(['v09']);
    });
});
