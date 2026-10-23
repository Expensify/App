import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import UserInfoAndActionButtonRow from '@components/Search/SearchList/ListItem/UserInfoAndActionButtonRow';

import DuplicateTransactionItem from '@pages/TransactionDuplicate/DuplicateTransactionItem';

import {createTransactionThreadReport} from '@userActions/Report';
import type * as ReportActions from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report, ReportAction, Transaction} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportActions>('@userActions/Report'),
    createTransactionThreadReport: jest.fn<ReturnType<typeof createTransactionThreadReport>, Parameters<typeof createTransactionThreadReport>>(),
}));

const OWNER = {accountID: 41, displayName: 'Duplicate owner', login: 'owner@example.com'} satisfies PersonalDetails;
const REPORT = {
    reportID: '710',
    ownerAccountID: OWNER.accountID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    currency: CONST.CURRENCY.USD,
} satisfies Report;
const TRANSACTION = {
    transactionID: '510',
    reportID: REPORT.reportID,
    amount: -1234,
    currency: CONST.CURRENCY.USD,
    created: '2026-10-01',
    merchant: 'Duplicate merchant',
    comment: {comment: 'Duplicate preview'},
} satisfies Transaction;
const IOU_ACTION = {
    reportActionID: '810',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: OWNER.accountID,
    created: '2026-10-01 12:00:00',
    originalMessage: {IOUTransactionID: TRANSACTION.transactionID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: TRANSACTION.amount, currency: TRANSACTION.currency},
    message: [{type: 'COMMENT', text: 'Expense created', html: 'Expense created'}],
} satisfies ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
const CHILD_REPORT_ID = '910';
const CREATED_REPORT_ID = '911';

type DuplicateItemProps = Parameters<typeof DuplicateTransactionItem>[0];
type DuplicateRenderOptions = Partial<Pick<DuplicateItemProps, 'transaction' | 'shouldShowSelection'>> & {
    report?: Report | null;
    action?: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> | null;
    owner?: PersonalDetails | null;
};

async function renderDuplicate(options: DuplicateRenderOptions = {}) {
    const transaction = 'transaction' in options ? options.transaction : TRANSACTION;
    const report = 'report' in options ? options.report : REPORT;
    const action = 'action' in options ? options.action : IOU_ACTION;
    const owner = 'owner' in options ? options.owner : OWNER;
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        if (report) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            if (action) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[action.reportActionID]: action});
            }
        }
        if (transaction) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        }
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, owner ? {[owner.accountID]: owner} : {});
        await waitForBatchedUpdatesWithAct();
    });
    const onSelectTransaction = jest.fn<ReturnType<DuplicateItemProps['onSelectTransaction']>, Parameters<DuplicateItemProps['onSelectTransaction']>>();
    const onPreviewPressed = jest.fn<ReturnType<DuplicateItemProps['onPreviewPressed']>, Parameters<DuplicateItemProps['onPreviewPressed']>>();
    const view = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider, HTMLEngineProvider]}>
            <PortalProvider>
                <DuplicateTransactionItem
                    transaction={transaction}
                    isLastItem
                    isSelected={false}
                    shouldShowSelection={options.shouldShowSelection}
                    onSelectTransaction={onSelectTransaction}
                    onPreviewPressed={onPreviewPressed}
                />
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return {...view, onSelectTransaction, onPreviewPressed};
}

