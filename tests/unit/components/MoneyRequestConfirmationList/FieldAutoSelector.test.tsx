import {render} from '@testing-library/react-native';

import type {FieldAutoSelectorProps} from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';

import CONST from '@src/CONST';
import type {PolicyCategories, PolicyTagLists, Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../../../utils/createMock';

const mockSetMoneyRequestCategory = jest.fn();
const mockSetMoneyRequestTag = jest.fn();
// Stable across renders like the real context value, so it never re-triggers the effect on its own
const mockCurrencyListActions = {getCurrencyDecimals: () => 2};

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => mockCurrencyListActions,
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    setMoneyRequestCategory: (...args: unknown[]) => {
        mockSetMoneyRequestCategory(...args);
    },
    setMoneyRequestTag: (...args: unknown[]) => {
        mockSetMoneyRequestTag(...args);
    },
}));

const TRANSACTION_ID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;

const policyCategories = createMock<PolicyCategories>({
    Travel: {name: 'Travel', enabled: true},
    Meals: {name: 'Meals', enabled: false},
});

const baseProps: FieldAutoSelectorProps = {
    transactionID: undefined,
    transaction: undefined,
    policyCategories,
    policyTagLists: [],
    policyTags: undefined,
    policy: undefined,
    shouldShowCategories: true,
    isCategoryRequired: true,
    iouCategory: '',
    isMovingTransactionFromTrackExpense: false,
};

const policyTags = createMock<PolicyTagLists>({
    Project: {
        name: 'Project',
        required: true,
        orderWeight: 0,
        tags: {
            Alpha: {name: 'Alpha', enabled: true},
            Beta: {name: 'Beta', enabled: false},
        },
    },
});

// Built once so its reference stays stable across renders, like the compiler-memoized list in the real hook
const policyTagLists = Object.values(policyTags);

const buildDraft = (iouRequestType: Transaction['iouRequestType']) => createMock<Transaction>({transactionID: TRANSACTION_ID, iouRequestType});

describe('FieldAutoSelector', () => {
    beforeEach(() => {
        mockSetMoneyRequestCategory.mockClear();
        mockSetMoneyRequestTag.mockClear();
    });

    it('selects the only required category once the draft is created after mount', () => {
        // Given the share flow mounting the scan list before its draft exists, with cached categories that require the only enabled one
        const {rerender} = render(<FieldAutoSelector {...baseProps} />);
        expect(mockSetMoneyRequestCategory).not.toHaveBeenCalled();

        // When the draft is written while the policy and its categories stay the same
        const draft = buildDraft(CONST.IOU.REQUEST_TYPE.SCAN);
        rerender(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={draft}
            />,
        );

        // Then the category is selected, because the list is no longer remounted when the draft arrives
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(1);
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, 'Travel', undefined, expect.any(Function), false);
    });

    it('selects the only required category again once a stale draft is re-initialized as a scan', () => {
        // Given a manual draft left over from another flow, whose category was auto-selected on mount
        const {rerender} = render(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={buildDraft(CONST.IOU.REQUEST_TYPE.MANUAL)}
            />,
        );
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(1);

        // When the share flow re-initializes that draft as a scan, which drops its category but keeps its ID
        rerender(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={buildDraft(CONST.IOU.REQUEST_TYPE.SCAN)}
            />,
        );

        // Then the category is selected on the re-initialized draft too
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(2);
    });

    it('does not select a category again while the draft keeps its ID and request type', () => {
        // Given a scan draft whose only required category was already auto-selected
        const draft = buildDraft(CONST.IOU.REQUEST_TYPE.SCAN);
        const {rerender} = render(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={draft}
            />,
        );

        // When the user clears the category on the same draft
        rerender(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={{...draft, category: ''}}
            />,
        );

        // Then it is not forced back, so the selection still happens only once per draft
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(1);
    });

    it('selects the only required category on the next draft when multi-scan switches to it', () => {
        // Given a multi-scan list showing its first scan, whose only required category was auto-selected on mount
        const NEXT_TRANSACTION_ID = 'multiScanSecondTransactionID';
        const {rerender} = render(
            <FieldAutoSelector
                {...baseProps}
                transactionID={TRANSACTION_ID}
                transaction={buildDraft(CONST.IOU.REQUEST_TYPE.SCAN)}
            />,
        );
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(1);

        // When the user switches to the second scan on the same list, which stays mounted with the same policy
        rerender(
            <FieldAutoSelector
                {...baseProps}
                transactionID={NEXT_TRANSACTION_ID}
                transaction={createMock<Transaction>({transactionID: NEXT_TRANSACTION_ID, iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN})}
            />,
        );

        // Then the category is selected on the second scan too, so every expense of the batch is submitted with it
        expect(mockSetMoneyRequestCategory).toHaveBeenCalledTimes(2);
        expect(mockSetMoneyRequestCategory).toHaveBeenLastCalledWith(NEXT_TRANSACTION_ID, 'Travel', undefined, expect.any(Function), false);
    });

    describe('required tag', () => {
        const tagProps: FieldAutoSelectorProps = {...baseProps, policyCategories: undefined, policyTags, policyTagLists, transactionID: TRANSACTION_ID};

        it('selects the only required tag again once a stale draft is re-initialized as a scan', () => {
            // Given a manual draft left over from another flow, whose only required tag was auto-selected on mount
            const {rerender} = render(
                <FieldAutoSelector
                    {...tagProps}
                    transaction={buildDraft(CONST.IOU.REQUEST_TYPE.MANUAL)}
                />,
            );
            expect(mockSetMoneyRequestTag).toHaveBeenCalledTimes(1);

            // When the share flow re-initializes that draft as a scan, which drops its tag but keeps its ID and the cached tags
            rerender(
                <FieldAutoSelector
                    {...tagProps}
                    transaction={buildDraft(CONST.IOU.REQUEST_TYPE.SCAN)}
                />,
            );

            // Then the tag is selected on the re-initialized draft too, so the shared expense is not submitted without it
            expect(mockSetMoneyRequestTag).toHaveBeenCalledTimes(2);
            expect(mockSetMoneyRequestTag).toHaveBeenLastCalledWith(TRANSACTION_ID, 'Alpha');
        });

        it('does not select a tag again while the draft keeps its ID and request type', () => {
            // Given a scan draft whose only required tag was already auto-selected
            const draft = buildDraft(CONST.IOU.REQUEST_TYPE.SCAN);
            const {rerender} = render(
                <FieldAutoSelector
                    {...tagProps}
                    transaction={draft}
                />,
            );

            // When the user clears the tag on the same draft
            rerender(
                <FieldAutoSelector
                    {...tagProps}
                    transaction={{...draft, tag: ''}}
                />,
            );

            // Then it is not forced back, so the selection still happens only once per draft
            expect(mockSetMoneyRequestTag).toHaveBeenCalledTimes(1);
        });
    });
});
