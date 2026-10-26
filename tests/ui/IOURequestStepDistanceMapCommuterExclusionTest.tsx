import {act, render} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepDistanceMap from '@pages/iou/request/step/IOURequestStepDistanceMap';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockConfirmModalResult = {action: ValueOf<typeof ModalActions>};

const mockShowConfirmModal = jest.fn<Promise<MockConfirmModalResult>, [Record<string, unknown>]>();

// Plain object, not a jest mock, so `jest.clearAllMocks()` can't wipe the captured props.
const mockTabContentProps = {current: undefined as {submitWaypoints?: () => void} | undefined};

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));

jest.mock('@pages/iou/request/step/DistanceMapTabContent', () => ({
    __esModule: true,
    default: (props: {submitWaypoints: () => void}) => {
        mockTabContentProps.current = props;
        return null;
    },
}));

// Needs a navigator-provided route object, and the discard prompt is unrelated to the guard under test.
jest.mock('@hooks/useDiscardChangesConfirmation', () => ({
    __esModule: true,
    default: () => ({suppressDiscardPrompt: jest.fn()}),
}));

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@libs/actions/MapboxToken', () => ({
    init: jest.fn(),
    stop: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'member@example.com';
const SELF_DM_REPORT_ID = 'selfDM1';
const WORKSPACE_CHAT_REPORT_ID = 'workspaceChat1';
const RESTRICTED_POLICY_ID = 'restrictedPolicy1';
const TRANSACTION_ID = 'transaction1';

type DistanceMapScreenProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP>;

/**
 * Seeds the state from the bug report: the member's only (and therefore default) workspace excludes commutes by
 * home and office, and the member has no home address saved.
 */
async function setUpOnyx() {
    await act(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: ACCOUNT_LOGIN}});
        await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: []});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, RESTRICTED_POLICY_ID);
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.POLICY}${RESTRICTED_POLICY_ID}`,
            createMock<Policy>({
                id: RESTRICTED_POLICY_ID,
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.USER,
                name: 'Restricted workspace',
                areDistanceRatesEnabled: true,
                commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE},
            }),
        );
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`,
            createMock<Report>({
                reportID: SELF_DM_REPORT_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            }),
        );
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.REPORT}${WORKSPACE_CHAT_REPORT_ID}`,
            createMock<Report>({
                reportID: WORKSPACE_CHAT_REPORT_ID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: RESTRICTED_POLICY_ID,
                isOwnPolicyExpenseChat: true,
                ownerAccountID: ACCOUNT_ID,
                participants: {[ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            }),
        );
        // The route and the recent waypoints are seeded so the screen has nothing left to fetch on mount.
        await Onyx.set(ONYXKEYS.NVP_RECENT_WAYPOINTS, []);
        await Onyx.set(
            `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`,
            createMock<Transaction>({
                transactionID: TRANSACTION_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                comment: {
                    waypoints: {
                        waypoint0: {address: 'Start address', lat: 1, lng: 1, keyForList: 'start_waypoint'},
                        waypoint1: {address: 'Stop address', lat: 2, lng: 2, keyForList: 'stop_waypoint'},
                    },
                },
                routes: {
                    route0: {
                        distance: 1000,
                        geometry: {coordinates: [[1, 1] as [number, number], [2, 2] as [number, number]], type: 'LineString'},
                    },
                },
            }),
        );
    });
}

async function renderMapStep(reportID: string, iouType: ValueOf<typeof CONST.IOU.TYPE>) {
    render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStepDistanceMap
                            route={createMock<DistanceMapScreenProps['route']>({
                                params: {
                                    action: CONST.IOU.ACTION.CREATE,
                                    iouType,
                                    reportID,
                                    transactionID: TRANSACTION_ID,
                                },
                            })}
                            navigation={createMock<DistanceMapScreenProps['navigation']>({})}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );

    await waitForBatchedUpdatesWithAct();
}

describe('IOURequestStepDistanceMap commuter exclusion guard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockShowConfirmModal.mockClear();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        mockTabContentProps.current = undefined;
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('does not ask for a home address when the expense is a personal Self-DM track expense', async () => {
        // Given a member with no home address whose default workspace excludes commutes by home and office
        await setUpOnyx();

        // When they tap Next on a map distance expense started from their Self-DM
        await renderMapStep(SELF_DM_REPORT_ID, CONST.IOU.TYPE.TRACK);
        await act(async () => {
            mockTabContentProps.current?.submitWaypoints?.();
        });

        // Then the workspace's rule doesn't apply, because the expense isn't going to that workspace
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('still asks for a home address when the expense is going to a workspace that excludes commutes', async () => {
        // Given the same member and workspace
        await setUpOnyx();

        // When they tap Next on a map distance expense started from that workspace's chat
        await renderMapStep(WORKSPACE_CHAT_REPORT_ID, CONST.IOU.TYPE.SUBMIT);
        await act(async () => {
            mockTabContentProps.current?.submitWaypoints?.();
        });

        // Then they're asked for a home address, since the workspace needs it to exclude the commute
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: TestHelper.translateLocal('iou.homeAddressRequired.title')}));
    });
});
