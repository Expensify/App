import {act, render} from '@testing-library/react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {SearchActionsContext, SearchStateContext, useSyncSelectedReports} from '@components/Search/SearchContext';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchActionsContextValue, SearchStateContextValue, SelectedReports, SelectedTransactions} from '@components/Search/types';
import CONST from '@src/CONST';

type HookData = TransactionListItemType[] | TransactionReportGroupListItemType[];

const createSetSelectedReportsMock = () => jest.fn<void, [SelectedReports[]]>();

const baseStateContext = {
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    currentSelectedTransactionReportID: undefined,
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    hasSelectedTransactions: false,
    currentSearchHash: -1,
    currentSimilarSearchHash: -1,
    suggestedSearches: {} as SearchStateContextValue['suggestedSearches'],
    sortedReportIDs: CONST.EMPTY_ARRAY,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldShowSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
    shouldUseLiveData: false,
} satisfies Omit<SearchStateContextValue, 'selectedTransactions'>;

function buildTransactionItem(overrides: Partial<TransactionListItemType> & {keyForList: string; transactionID: string}) {
    return {
        amount: 100,
        currency: 'USD',
        reportID: 'report_1',
        policyID: 'policy_1',
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
        report: undefined,
        ...overrides,
    } as unknown as TransactionListItemType;
}

function buildSelected(...keys: string[]): SelectedTransactions {
    return keys.reduce<SelectedTransactions>((acc, key) => {
        acc[key] = {
            isSelected: true,
            canReject: true,
            canHold: true,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: true,
            isFromOneTransactionReport: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: 'report_1',
            policyID: 'policy_1',
            amount: 100,
            currency: 'USD',
        };
        return acc;
    }, {});
}

type HarnessHandle = {
    setSelected: (next: SelectedTransactions) => void;
    setData: (next: HookData) => void;
};

function renderHarness({
    initialSelected,
    initialData,
    setSelectedReports,
}: {
    initialSelected: SelectedTransactions;
    initialData: HookData;
    setSelectedReports: SearchActionsContextValue['setSelectedReports'];
}): HarnessHandle {
    const handle: HarnessHandle = {
        setSelected: () => {},
        setData: () => {},
    };
    const captureHandle = (next: HarnessHandle) => {
        handle.setSelected = next.setSelected;
        handle.setData = next.setData;
    };

    function HookConsumer({data}: {data: HookData}) {
        useSyncSelectedReports(data);
        return null;
    }

    function Harness({onReady}: {onReady: (next: HarnessHandle) => void}) {
        const [selected, setSelected] = useState(initialSelected);
        const [data, setData] = useState(initialData);

        useEffect(() => {
            onReady({setSelected, setData});
        }, [onReady]);

        const stateValue = useMemo<SearchStateContextValue>(() => ({...baseStateContext, selectedTransactions: selected}), [selected]);

        const actionsValue = useMemo<SearchActionsContextValue>(
            () => ({
                setLastSearchType: () => {},
                setCurrentSelectedTransactionReportID: () => {},
                setSelectedTransactions: () => {},
                setSelectedReports,
                removeTransaction: () => {},
                clearSelectedTransactions: () => {},
                setShouldShowFiltersBarLoading: () => {},
                setShouldShowSelectAllMatchingItems: () => {},
                selectAllMatchingItems: () => {},
                setShouldResetSearchQuery: () => {},
                setSortedReportIDs: () => {},
            }),
            [],
        );

        return (
            <SearchStateContext value={stateValue}>
                <SearchActionsContext value={actionsValue}>
                    <HookConsumer data={data} />
                </SearchActionsContext>
            </SearchStateContext>
        );
    }

    render(<Harness onReady={captureHandle} />);
    return handle;
}

describe('useSyncSelectedReports', () => {
    it('derives selectedReports from selectedTransactions + visible rows on mount', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const data = [
            buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'}),
            buildTransactionItem({keyForList: 'tx_2', transactionID: 'tx_2', reportID: 'report_b'}),
        ];

        renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData: data,
            setSelectedReports,
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);
        const reports = setSelectedReports.mock.calls.at(0)?.at(0) ?? [];
        expect(reports).toHaveLength(1);
        expect(reports.at(0)?.reportID).toBe('report_a');
    });

    it('emits an empty list when nothing in data matches the current selection', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const data = [buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1'})];

        renderHarness({
            initialSelected: buildSelected('tx_does_not_exist'),
            initialData: data,
            setSelectedReports,
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);
        expect(setSelectedReports.mock.calls.at(0)?.at(0)).toEqual([]);
    });

    it('emits an empty list when data is empty', () => {
        const setSelectedReports = createSetSelectedReportsMock();

        renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData: [],
            setSelectedReports,
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);
        expect(setSelectedReports.mock.calls.at(0)?.at(0)).toEqual([]);
    });

    it('re-derives when selectedTransactions changes', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const data = [
            buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'}),
            buildTransactionItem({keyForList: 'tx_2', transactionID: 'tx_2', reportID: 'report_b'}),
        ];

        const handle = renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData: data,
            setSelectedReports,
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);

        act(() => {
            handle.setSelected(buildSelected('tx_2'));
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(2);
        const latest = setSelectedReports.mock.calls.at(1)?.at(0) ?? [];
        expect(latest).toHaveLength(1);
        expect(latest.at(0)?.reportID).toBe('report_b');
    });

    it('does NOT re-fire when only the `data` argument changes', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const initialData = [buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'})];

        const handle = renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData,
            setSelectedReports,
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);

        // A new `data` array (e.g. Onyx push) must not trigger the derivation effect,
        // otherwise a stale `selectedTransactions` from closure could clobber an
        // atomic update made in the same commit by `setSelectedTransactions`.
        act(() => {
            handle.setData([
                buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'}),
                buildTransactionItem({keyForList: 'tx_2', transactionID: 'tx_2', reportID: 'report_b'}),
            ]);
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(1);
    });

    it('uses the latest `data` (via ref) when selection changes after a data update', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const initialData = [buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'})];

        const handle = renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData,
            setSelectedReports,
        });

        // Update data first — should not fire.
        act(() => {
            handle.setData([
                buildTransactionItem({keyForList: 'tx_1', transactionID: 'tx_1', reportID: 'report_a'}),
                buildTransactionItem({keyForList: 'tx_2', transactionID: 'tx_2', reportID: 'report_b'}),
            ]);
        });
        expect(setSelectedReports).toHaveBeenCalledTimes(1);

        // Then change the selection — the derive must see the *new* data via the ref.
        act(() => {
            handle.setSelected(buildSelected('tx_2'));
        });

        expect(setSelectedReports).toHaveBeenCalledTimes(2);
        const latest = setSelectedReports.mock.calls.at(1)?.at(0) ?? [];
        expect(latest).toHaveLength(1);
        expect(latest.at(0)?.reportID).toBe('report_b');
    });

    it('honors `modifiedAmount` over `amount` when computing total', () => {
        const setSelectedReports = createSetSelectedReportsMock();
        const data = [
            buildTransactionItem({
                keyForList: 'tx_1',
                transactionID: 'tx_1',
                reportID: 'report_a',
                amount: 100,
                modifiedAmount: 250,
            }),
        ];

        renderHarness({
            initialSelected: buildSelected('tx_1'),
            initialData: data,
            setSelectedReports,
        });

        const reports = setSelectedReports.mock.calls.at(0)?.at(0) ?? [];
        expect(reports.at(0)?.total).toBe(250);
    });
});
