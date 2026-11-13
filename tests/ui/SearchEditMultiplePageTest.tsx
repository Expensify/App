import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {updateMultipleMoneyRequests} from '@libs/actions/IOU/BulkEdit';
import type * as BulkEditActions from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';

import SearchEditMultiplePage from '@pages/Search/SearchEditMultiple/SearchEditMultiplePage';

import initOnyxDerivedValues from '@userActions/OnyxDerived';
import {getPolicyCategories} from '@userActions/Policy/Category';
import {openPolicyTagsPage} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';

import type {ComponentProps} from 'react';
import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator as RNActivityIndicator} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Saving runs a heavy Onyx update, so it is stubbed to observe when it runs relative to the spinner.
jest.mock('@libs/actions/IOU/BulkEdit', () => ({
    ...jest.requireActual<typeof BulkEditActions>('@libs/actions/IOU/BulkEdit'),
    updateMultipleMoneyRequests: jest.fn(),
}));

jest.mock('@userActions/Policy/Category', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Policy/Category'),
    getPolicyCategories: jest.fn(),
}));

jest.mock('@userActions/Policy/Tag', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Policy/Tag'),
    openPolicyTagsPage: jest.fn(),
}));

jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: () => false,
    isBetaEnabledOrUnknown: () => false,
}));

