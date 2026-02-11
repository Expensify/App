import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import IOURequestStepDistanceWithFullTransactionOrNotFound from '@pages/iou/request/step/IOURequestStepDistance';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Distance',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
        getActiveRoute: () => '',
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/actions/MapboxToken', () => ({
    init: jest.fn(),
    stop: jest.fn(),
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => () => ({
    didScreenTransitionEnd: true,
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '1';
const TRANSACTION_ID = '1';
const POLICY_ID = 'test-policy-id';
const CHAT_REPORT_ID = '2';
const INVOICE_RECEIVER_POLICY_ID = 'invoice-receiver-policy-id';

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

const DEFAULT_TRANSACTION: Transaction = {
    amount: 0,
    billable: false,
    comment: {
        waypoints: {
            waypoint0: {keyForList: 'start_waypoint'},
            waypoint1: {keyForList: 'stop_waypoint'},
        },
    },
    created: '2025-08-29',
    currency: 'USD',
    isFromGlobalCreate: false,
    merchant: '',
    participants: [],
    reimbursable: true,
    reportID: REPORT_ID,
    transactionID: TRANSACTION_ID,
};

describe('IOURequestStepDistance - invoice receiver policy coverage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllTimers();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render with invoice receiver policy hooks when report has chatReportID and invoiceReceiver', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const fakePolicy = {
            ...createRandomPolicy(Number(POLICY_ID)),
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
        };

        const fakeReport = {
            ...createRandomReport(Number(REPORT_ID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            chatReportID: CHAT_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            ownerAccountID: ACCOUNT_ID,
            participants: {
                [ACCOUNT_ID]: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    role: CONST.REPORT.ROLE.MEMBER,
                },
            },
        };

        const chatReport = {
            ...createRandomReport(Number(CHAT_REPORT_ID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
            reportID: CHAT_REPORT_ID,
            policyID: POLICY_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: INVOICE_RECEIVER_POLICY_ID,
            },
        };

        const invoiceReceiverPolicy = {
            ...createRandomPolicy(1),
            id: INVOICE_RECEIVER_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, fakeReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, fakePolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${INVOICE_RECEIVER_POLICY_ID}`, invoiceReceiverPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, DEFAULT_TRANSACTION);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepDistanceWithFullTransactionOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Distance--test',
                                    name: 'Money_Request_Step_Distance',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                        backTo: 'Money_Request_Step_Distance' as Route,
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

        // Verify the component rendered successfully (covers the useOnyx hooks for invoice receiver policies)
        // The component renders waypoint items - finding one confirms the full component mounted including useOnyx hooks
        const startWaypoint = await screen.findByLabelText('Start');
        expect(startWaypoint).toBeTruthy();
    });
});
