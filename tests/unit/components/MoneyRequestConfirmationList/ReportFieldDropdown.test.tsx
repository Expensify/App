import {act, render} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ReportFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ReportFieldDropdown';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ReportPickerModalProps} from '@components/ReportPicker/ReportPickerModal';

import {setTransactionReport} from '@libs/actions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// Only the write matters here, so the action is stubbed to record what it is asked to save.
jest.mock('@libs/actions/Transaction', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Transaction'),
    setTransactionReport: jest.fn(),
}));

jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));

// The list itself is covered by the ReportPickerModal and full-page tests; here only what the dropdown hands it, and what it does with a pick, matter.
let mockModalProps: ReportPickerModalProps | undefined;
jest.mock('@components/ReportPicker/ReportPickerModal', () => (props: ReportPickerModalProps) => {
    mockModalProps = props;
    return null;
});

const TRANSACTION_ID = '1';
const POLICY_ID = 'policy1';
const CHAT_REPORT_ID = 'chat1';
const CURRENT_REPORT_ID = 'report1';
const OTHER_REPORT_ID = 'report2';

const chatReport: Report = {reportID: CHAT_REPORT_ID, policyID: POLICY_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, iouReportID: CURRENT_REPORT_ID};
const currentReport: Report = {reportID: CURRENT_REPORT_ID, policyID: POLICY_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE};
const otherReport: Report = {reportID: OTHER_REPORT_ID, policyID: POLICY_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE};

const renderDropdown = (onClose: jest.Mock) =>
    render(
        <OnyxListItemProvider>
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={CHAT_REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                isPolicyExpenseChat
            >
                <ReportFieldDropdown
                    isVisible
                    onClose={onClose}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                    shouldMeasureAnchorPositionFromTop
                    shouldSwitchPositionIfOverflow={false}
                    popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                    popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                    transactionID={TRANSACTION_ID}
                />
            </ConfirmationFieldsProvider>
        </OnyxListItemProvider>,
    );

describe('ReportFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockModalProps = undefined;
        jest.mocked(setTransactionReport).mockClear();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CURRENT_REPORT_ID}`, currentReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, otherReport);
        await waitForBatchedUpdates();
    });

    it('moves the draft expense to the picked report at once and closes', async () => {
        // Given a draft expense being created in a workspace chat whose open report is `report1`
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the report row's dropdown opens and the user picks `report2`
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        expect(mockModalProps?.selectedReportID).toBe(CURRENT_REPORT_ID);
        expect(mockModalProps?.transactionIDs).toEqual([TRANSACTION_ID]);
        act(() => mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID}));

        // Then the draft is moved to `report2` straight away, with no screen transition to wait for, and the container closes
        expect(setTransactionReport).toHaveBeenCalledTimes(1);
        expect(setTransactionReport).toHaveBeenCalledWith(
            TRANSACTION_ID,
            {reportID: OTHER_REPORT_ID, participants: [{selected: true, accountID: 0, isPolicyExpenseChat: true, reportID: CHAT_REPORT_ID, policyID: POLICY_ID}]},
            true,
        );
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('moves an expense started from the global create button the same way', async () => {
        // Given a draft expense started from the global create button, which the full page handles through its own path
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            isFromGlobalCreate: true,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the user picks `report2` in the dropdown
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID}));

        // Then the draft is moved to `report2` and the container closes, without the page's navigation
        expect(setTransactionReport).toHaveBeenCalledWith(TRANSACTION_ID, expect.objectContaining({reportID: OTHER_REPORT_ID}), true);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('only closes when the current report is picked again', async () => {
        // Given a draft expense already on `report1`
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When `report1` is picked again
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.selectReport({value: CURRENT_REPORT_ID, keyForList: CURRENT_REPORT_ID, policyID: POLICY_ID}));

        // Then nothing is written and the container closes
        expect(setTransactionReport).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
