import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MenuItemProps} from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import SearchEditMultiplePage from '@pages/Search/SearchEditMultiple/SearchEditMultiplePage';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The page renders every bulk-editable field through this component, so mocking it exposes each
// field's `disabled` state directly instead of asserting on MenuItem internals.
jest.mock('@components/MenuItemWithTopDescription', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text} = require('react-native');
    return (props: MenuItemProps) => (
        <View
            testID={`menu-item-${props.description}`}
            accessibilityState={{disabled: !!props.disabled}}
        >
            <Text>{props.description}</Text>
        </View>
    );
});

const CURRENT_USER_ACCOUNT_ID = 5;
const CURRENT_USER_EMAIL = 'bjorn@vikings.net';
const POLICY_ID = 'policy1';
const OPEN_REPORT_ID = 'openReport';
const DONE_REPORT_ID = 'doneReport';
const OPEN_TRANSACTION_ID = 'openTransaction';
const DONE_TRANSACTION_ID = 'doneTransaction';

// `reimbursable: false` means the field is NOT disabled on the workspace, which is what makes the row render at all.
const policy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
    id: POLICY_ID,
    role: CONST.POLICY.ROLE.ADMIN,
    disabledFields: {reimbursable: false},
};

function buildReport(reportID: string, statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM>, stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM>): Report {
    return {
        ...createExpenseReport(reportID.length),
        reportID,
        policyID: POLICY_ID,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: CURRENT_USER_ACCOUNT_ID,
        stateNum,
        statusNum,
    };
}

function buildTransaction(transactionID: string, reportID: string): Transaction {
    return {
        ...createRandomTransaction(transactionID.length),
        transactionID,
        reportID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        managedCard: false,
        comment: {},
    };
}

function buildIOUAction(reportID: string, transactionID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    const message: OriginalMessageIOU & Message = {
        IOUTransactionID: transactionID,
        IOUReportID: reportID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        text: '',
    };
    return {
        ...createRandomReportAction(1),
        reportActionID: `action-${transactionID}`,
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        originalMessage: undefined,
        previousMessage: undefined,
        message,
    };
}

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
ThemeProviderWithLight.displayName = 'ThemeProviderWithLight';

function renderPage() {
    return render(
        <NavigationContainer>
            <ComposeProviders
                components={[
                    PortalProvider,
                    ThemeProviderWithLight,
                    ThemeStylesProvider,
                    OnyxListItemProvider,
                    LocaleContextProvider,
                    CurrencyListContextProvider,
                    CurrentUserPersonalDetailsProvider,
                    SearchContextProvider,
                ]}
            >
                <SearchEditMultiplePage />
            </ComposeProviders>
        </NavigationContainer>,
    );
}

async function selectTransactions(selectedTransactionIDs: string[]) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {
        transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
        selectedTransactionIDs,
    });
    await waitForBatchedUpdatesWithAct();
}

describe('SearchEditMultiplePage', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL}});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${OPEN_REPORT_ID}`, buildReport(OPEN_REPORT_ID, CONST.REPORT.STATUS_NUM.OPEN, CONST.REPORT.STATE_NUM.OPEN));
        // "Mark as done" on a Submit & Close workspace leaves the report APPROVED/CLOSED, which locks Reimbursable forever.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${DONE_REPORT_ID}`, buildReport(DONE_REPORT_ID, CONST.REPORT.STATUS_NUM.CLOSED, CONST.REPORT.STATE_NUM.APPROVED));
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${OPEN_TRANSACTION_ID}`, buildTransaction(OPEN_TRANSACTION_ID, OPEN_REPORT_ID));
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${DONE_TRANSACTION_ID}`, buildTransaction(DONE_TRANSACTION_ID, DONE_REPORT_ID));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPEN_REPORT_ID}`, {[`action-${OPEN_TRANSACTION_ID}`]: buildIOUAction(OPEN_REPORT_ID, OPEN_TRANSACTION_ID)});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${DONE_REPORT_ID}`, {[`action-${DONE_TRANSACTION_ID}`]: buildIOUAction(DONE_REPORT_ID, DONE_TRANSACTION_ID)});
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps Reimbursable editable when every selected expense is still editable', async () => {
        await selectTransactions([OPEN_TRANSACTION_ID]);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('menu-item-Reimbursable').props.accessibilityState).toEqual(expect.objectContaining({disabled: false}));
    });

    it('disables Reimbursable when the selection contains a marked-as-done expense', async () => {
        await selectTransactions([OPEN_TRANSACTION_ID, DONE_TRANSACTION_ID]);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('menu-item-Reimbursable').props.accessibilityState).toEqual(expect.objectContaining({disabled: true}));
    });
});