describe('DuplicateTransactionItem ordinary transaction view', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        jest.clearAllMocks();
        jest.mocked(createTransactionThreadReport).mockReset();
    });

    it('renders the real owner, status and transaction row and selects its transactionID', async () => {
        // Given an ordinary transaction has no grouped search or formatted search fields
        const {onSelectTransaction, onPreviewPressed} = await renderDuplicate();

        // When the user selects its actual radio control
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO));

        // Then the real row and status retain the owner, money and selection identity
        expect(screen.getByText(OWNER.displayName)).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('common.outstanding'))).toBeOnTheScreen();
        expect(screen.getByText(TRANSACTION.merchant)).toBeOnTheScreen();
        expect(screen.getByTestId('transaction-item-row')).toHaveTextContent(/12\.34/);
        expect(onSelectTransaction).toHaveBeenCalledTimes(1);
        expect(onSelectTransaction).toHaveBeenCalledWith(TRANSACTION.transactionID);
        expect(onPreviewPressed).not.toHaveBeenCalled();
    });

    it('omits the selection control when selection is disabled', async () => {
        // Given preview-only rows still need their actual transaction content
        // When selection is disabled at the production item boundary
        await renderDuplicate({shouldShowSelection: false});

        // Then only the radio control is absent
        expect(screen.queryByRole(CONST.ROLE.RADIO)).not.toBeOnTheScreen();
        expect(screen.getByText(TRANSACTION.merchant)).toBeOnTheScreen();
    });

    it('previews an existing child thread without creating another one', async () => {
        // Given the matching IOU action already identifies its child thread
        const {onPreviewPressed} = await renderDuplicate({action: {...IOU_ACTION, childReportID: CHILD_REPORT_ID}});

        // When the actual duplicate row is pressed
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TRANSACTION.comment.comment}));

        // Then the child destination wins over the parent report and thread creation
        expect(onPreviewPressed).toHaveBeenCalledTimes(1);
        expect(onPreviewPressed).toHaveBeenCalledWith(CHILD_REPORT_ID, TRANSACTION.transactionID);
        expect(createTransactionThreadReport).not.toHaveBeenCalled();
    });

    it('previews the reportID returned by thread creation', async () => {
        // Given the lower action returns an intentional partial optimistic report with a new identity
        jest.mocked(createTransactionThreadReport).mockReturnValue(createMock<NonNullable<ReturnType<typeof createTransactionThreadReport>>>({reportID: CREATED_REPORT_ID}));
        const {onPreviewPressed} = await renderDuplicate();

        // When no existing child is available and the row is pressed
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TRANSACTION.comment.comment}));

        // Then the item passes its real source data and previews only the created thread
        await waitFor(() => expect(createTransactionThreadReport).toHaveBeenCalledTimes(1));
        expect(createTransactionThreadReport).toHaveBeenCalledWith(
            expect.objectContaining({
                transaction: TRANSACTION,
                iouReport: REPORT,
                iouReportAction: IOU_ACTION,
                personalDetails: {[OWNER.accountID]: OWNER},
            }),
        );
        expect(onPreviewPressed).toHaveBeenCalledTimes(1);
        expect(onPreviewPressed).toHaveBeenCalledWith(CREATED_REPORT_ID, TRANSACTION.transactionID);
    });

    it.each([undefined, createMock<NonNullable<ReturnType<typeof createTransactionThreadReport>>>({})])('does not preview when thread creation has no reportID (%s)', async (created) => {
        // Given the action can fail or return an incomplete optimistic result
        jest.mocked(createTransactionThreadReport).mockReturnValue(created);
        const {onPreviewPressed} = await renderDuplicate();

        // When the user asks to preview without an existing child
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TRANSACTION.comment.comment}));

        // Then an absent destination never becomes a parent-report preview
        expect(createTransactionThreadReport).toHaveBeenCalledTimes(1);
        expect(onPreviewPressed).not.toHaveBeenCalled();
    });

    it('renders nothing for null transaction', async () => {
        // Given malformed runtime input can supply null outside the declared OnyxEntry domain
        // When the real item receives that value at its typed transaction boundary
        const {onPreviewPressed, onSelectTransaction} = await renderDuplicate({
            // @ts-expect-error Runtime compatibility includes null although OnyxEntry declares only undefined absence.
            transaction: null,
        });

        // Then the existing guard hides content and controls without triggering callbacks
        expect(screen.queryByTestId('transaction-item-row')).not.toBeOnTheScreen();
        expect(screen.queryByRole(CONST.ROLE.RADIO)).not.toBeOnTheScreen();
        expect(onPreviewPressed).not.toHaveBeenCalled();
        expect(onSelectTransaction).not.toHaveBeenCalled();
    });

    it.each([
        {name: 'missing transaction', options: {transaction: undefined}},
        {name: 'missing report', options: {report: null}},
        {name: 'missing action', options: {action: null}},
    ] satisfies Array<{name: string; options: DuplicateRenderOptions}>)('renders nothing for $name', async ({options}) => {
        // Given the item cannot identify a complete source transaction and matching report action
        // When the real item evaluates its existing guards
        const {onPreviewPressed, onSelectTransaction} = await renderDuplicate(options);

        // Then neither row content nor interactive controls are exposed
        expect(screen.queryByTestId('transaction-item-row')).not.toBeOnTheScreen();
        expect(screen.queryByRole(CONST.ROLE.RADIO)).not.toBeOnTheScreen();
        expect(onPreviewPressed).not.toHaveBeenCalled();
        expect(onSelectTransaction).not.toHaveBeenCalled();
    });

    it('omits only the status view when the report owner is missing', async () => {
        // Given the report and action exist but personal details have not arrived
        // When the real item renders without its owner
        const view = await renderDuplicate({owner: null});

        // Then transaction rendering survives without manufacturing owner data
        expect(screen.getByText(TRANSACTION.merchant)).toBeOnTheScreen();
        expect(view.UNSAFE_queryByType(UserInfoAndActionButtonRow)).toBeNull();
        expect(screen.queryByText(translateLocal('common.outstanding'))).not.toBeOnTheScreen();
    });

    it('keeps an empty owner display name without dropping the status row', async () => {
        // Given PersonalDetails permits an account with no displayName field
        // When the real status row receives that owner
        const view = await renderDuplicate({owner: {accountID: OWNER.accountID}});

        // Then the existing fallback is empty and the actual status still renders
        const statusRow = view.UNSAFE_getByType(UserInfoAndActionButtonRow);
        expect(statusRow.props).toMatchObject({
            item: {
                ...REPORT,
                from: {accountID: OWNER.accountID},
                to: {accountID: OWNER.accountID},
                formattedFrom: '',
            } satisfies Parameters<typeof UserInfoAndActionButtonRow>[0]['item'],
        });
        expect(screen.getByText(translateLocal('common.outstanding'))).toBeOnTheScreen();
        expect(screen.queryByText('undefined')).not.toBeOnTheScreen();
    });

    it.each([
        {reportID: CONST.REPORT.TRASH_REPORT_ID, expectedStatus: 'iou.deleted'},
        {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, expectedStatus: 'common.unreported'},
    ] as const)('preserves status for report $reportID', async ({reportID, expectedStatus}) => {
        // Given deletion is determined by reportID and unreported status by absent state and status numbers
        const report = {reportID, ownerAccountID: OWNER.accountID, type: CONST.REPORT.TYPE.EXPENSE} satisfies Report;

        // When the actual status component consumes the duplicate report view
        await renderDuplicate({report, transaction: {...TRANSACTION, reportID}});

        // Then retaining reportID in the consumed view is necessary for the correct label
        expect(screen.getByText(translateLocal(expectedStatus))).toBeOnTheScreen();
        expect(screen.getByText(TRANSACTION.merchant)).toBeOnTheScreen();
    });
});
