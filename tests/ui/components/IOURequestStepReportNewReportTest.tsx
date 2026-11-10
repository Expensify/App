import {render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';

import DynamicIOURequestStepReportWithWritableReportOrNotFound from '@pages/iou/request/step/DynamicIOURequestStepReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createPolicyExpenseChat, createRandomReport} from '../../utils/collections/reports';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Dynamic_Money_Request_Report',
        params: {},
    })),
    getState: jest.fn(() => ({})),
    isReady: jest.fn(() => false),
    addListener: jest.fn(() => jest.fn()),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
        getActiveRoute: () => '',
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Report',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/actions/Transaction', () => {
    return {
        setTransactionReport: jest.fn(),
    };
});

jest.mock('@libs/actions/OutstandingReports', () => ({
    fetchOutstandingReports: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID_1 = '1';
const REPORT_ID_2 = '2';
const TRANSACTION_ID = '1';
const POLICY_ID_1 = '1';
const POLICY_ID_2 = '2';

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

const GENERATED_REPORT_ID = 'generated-report-not-in-onyx';
const WORKSPACE_CHAT_ID = '20';
const APPROVER_ACCOUNT_ID = 3;
const APPROVER_LOGIN = 'approver@user.com';

/** Opens the report list from the confirmation page's Report field while it shows "New report", which passes a generated report ID */
async function renderReportPickerForNewReport() {
    render(
        <OnyxListItemProvider>
            <HTMLProviderWrapper>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <DynamicIOURequestStepReportWithWritableReportOrNotFound
                            route={{
                                key: 'Dynamic_Money_Request_Report--30aPPAdjWan56sE5OpcG',
                                name: 'Dynamic_Money_Request_Report',
                                params: {
                                    action: 'create',
                                    iouType: 'submit',
                                    transactionID: TRANSACTION_ID,
                                    reportID: GENERATED_REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </HTMLProviderWrapper>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdates();
}

function buildExpenseReport(reportID: string, policyID: string, chatReportID: string) {
    return {
        ...createRandomReport(Number(reportID), undefined),
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID,
        chatReportID,
        ownerAccountID: ACCOUNT_ID,
        managerID: ACCOUNT_ID,
    };
}

/** An expense being created in the workspace chat of POLICY_ID_2, whose report was just submitted, which clears the chat's iouReportID */
async function givenExpenseInWorkspaceChatWithSubmittedReport() {
    await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: APPROVER_LOGIN}});
    const buildPolicy = (policyID: string) => ({
        ...createRandomPolicy(Number(policyID)),
        id: policyID,
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.TEAM,
        approver: APPROVER_LOGIN,
        owner: APPROVER_LOGIN,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        pendingAction: null,
        // A fixed membership, because the random policy may leave the user out, which hides the workspace from the list
        employeeList: {
            [ACCOUNT_LOGIN]: {email: ACCOUNT_LOGIN, role: CONST.POLICY.ROLE.USER, submitsTo: APPROVER_LOGIN},
            [APPROVER_LOGIN]: {email: APPROVER_LOGIN, role: CONST.POLICY.ROLE.ADMIN},
        },
    });
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_1}`, buildPolicy(POLICY_ID_1));
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID_2}`, buildPolicy(POLICY_ID_2));
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${WORKSPACE_CHAT_ID}`, {
        ...createPolicyExpenseChat(Number(WORKSPACE_CHAT_ID), true),
        reportID: WORKSPACE_CHAT_ID,
        policyID: POLICY_ID_2,
        ownerAccountID: ACCOUNT_ID,
        iouReportID: undefined,
    });
    // The report awaiting approval, which a submitter can still add expenses to when they pick it
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`, {
        ...buildExpenseReport(REPORT_ID_2, POLICY_ID_2, WORKSPACE_CHAT_ID),
        managerID: APPROVER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    });
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
        amount: 0,
        currency: 'USD',
        created: '2025-08-29',
        merchant: '(none)',
        transactionID: TRANSACTION_ID,
        isFromGlobalCreate: false,
        participants: [{accountID: 0, reportID: WORKSPACE_CHAT_ID, policyID: POLICY_ID_2, isPolicyExpenseChat: true, selected: true}],
    });
    await waitForBatchedUpdates();
}

describe('IOURequestStepReport with a generated New report ID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('should only list reports of the workspace the expense is created in when the Report field shows New report', async () => {
        // Given an expense in workspace B's chat, and an open report of the same user in workspace A
        await givenExpenseInWorkspaceChatWithSubmittedReport();
        const otherWorkspaceChatID = '21';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, buildExpenseReport(REPORT_ID_1, POLICY_ID_1, otherWorkspaceChatID));
        await waitForBatchedUpdates();

        // When the list opens with the generated report ID of "New report", which doesn't exist in Onyx
        await renderReportPickerForNewReport();

        // Then only workspace B's report is listed, because the expense is created in workspace B's chat
        expect(await screen.findByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${REPORT_ID_2}`)).toBeTruthy();
        expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${REPORT_ID_1}`)).toBeNull();
    });
});
