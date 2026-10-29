import {render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import DynamicIOURequestStepParticipants from '@pages/iou/request/step/DynamicIOURequestStepParticipants';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createMock from '../../utils/createMock';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const SELF_DM_REPORT_ID = '1';
const TRANSACTION_ID = '1';
const POLICY_ID = '2';
const navigation = createMock<PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_PARTICIPANTS>['navigation']>({});

type CapturedSelectorProps = {shouldBlockParticipantSelection?: (policyID?: string) => boolean};

let latestSelectorProps: CapturedSelectorProps = {};

// The bug (#99710) lives in how DynamicIOURequestStepParticipants wires shouldBlockParticipantSelection,
// not in the picker's own rendering/search behavior, so the picker itself is stubbed to capture the prop.
jest.mock('@pages/iou/request/MoneyRequestParticipantsSelector', () => ({
    __esModule: true,
    default: (props: CapturedSelectorProps) => {
        latestSelectorProps = props;
        return null;
    },
}));

// useParticipantSubmission already has its own dedicated test coverage (useParticipantSubmissionTest.ts) and pulls in
// unrelated Onyx-backed hooks (draft transactions, policies, billing NVPs). Stubbing it isolates this test to the
// shouldBlockParticipantSelection wiring that #99710 actually broke.
jest.mock('@hooks/useParticipantSubmission', () => ({
    __esModule: true,
    default: () => ({addParticipant: jest.fn(), goToNextStep: jest.fn()}),
}));

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Dynamic_Money_Request_Step_Participants',
        params: {},
    })),
    getState: jest.fn(() => ({})),
    isReady: jest.fn(() => false),
    addListener: jest.fn(() => jest.fn()),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Step_Participants',
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

jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/core'),
    useIsFocused: () => true,
}));

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Dynamic_Money_Request_Step_Participants',
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

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

describe('DynamicIOURequestStepParticipants', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        latestSelectorProps = {};
        jest.clearAllTimers();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('blocks selecting a workspace with home-and-office commuter exclusions for a map distance expense when the user has no home address (#99710)', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const workspacePolicy = {
            ...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.TEAM),
            role: CONST.POLICY.ROLE.ADMIN,
            pendingAction: undefined,
            commuterExclusions: {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            },
        };
        const selfDMReport = {
            ...createRandomReport(Number(SELF_DM_REPORT_ID), CONST.REPORT.CHAT_TYPE.SELF_DM),
            ownerAccountID: ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspacePolicy.id}`, workspacePolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: 1000,
            currency: 'USD',
            created: '2026-09-07',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
        });
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <DynamicIOURequestStepParticipants
                                route={{
                                    key: 'Dynamic_Money_Request_Step_Participants--test',
                                    name: 'Dynamic_Money_Request_Step_Participants',
                                    params: {
                                        iouType: CONST.IOU.TYPE.SUBMIT,
                                        reportID: selfDMReport.reportID,
                                        transactionID: TRANSACTION_ID,
                                        action: CONST.IOU.ACTION.CREATE,
                                        isWorkspacesOnly: 'true',
                                    },
                                }}
                                navigation={navigation}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </HTMLProviderWrapper>
            </OnyxListItemProvider>,
        );

        // Wait for both withWritableReportOrNotFound and withFullTransactionOrNotFound to resolve past their
        // loading state and render the (stubbed) picker.
        await screen.findByTestId('DynamicIOURequestStepParticipants');

        expect(latestSelectorProps.shouldBlockParticipantSelection).toBeDefined();
        // Without isDistanceRequest wired in, this returned false for a map expense, letting the picker commit the
        // selection and navigate to Confirm even though the user has no home address — landing on "Choose recipient".
        expect(latestSelectorProps.shouldBlockParticipantSelection?.(workspacePolicy.id)).toBe(true);
    });

    it('allows selecting the same workspace once the user has a home address (#99710)', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        const workspacePolicy = {
            ...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.TEAM),
            role: CONST.POLICY.ROLE.ADMIN,
            pendingAction: undefined,
            commuterExclusions: {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            },
        };
        const selfDMReport = {
            ...createRandomReport(Number(SELF_DM_REPORT_ID), CONST.REPORT.CHAT_TYPE.SELF_DM),
            ownerAccountID: ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspacePolicy.id}`, workspacePolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            amount: 1000,
            currency: 'USD',
            created: '2026-09-07',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
        });
        await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US', current: true}]});
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <HTMLProviderWrapper>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <DynamicIOURequestStepParticipants
                                route={{
                                    key: 'Dynamic_Money_Request_Step_Participants--test',
                                    name: 'Dynamic_Money_Request_Step_Participants',
                                    params: {
                                        iouType: CONST.IOU.TYPE.SUBMIT,
                                        reportID: selfDMReport.reportID,
                                        transactionID: TRANSACTION_ID,
                                        action: CONST.IOU.ACTION.CREATE,
                                        isWorkspacesOnly: 'true',
                                    },
                                }}
                                navigation={navigation}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </HTMLProviderWrapper>
            </OnyxListItemProvider>,
        );

        await screen.findByTestId('DynamicIOURequestStepParticipants');

        expect(latestSelectorProps.shouldBlockParticipantSelection?.(workspacePolicy.id)).toBe(false);
    });
});
