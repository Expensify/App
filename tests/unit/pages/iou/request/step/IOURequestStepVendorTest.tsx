import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type {Vendor} from '@src/types/onyx/Policy';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

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

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => ({
    __esModule: true,
    default: () => false,
}));

const mockGetMatchingVendors = jest.fn(() => [] as Vendor[]);
jest.mock('@hooks/usePolicyForTransaction', () => ({
    __esModule: true,
    default: () => ({policy: {id: '1'}}),
}));

// Only the vendor helpers the page uses are mocked; sortVendors sorts by name like the real one.
jest.mock('@libs/PolicyUtils', () => ({
    getMatchingVendors: () => mockGetMatchingVendors(),
    hasVendorFeature: () => true,
    getVendorEmptyState: () => ({title: '', subtitle: ''}),
    isXeroActiveMatchingSource: () => false,
    sortVendors: (vendors: Vendor[]) => [...vendors].sort((a, b) => a.name.localeCompare(b.name)),
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

const buildVendors = (count: number): Vendor[] =>
    Array.from({length: count}, (_, index) => {
        const label = String(index + 1).padStart(2, '0');
        return {id: `v${label}`, name: `Vendor ${label}`, currency: '', email: ''};
    });

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
    });

    it('pins the currently selected vendor to the top of a long list, above the "None" row', () => {
        // Given a long searchable list (>= item-limit threshold) whose selected vendor sits in the middle
        mockGetMatchingVendors.mockReturnValue(buildVendors(13));

        // When the picker opens with vendor 07 selected
        renderPicker('v07');

        // Then the selected vendor is pinned to the very top, with the "None" clear row directly below it
        const {data} = getListProps();
        expect(data.at(0)?.keyForList).toBe('v07');
        expect(data.at(1)?.keyForList).toBe('clear-vendor');
        // ...and the rest keep their alphabetical order
        expect(data.at(2)?.keyForList).toBe('v01');
    });

    it('focuses the selected vendor without scrolling to it on mount', () => {
        // Given a long list with a mid-list selection
        mockGetMatchingVendors.mockReturnValue(buildVendors(13));

        // When the picker opens
        renderPicker('v07');

        // Then the selected vendor is the initially focused row, but mount-scroll is disabled so the pinned top stays in view
        const {initiallyFocusedItemKey, shouldScrollToFocusedIndexOnMount} = getListProps();
        expect(initiallyFocusedItemKey).toBe('v07');
        expect(shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('does not reorder a list below the item-limit threshold', () => {
        // Given a short list (< item-limit threshold) with a mid-list selection
        mockGetMatchingVendors.mockReturnValue(buildVendors(5));

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
        mockGetMatchingVendors.mockReturnValue(buildVendors(13));
        renderPicker('v07');

        // When the user searches for a specific vendor
        act(() => {
            getListProps().textInputOptions?.onChangeText?.('Vendor 09');
        });

        // Then only the matching vendor shows and the "None" clear row is filtered out
        const {data} = getListProps();
        expect(data.map((item) => item.keyForList)).toEqual(['v09']);
    });
});