// Records what each selectable row decided, so a test can read it without pressing the row and measuring a layout.
const mockShouldOpenInDropdownByRow: Record<string, boolean> = {};
const mockValueByRow: Record<string, string | undefined> = {};
type ExpenseFieldDropdownMockProps = Pick<ComponentProps<typeof ExpenseFieldDropdown>, 'name' | 'shouldOpenInDropdown' | 'value'>;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => ({name, shouldOpenInDropdown, value}: ExpenseFieldDropdownMockProps) => {
    mockShouldOpenInDropdownByRow[name] = shouldOpenInDropdown;
    mockValueByRow[name] = value;
    return null;
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

async function selectTransactions(selectedTransactionIDs: string[], draftChanges: Partial<Transaction> = {}) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {
        ...draftChanges,
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
        jest.clearAllMocks();
        for (const rowName of Object.keys(mockShouldOpenInDropdownByRow)) {
            delete mockShouldOpenInDropdownByRow[rowName];
            delete mockValueByRow[rowName];
        }
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
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps Reimbursable editable when every selected expense is still editable', async () => {
        // Given a selection whose every expense can still be edited
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the Reimbursable row opens its list in place
        expect(mockShouldOpenInDropdownByRow.Reimbursable).toBe(true);
    });

    it('leaves Reimbursable empty until a value is picked, then shows it', async () => {
        // Given a selection where nothing has been picked for Reimbursable yet
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the row is empty like the other untouched fields, since each expense keeps its own value
        expect(mockValueByRow.Reimbursable).toBe('');

        // When No is picked
        await selectTransactions([OPEN_TRANSACTION_ID], {reimbursable: false});

        // Then the row shows it
        expect(mockValueByRow.Reimbursable).toBe('No');
    });

    it('sets every selected expense to non-reimbursable when No is picked', async () => {
        // Given a selection whose Reimbursable was set to No, which a switch could not tell apart from leaving it alone
        await selectTransactions([OPEN_TRANSACTION_ID], {reimbursable: false});

        // When the changes are saved
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then every selected expense is marked non-reimbursable
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({changes: {reimbursable: false}}));
    });

    it('locks Reimbursable when the selection contains a marked-as-done expense', async () => {
        // Given a selection with an expense whose report is closed, which locks Reimbursable
        await selectTransactions([OPEN_TRANSACTION_ID, DONE_TRANSACTION_ID]);

        // When the page renders and the changes are saved
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the Reimbursable row can't open its list, and nothing is pending to apply
        expect(mockShouldOpenInDropdownByRow.Reimbursable).toBe(false);
        expect(updateMultipleMoneyRequests).not.toHaveBeenCalled();
    });

    it('shows Reimbursable for "Do Not Force" company card expenses on an "Always" workspace', async () => {
        // Given a workspace whose cash expenses are always non-reimbursable, and a company card expense stamped "Do Not Force"
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {defaultReimbursable: false, disabledFields: {reimbursable: true}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${OPEN_TRANSACTION_ID}`, {managedCard: true, comment: {forceReimbursable: null}});
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the Reimbursable row shows, because the workspace cash expense rules don't apply to card expenses
        expect(mockShouldOpenInDropdownByRow.Reimbursable).toBeDefined();
    });

    it.each([true, false])('hides Reimbursable when the selection contains a company card expense forced to %s', async (forceReimbursable) => {
        // Given a cash expense and a company card expense locked at import
        const cardTransactionID = 'cardTransaction';
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${cardTransactionID}`, {
            ...buildTransaction(cardTransactionID, OPEN_REPORT_ID),
            managedCard: true,
            reimbursable: forceReimbursable,
            comment: {forceReimbursable},
        });
        await selectTransactions([OPEN_TRANSACTION_ID, cardTransactionID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the Reimbursable row is hidden, because the forced expense's reimbursable value can't change
        expect(mockShouldOpenInDropdownByRow.Reimbursable).toBeUndefined();
    });

    it.each([
        [undefined, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_NO, true],
        [null, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_YES, true],
        [true, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_NO, false],
        [false, CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES, false],
    ] as const)('keeps restriction %s when the current feed setting is %s', async (forceReimbursable, feedSetting, expectedEditable) => {
        // Given an imported company card expense whose feed setting has since changed
        const cardID = 1234;
        const fundID = '5678';
        const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${OPEN_TRANSACTION_ID}`, {managedCard: true, cardID, comment: {forceReimbursable}});
        await Onyx.set(ONYXKEYS.CARD_LIST, {[cardID]: {cardID, bank: feed, fundID, state: CONST.EXPENSIFY_CARD.STATE.OPEN}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${fundID}`, {
            settings: {companyCards: {[feed]: {forceReimbursable: feedSetting}}},
        });
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the row follows the expense's saved restriction, not the current feed setting
        if (expectedEditable) {
            expect(mockShouldOpenInDropdownByRow.Reimbursable).toBeDefined();
        } else {
            expect(mockShouldOpenInDropdownByRow.Reimbursable).toBeUndefined();
        }
    });

    it.each([true, false])('hides Reimbursable for an unreported company card expense forced to %s', async (forceReimbursable) => {
        // Given a forced company card expense that has not been added to a report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${OPEN_TRANSACTION_ID}`, {
            managedCard: true,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            reimbursable: forceReimbursable,
            comment: {forceReimbursable},
        });
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then unreported expenses still respect their saved restriction
        expect(mockShouldOpenInDropdownByRow.Reimbursable).toBeUndefined();
    });

    it('shows the spinner before applying the changes on save, then applies them and dismisses the RHP', async () => {
        // Given a bulk edit with a pending merchant change on an expense that is not finalized, so no confirm modal shows
        const dismissSpy = jest.spyOn(Navigation, 'dismissToPreviousRHP').mockImplementation(() => {});
        await selectTransactions([OPEN_TRANSACTION_ID], {merchant: 'New merchant'});
        const renderResult = renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Save is pressed
        fireEvent.press(screen.getByText('Save'));

        // Then the spinner is painted first and the heavy update has not run yet, which is what save hands to startWithLoading for
        expect(renderResult.UNSAFE_queryByType(RNActivityIndicator)).not.toBeNull();
        expect(updateMultipleMoneyRequests).not.toHaveBeenCalled();

        // When the deferred macrotask fires
        await waitForBatchedUpdatesWithAct();

        // Then the changes are applied to the selected expense and the RHP is dismissed
        expect(updateMultipleMoneyRequests).toHaveBeenCalledTimes(1);
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({transactionIDs: [OPEN_TRANSACTION_ID], changes: {merchant: 'New merchant'}}));
        expect(dismissSpy).toHaveBeenCalledTimes(1);
    });

    it('fetches policy categories and tags when they are enabled but not loaded yet', async () => {
        // Given a workspace with categories and tags enabled whose categories and tags were never loaded, as after a cache clear
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true, areTagsEnabled: true});
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it fetches them itself, since the search snapshot doesn't include them and the Category/Tag rows depend on them
        expect(getPolicyCategories).toHaveBeenCalledWith(POLICY_ID);
        expect(openPolicyTagsPage).toHaveBeenCalledWith(POLICY_ID);
    });

    it('fetches policy categories and tags when only a partial set is in Onyx', async () => {
        // Given a lazy-loaded account that only holds the category and tag already on its expenses, with no completed read
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true, areTagsEnabled: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Food: {name: 'Food', enabled: true}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {Department: {name: 'Department', required: false, orderWeight: 0, tags: {Sales: {name: 'Sales', enabled: true}}}});
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it still fetches them, because a partial collection can be missing other categories or whole tag lists
        expect(getPolicyCategories).toHaveBeenCalledWith(POLICY_ID);
        expect(openPolicyTagsPage).toHaveBeenCalledWith(POLICY_ID);
    });

    it('does not refetch policy categories and tags that are already loaded', async () => {
        // Given a workspace with categories and tags enabled whose categories and tags were already fully loaded
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true, areTagsEnabled: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Food: {name: 'Food', enabled: true}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {Department: {name: 'Department', required: false, orderWeight: 0, tags: {Sales: {name: 'Sales', enabled: true}}}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${POLICY_ID}`, {isLoading: false, hasOnceLoaded: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${POLICY_ID}`, {isLoading: false, hasOnceLoaded: true});
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then no extra request is made, so opening the page doesn't add network traffic when the data is already available
        expect(getPolicyCategories).not.toHaveBeenCalled();
        expect(openPolicyTagsPage).not.toHaveBeenCalled();
    });

    it('keeps Merchant editable when a selected expense on the open report has no IOU action', async () => {
        // Given an expense with no IOU action on an open report the current user submitted
        const actionlessTransactionID = 'actionlessTransaction';
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${actionlessTransactionID}`, buildTransaction(actionlessTransactionID, OPEN_REPORT_ID));
        await selectTransactions([OPEN_TRANSACTION_ID, actionlessTransactionID]);

        // When the Edit multiple page is opened for the selection
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then Merchant stays an editable input, because the report's submitter stands in for the missing action's requester
        fireEvent.changeText(screen.getByLabelText('Merchant'), 'Starbucks');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({changes: {merchant: 'Starbucks'}}));
    });

    it('shows the currency on the amount input and saves a picked currency', async () => {
        // Given a selection whose draft holds a currency picked from the amount input's currency button
        await selectTransactions([OPEN_TRANSACTION_ID], {currency: CONST.CURRENCY.EUR});

        // When the Edit multiple page is opened and the changes are saved
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(CONST.CURRENCY.EUR)).toBeOnTheScreen();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the picked currency is applied to the selected expenses
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({changes: {currency: CONST.CURRENCY.EUR}}));
    });

    it('saves a typed amount in the currency the amount input shows', async () => {
        // Given a selection on a workspace whose currency the amount input shows, and no currency picked
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {outputCurrency: CONST.CURRENCY.EUR});
        await selectTransactions([OPEN_TRANSACTION_ID], {amount: 5000});

        // When the Edit multiple page is opened and the changes are saved
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(CONST.CURRENCY.EUR)).toBeOnTheScreen();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the amount goes with that currency, as each expense would otherwise keep its own and read as a different amount
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({changes: {amount: 5000, currency: CONST.CURRENCY.EUR}}));
    });

    it('accepts a negative amount when every selected expense allows one', async () => {
        // Given an expense on a workspace expense report, which can hold a negative amount
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When a minus sign and then an amount are typed, and the changes are saved
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText('Amount'), '-');
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText('Amount'), '-5');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the lone minus sign is kept while typing and the negative amount is what gets applied
        expect(updateMultipleMoneyRequests).toHaveBeenCalledWith(expect.objectContaining({changes: expect.objectContaining({amount: -500})}));
    });

    it('locks Merchant when a selected expense is a distance expense', async () => {
        // Given a selection with a distance expense, whose merchant is computed from the route
        const distanceTransactionID = 'distanceTransaction';
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${distanceTransactionID}`, {
            ...buildTransaction(distanceTransactionID, OPEN_REPORT_ID),
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT, customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE}},
        });
        await selectTransactions([OPEN_TRANSACTION_ID, distanceTransactionID]);

        // When the Edit multiple page is opened for the selection
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then Merchant is a locked field rather than an input
        expect(screen.getByLabelText(/^Merchant/).props.onChangeText).toBeUndefined();
    });

    it('does not save while the merchant typed is not a valid merchant', async () => {
        // Given the merchant input holds the placeholder merchant, which the form flags inline
        await selectTransactions([OPEN_TRANSACTION_ID]);
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByLabelText('Merchant'), CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
        await waitForBatchedUpdatesWithAct();

        // When Save is pressed
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the error stays on the field and nothing is applied
        expect(screen.getByText('Please enter a valid merchant')).toBeTruthy();
        expect(updateMultipleMoneyRequests).not.toHaveBeenCalled();
    });

    it('opens the category list in place', async () => {
        // Given a workspace with categories
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Food: {name: 'Food', enabled: true}});
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page renders the category row
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the row opens its list in a container anchored to it rather than on its own page
        expect(mockShouldOpenInDropdownByRow.Category).toBe(true);
    });

    it('keeps the full-page tag selector for dependent tags, which need the levels above', async () => {
        // Given a workspace with dependent tag lists
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areTagsEnabled: true, hasMultipleTagLists: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {
            Region: {name: 'Region', required: false, orderWeight: 0, tags: {EMEA: {name: 'EMEA', enabled: true, rules: {parentTagsFilter: ''}}}},
            Country: {name: 'Country', required: false, orderWeight: 1, tags: {Spain: {name: 'Spain', enabled: true, rules: {parentTagsFilter: 'EMEA'}}}},
        });
        await selectTransactions([OPEN_TRANSACTION_ID]);

        // When the Edit multiple page renders the first tag row
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the row keeps the full-page selector, which walks the levels in order
        expect(mockShouldOpenInDropdownByRow.Region).toBe(false);
    });
});
