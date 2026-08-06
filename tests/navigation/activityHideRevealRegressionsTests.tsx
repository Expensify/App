import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import useSelection from '@components/Table/middlewares/selection';
import Text from '@components/Text';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useClearSelectedDomainMembersOnMoveComplete from '@hooks/useClearSelectedDomainMembersOnMoveComplete';
import useDebouncedState from '@hooks/useDebouncedState';
import type UseLazyAsset from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useOdometerReceiptStitcher from '@hooks/useOdometerReceiptStitcher';
import useOnyx from '@hooks/useOnyx';
import usePolling from '@hooks/usePolling';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useUnreadMarker from '@hooks/useUnreadMarker';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {setHasRadio} from '@libs/NetworkState';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import type * as ActiveSpansModule from '@libs/telemetry/activeSpans';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

import useFreeTrial from '@pages/home/FreeTrialSection/useFreeTrial';
import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';
import useDebouncedSaveDraft from '@pages/inbox/report/useDebouncedSaveDraft';
import ReportFetchHandler from '@pages/inbox/ReportFetchHandler';
import ReportLifecycleHandler from '@pages/inbox/ReportLifecycleHandler';
import useDistanceTransactionBackup from '@pages/iou/request/step/IOURequestStepDistance/hooks/useDistanceTransactionBackup';
import useOdometerTransactionBackup from '@pages/iou/request/step/IOURequestStepDistance/hooks/useOdometerTransactionBackup';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {PINContextProvider, usePINActions, usePINState} from '@pages/MissingPersonalDetails/PINContext';

import {openReport, saveReportDraftComment, subscribeToReportLeavingEvents, unsubscribeFromLeavingRoomReportChannel} from '@userActions/Report';
import type * as ReportActionsModule from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ParamListBase} from '@react-navigation/native';
import type {ComponentType, RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {CommonActions, NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {addDays, format as formatDate, subDays} from 'date-fns';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {AppState, DeviceEventEmitter, View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import completeRevealTransition from '../utils/completeRevealTransition';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Every test here mounts REAL app code inside a stack whose covered screens are deprioritized with React
 * <Activity>, asserts the behavior the user must get, and is expected to FAIL today. Each failure proves one
 * regression from repo/activity-wrapper-edge-cases/EDGE_CASES.md (the EC ids below): hiding a screen runs every
 * effect cleanup and revealing it re-runs every effect setup, while component state, refs and native views
 * survive. The tests are marked with it.failing, so the suite stays green while the bugs exist; once a bug is
 * fixed its test starts passing, Jest reports it as unexpectedly passing, and the .failing marker must be
 * removed together with updating EDGE_CASES.md.
 */

// The heavy leaves of withWritableReportOrNotFound are irrelevant here: the unit under proof is the HOC's
// mount effect, so the loading and not-found screens are stubbed out to keep the test tree small.
jest.mock('@components/FullscreenLoadingIndicator', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('@pages/ErrorPage/NotFoundPage', () => ({
    __esModule: true,
    default: () => null,
}));

// Only the network-bound actions are stubbed; every other action in the module (including
// clearAllReportActionDrafts, which one of the tests exercises for real) keeps its actual implementation.
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportActionsModule>('@userActions/Report'),
    openReport: jest.fn(),
    subscribeToReportLeavingEvents: jest.fn(),
    unsubscribeFromLeavingRoomReportChannel: jest.fn(),
}));

const mockedOpenReport = jest.mocked(openReport);
const mockedSubscribeToReportLeavingEvents = jest.mocked(subscribeToReportLeavingEvents);
const mockedUnsubscribeFromLeavingRoomReportChannel = jest.mocked(unsubscribeFromLeavingRoomReportChannel);

// The scroll manager is the seam between the scroll hook under proof and the native list: it is the last piece of
// app code before `listRef.current.scrollToIndex`, so spying on it counts the scroll commands the hook issues.
const mockReportScrollManager = {
    scrollToIndex: jest.fn(),
    scrollToBottom: jest.fn(),
    scrollToEnd: jest.fn(),
    scrollToOffset: jest.fn(),
};
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => mockReportScrollManager,
}));

// The span registry keeps its real behavior; the two entry points a skeleton span goes through are only wrapped so
// the test can count them.
jest.mock('@libs/telemetry/activeSpans', () => {
    const actualActiveSpans = jest.requireActual<typeof ActiveSpansModule>('@libs/telemetry/activeSpans');
    return {
        ...actualActiveSpans,
        __esModule: true,
        startSpan: jest.fn(actualActiveSpans.startSpan),
        endSpan: jest.fn(actualActiveSpans.endSpan),
    };
});

const mockedStartSpan = jest.mocked(startSpan);
const mockedEndSpan = jest.mocked(endSpan);

// The canvas work behind the odometer stitch is the one piece of that path with no implementation under Jest.
// Everything above it - stitchTask with its abort signal, deriveOdometerReceipt, the stitcher hook, the verifier
// hook and the Onyx write - stays real, and handing out the resolver is what lets a stitch stay in flight across
// a cover the way a slow device would.
const mockStitchedImage: {resolve?: (image: FileObject) => void} = {resolve: undefined};
jest.mock('@libs/stitchOdometerImages', () => ({
    __esModule: true,
    default: jest.fn(
        () =>
            new Promise((resolve) => {
                mockStitchedImage.resolve = resolve;
            }),
    ),
}));

const Stack = createPlatformStackNavigator<ParamListBase>();

function CoverScreen() {
    return <Text testID="cover-screen">cover</Text>;
}

function settleFirstRenderPass() {
    act(() => {
        jest.advanceTimersByTime(20);
    });
}

function navigateTo(screenName: string) {
    act(() => {
        navigationRef.current?.dispatch(CommonActions.navigate(screenName));
        jest.advanceTimersByTime(500);
    });
}

function goBack() {
    act(() => {
        navigationRef.current?.goBack();
        jest.advanceTimersByTime(500);
    });
}

async function flushOnyx() {
    await act(async () => {
        await waitForBatchedUpdates();
    });
}

// The odometer restore chains two Onyx reads before its final write, so a single batched-updates pass is not
// enough for its whole effect chain to land. Each pass ends with a throwaway Onyx read, whose connect
// round-trip drains the connection task queue past the nested connectWithoutView callbacks.
async function flushOnyxDeeply() {
    for (let flushPass = 0; flushPass < 5; flushPass++) {
        await flushOnyx();

        await act(async () => {
            await getOnyxValue(ONYXKEYS.IS_LOADING_APP);
        });
    }
}

type FirstScreen = {
    component: ComponentType;
    name?: string;
    initialParams?: Record<string, unknown>;
};

function renderScreenThatGetsCovered({component, name = 'First', initialParams}: FirstScreen) {
    const result = render(
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
                <Stack.Screen
                    name={name}
                    component={component}
                    initialParams={initialParams}
                />
                <Stack.Screen
                    name="Cover"
                    component={CoverScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>,
    );
    settleFirstRenderPass();
    return result;
}

const REPORT_ID = '1';
const DRAFT_ACTION_ID = '100';

function ReportScreenClearingDraftsOnLeave() {
    useClearReportActionDraftsOnReportChange(REPORT_ID);
    return <Text testID="report-screen">report</Text>;
}

const DISTANCE_TRANSACTION_ID = 'transaction-under-edit';

function DistanceEditor({transaction}: {transaction: Transaction}) {
    const transactionWasSavedRef = useRef(false);
    useDistanceTransactionBackup({
        transaction,
        isCreatingNewRequest: false,
        isEditingSplit: false,
        isDraft: true,
        introSelected: undefined,
        betas: undefined,
        transactionWasSavedRef,
    });
    return <Text testID="distance-editor">distance editor</Text>;
}

function DistanceStepScreen() {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${DISTANCE_TRANSACTION_ID}`);
    if (!transaction) {
        return <Text testID="distance-loading">loading</Text>;
    }
    return <DistanceEditor transaction={transaction} />;
}

const ODOMETER_TRANSACTION_ID = 'odometer-transaction-under-edit';

function OdometerEditor({transaction}: {transaction: Transaction}) {
    const didSaveEditingConfirmationRef = useRef(false);
    const backupHandledManuallyRef = useRef(false);
    const recoveryHandledBackupRef = useRef(false);
    useOdometerTransactionBackup({
        transaction,
        isEditingConfirmation: true,
        isTransactionDraft: true,
        transactionID: ODOMETER_TRANSACTION_ID,
        didSaveEditingConfirmationRef,
        backupHandledManuallyRef,
        recoveryHandledBackupRef,
    });
    return <Text testID="odometer-editor">odometer editor</Text>;
}

function OdometerStepScreen() {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${ODOMETER_TRANSACTION_ID}`);
    if (!transaction) {
        return <Text testID="odometer-loading">loading</Text>;
    }
    return <OdometerEditor transaction={transaction} />;
}

async function renderOdometerEditorWithUnsavedEdit() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${ODOMETER_TRANSACTION_ID}`, {
            transactionID: ODOMETER_TRANSACTION_ID,
            amount: 100,
            currency: 'USD',
            merchant: 'Original merchant',
            created: '2026-08-01',
            reportID: '',
            comment: {},
        });
    });
    renderScreenThatGetsCovered({component: OdometerStepScreen});
    await flushOnyx();
    expect(screen.getByTestId('odometer-editor')).toBeTruthy();
    await flushOnyx();
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${ODOMETER_TRANSACTION_ID}`, {amount: 999});
    });
}

function PINEntry() {
    const {PIN} = usePINState();
    const {setPIN} = usePINActions();
    const didTypeRef = useRef(false);
    useEffect(() => {
        if (didTypeRef.current) {
            return;
        }
        didTypeRef.current = true;
        setPIN('1234');
    }, [setPIN]);
    return <Text testID="pin-value">{PIN}</Text>;
}

function CardOrderingScreen() {
    return (
        <PINContextProvider>
            <PINEntry />
        </PINContextProvider>
    );
}

const saveDraftSpy = jest.fn();

function ComposerScreenWithPendingDraftSave() {
    const {saveDraft} = useDebouncedSaveDraft(saveDraftSpy);
    const didTypeRef = useRef(false);
    useEffect(() => {
        if (didTypeRef.current) {
            return;
        }
        didTypeRef.current = true;
        saveDraft('typed message');
        // The debounced function identity is not stable across renders, and the simulated keystroke must
        // happen exactly once, which the ref guard above ensures.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <Text testID="composer">composer</Text>;
}

const beforeRemoveGuardSpy = jest.fn();

function FormScreenWithUnsavedChangesGuard() {
    useBeforeRemove(beforeRemoveGuardSpy);
    return <Text testID="form-screen">form</Text>;
}

type DistanceStepProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE>;

function WritableDistanceStepContent() {
    return <Text testID="writable-step">writable step</Text>;
}

const WritableDistanceStep = withWritableReportOrNotFound<DistanceStepProps>(WritableDistanceStepContent);

// The HOC's props are typed against the app's MoneyRequest param list, while this test stack is typed against
// ParamListBase. The navigator provides the exact route and navigation objects at runtime, so the assertion only
// erases the param-list nominal mismatch; there is no way to express this compatibility without it.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const WritableDistanceStepForTestStack = WritableDistanceStep as ComponentType;

const OPEN_REPORT_SPAN_ID = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${REPORT_ID}`;

function ReportScreenWithLifecycleHandler() {
    return (
        <>
            <ReportLifecycleHandler reportID={REPORT_ID} />
            <Text testID="report-lifecycle-screen">report</Text>
        </>
    );
}

const UNREAD_REPORT_ID = '2';
const UNREAD_MARKER_READER_ACCOUNT_ID = 1;
const INCOMING_ACTION_ID = '200';
const INCOMING_ACTION_CREATED = '2026-08-01 10:00:00';
const READ_TIME_AFTER_INCOMING_ACTION = '2026-08-01 10:00:01';
const READ_TIME_BEFORE_INCOMING_ACTION = '2026-08-01 09:59:59';
const UNREAD_MARKER_READER = {accountID: UNREAD_MARKER_READER_ACCOUNT_ID};

const incomingReportActions: ReportAction[] = [
    {
        ...createRandomReportAction(Number(INCOMING_ACTION_ID)),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: INCOMING_ACTION_ID,
        actorAccountID: UNREAD_MARKER_READER_ACCOUNT_ID + 1,
        created: INCOMING_ACTION_CREATED,
    },
];

function UnreadMarkerOfReport() {
    const {unreadMarkerReportActionID} = useUnreadMarker({
        reportID: UNREAD_REPORT_ID,
        sortedVisibleReportActions: incomingReportActions,
        sortedReportActions: incomingReportActions,
        oldestUnreadReportActionID: undefined,
        isScrolledOverThreshold: false,
        hasOnceLoadedReportActions: true,
    });
    return <Text testID="unread-marker">{unreadMarkerReportActionID ?? 'none'}</Text>;
}

function ReportScreenWithUnreadMarker() {
    return (
        <CurrentUserPersonalDetailsContext.Provider value={UNREAD_MARKER_READER}>
            <UnreadMarkerOfReport />
        </CurrentUserPersonalDetailsContext.Provider>
    );
}

function ReportScreenWithFetchHandler() {
    return (
        <>
            <ReportFetchHandler />
            <Text testID="report-fetch-screen">report</Text>
        </>
    );
}

// The report leaving subscription is registered through TransitionTracker with waitForUpcomingTransition, so it only
// runs once the tracker stops waiting for a transition to start.
async function settleTransitionGatedWork() {
    await act(async () => {
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_START_WAIT_MS + 100);
        await waitForBatchedUpdates();
    });
}

const FREE_TRIAL_ACCOUNT_ID = 234;
const FREE_TRIAL_POLICY_ID = '100012';
const FREE_TRIAL_CURRENT_USER = {accountID: FREE_TRIAL_ACCOUNT_ID};

function FreeTrialDiscount() {
    const {discountInfo} = useFreeTrial();
    return <Text testID="free-trial-discount">{discountInfo ? String(discountInfo.discountType) : 'none'}</Text>;
}

// useFreeTrial takes the current user from the context the app provider fills, so the harness supplies the owner
// of the seeded trial workspace and everything below that context stays real app code.
function HomeScreenWithFreeTrialSection() {
    return (
        <CurrentUserPersonalDetailsContext.Provider value={FREE_TRIAL_CURRENT_USER}>
            <FreeTrialDiscount />
        </CurrentUserPersonalDetailsContext.Provider>
    );
}

async function seedUserOnFreeTrialWithOwnedWorkspace() {
    await act(async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: FREE_TRIAL_ACCOUNT_ID},
            [ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL]: formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
            [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 10), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING),
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FREE_TRIAL_POLICY_ID}`, {
            ...createRandomPolicy(Number(FREE_TRIAL_POLICY_ID)),
            ownerAccountID: FREE_TRIAL_ACCOUNT_ID,
            type: CONST.POLICY.TYPE.CORPORATE,
        });
    });
}

const SKELETON_COMPONENT = 'ActivityHarnessLoadingScreen';

function LoadingScreenWithSkeletonSpan() {
    useSkeletonSpan(SKELETON_COMPONENT, {context: 'ActivityHarness.LoadingScreen'});
    return <Text testID="loading-skeleton">skeleton</Text>;
}

const TYPED_SEARCH_TERM = 'chair';

function SearchFilterScreen() {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const didTypeRef = useRef(false);
    useEffect(() => {
        if (didTypeRef.current) {
            return;
        }
        didTypeRef.current = true;
        setSearchTerm(TYPED_SEARCH_TERM);
    }, [setSearchTerm]);
    return (
        <>
            <Text testID="search-term">{searchTerm}</Text>
            <Text testID="debounced-search-term">{debouncedSearchTerm}</Text>
        </>
    );
}

const SCROLLED_REPORT_ID = '3';
const SCROLLED_REPORT = {...createRandomReport(Number(SCROLLED_REPORT_ID)), type: CONST.REPORT.TYPE.CHAT};
const scrolledReportActions: ReportAction[] = [
    {
        ...createRandomReportAction(300),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: '300',
        created: '2026-08-01 10:00:00',
    },
];

function ReportActionsListWithInitialScroll() {
    useReportActionsScroll({
        reportID: SCROLLED_REPORT_ID,
        report: SCROLLED_REPORT,
        transactionThreadReport: undefined,
        parentReportAction: undefined,
        sortedVisibleReportActions: scrolledReportActions,
        renderedVisibleReportActions: scrolledReportActions,
        keyExtractor: (item) => item.reportActionID,
        hasScrolledOverThreshold: false,
        markNewestActionAsRead: () => {},
        completeSkippedMarkAsRead: () => {},
        unreadMarkerReportActionID: null,
        unreadMarkerReportActionIndex: -1,
        hasNewerActions: false,
        draftAutoScrollKey: '',
        actionBadgeTargetIndex: -1,
        sortedAllReportActionsForPagination: scrolledReportActions,
        treatAsNoPaginationAnchor: false,
        setTreatAsNoPaginationAnchor: () => {},
    });
    return <Text testID="report-actions-list">report actions</Text>;
}

const refetchOnReconnectSpy = jest.fn();

// Stands for the 44 screens that refetch their data through useNetwork's onReconnect (workspace pages, tags, taxes,
// distance rates, avatar and attachment error resets). Only the hook is what matters here, so the page around it is
// reduced to a marker.
function ScreenRefetchingOnReconnect() {
    useNetwork({onReconnect: refetchOnReconnectSpy});
    return <Text testID="reconnecting-screen">workspace</Text>;
}

// setHasRadio is what the NetInfo listener calls when the OS reports the radio going away and coming back, so this
// drives a real offline blip through the real NetworkState store without touching NetInfo.
function goOfflineAndBackOnline() {
    act(() => {
        setHasRadio(false);
    });
    act(() => {
        setHasRadio(true);
    });
}

const clearSelectedMembersSpy = jest.fn();

function DomainMembersPage() {
    useClearSelectedDomainMembersOnMoveComplete(clearSelectedMembersSpy);
    return <Text testID="domain-members-page">members</Text>;
}

const RENAMED_REPORT_ID = '7';
const NAME_BEFORE_COVER = 'Name before the cover';
const NAME_WRITTEN_WHILE_COVERED = 'Name written while covered';

const renderedReportNameSpy = jest.fn<void, [string | undefined, string]>();

// A reveal produces more than one render pass, and only the last one is left on screen, so recording every pass is
// the only way to see whether a user gets a frame of missing data. The screen is reduced to that recording plus the
// piece of app code under proof: the real useOnyx.
function ReportNameScreen() {
    const [report, metadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`);
    renderedReportNameSpy(report?.reportName, metadata.status);
    return <Text testID="report-name">{report?.reportName ?? 'none'}</Text>;
}

const reportNameEffectSpy = jest.fn();

// Stands for every effect keyed on an Onyx value that does something observable with it - fetching, writing an
// optimistic update, reporting telemetry - which is what the spy takes the place of.
function ReportNameSyncingScreen() {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`);
    const reportName = report?.reportName;
    useEffect(() => {
        reportNameEffectSpy(reportName);
    }, [reportName]);
    return <Text testID="report-name">{reportName ?? 'none'}</Text>;
}

async function seedReportNameBeforeCover() {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`, {reportID: RENAMED_REPORT_ID, reportName: NAME_BEFORE_COVER});
    });
}

function rendersWithoutTheReportName() {
    return renderedReportNameSpy.mock.calls.filter(([reportName, status]) => reportName !== NAME_BEFORE_COVER || status !== 'loaded');
}

function rendersWithNoReportNameAtAll() {
    return renderedReportNameSpy.mock.calls.filter(([reportName]) => reportName === undefined);
}

const selectedReportNameSpy = jest.fn<void, [{name: string | undefined} | undefined]>();

// Module level, because useOnyx re-runs a selector whose reference changes and the point of the test is what
// happens to a result that nothing invalidated.
const reportNameSelector = (report: OnyxEntry<Report>) => ({name: report?.reportName});

function ReportNameSelectorScreen() {
    const [selectedName] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`, {selector: reportNameSelector});
    selectedReportNameSpy(selectedName);
    return <Text testID="selected-report-name">{selectedName?.name ?? 'none'}</Text>;
}

const nodeRefCallbackSpy = jest.fn<void, [unknown]>();

// The plainest form of what every third-party handoff does: pass the node out when it arrives and take it back
// when it goes away. Whether a hide counts as "goes away" is what EC-18 rests on.
function ScreenHandingOutItsNode() {
    return (
        <View
            testID="node-screen"
            ref={nodeRefCallbackSpy}
        />
    );
}

// React hands a callback ref more than the node alone, so the assertions read the node out of the last call
// instead of matching the whole argument list.
function lastNodeHandedToTheRefCallback(): unknown {
    return nodeRefCallbackSpy.mock.calls.at(-1)?.at(0);
}

const focusEffectSetupSpy = jest.fn();
const focusEffectCleanupSpy = jest.fn();

// A cover blurs the screen AND hides it, a reveal focuses it AND re-runs its effects, so this screen counts how
// many times the two paths run the same real useFocusEffect callback.
function ScreenWithFocusEffect() {
    useFocusEffect(
        useCallback(() => {
            focusEffectSetupSpy();
            return focusEffectCleanupSpy;
        }, []),
    );
    return <Text testID="focus-effect-screen">focus</Text>;
}

const PolicyIDContext = React.createContext('policy-before-cover');
const POLICY_ID_CHANGED_WHILE_COVERED = 'policy-changed-while-covered';

const contextValueEffectSpy = jest.fn();

// The counterpart of ReportNameSyncingScreen for a value that arrives through React itself instead of through a
// store subscription, which is what tells apart a reveal-order property of React from a property of the dropped
// useSyncExternalStore subscription.
function ScreenReadingPolicyIDFromContext() {
    const policyID = useContext(PolicyIDContext);
    useEffect(() => {
        contextValueEffectSpy(policyID);
    }, [policyID]);
    return <Text testID="context-policy-id">{policyID}</Text>;
}

function screenUnderPolicyIDProvider(policyID: string) {
    return (
        <PolicyIDContext.Provider value={policyID}>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
                    <Stack.Screen
                        name="First"
                        component={ScreenReadingPolicyIDFromContext}
                    />
                    <Stack.Screen
                        name="Cover"
                        component={CoverScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </PolicyIDContext.Provider>
    );
}

const STITCHING_TRANSACTION_ID = 'odometer-transaction-being-stitched';
const STITCHED_RECEIPT_URI = 'file://stitched-odometer-receipt.jpg';
const STITCHED_RECEIPT_NAME = 'stitched-odometer-receipt.jpg';

// The confirmation page reads the same three pieces of the stitcher, so the rendered state is enough to tell a
// finished receipt from one the user is still waiting for.
function OdometerConfirmationScreen() {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${STITCHING_TRANSACTION_ID}`);
    const {state} = useOdometerReceiptStitcher({
        transaction,
        isOdometerDistanceRequest: true,
        reportID: REPORT_ID,
        iouType: CONST.IOU.TYPE.SUBMIT,
        backToReport: undefined,
    });
    return <Text testID="odometer-receipt-state">{state.kind}</Text>;
}

// Plain file uris, not blob ones, so the real verifier hook passes its accessibility check synchronously and the
// stitch starts the same way it does on a device.
async function renderOdometerConfirmationWithAStitchInFlight() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${STITCHING_TRANSACTION_ID}`, {
            transactionID: STITCHING_TRANSACTION_ID,
            amount: 0,
            currency: 'USD',
            merchant: '',
            created: '2026-08-01',
            reportID: REPORT_ID,
            comment: {
                odometerStartImage: {uri: 'file://odometer-start.jpg', name: 'odometer-start.jpg', type: 'image/jpeg'},
                odometerEndImage: {uri: 'file://odometer-end.jpg', name: 'odometer-end.jpg', type: 'image/jpeg'},
            },
        });
    });
    renderScreenThatGetsCovered({component: OdometerConfirmationScreen});
    await flushOnyx();
    expect(screen.getByTestId('odometer-receipt-state').props.children).toBe('stitching');
}

async function finishTheCanvasWork() {
    await act(async () => {
        mockStitchedImage.resolve?.({uri: STITCHED_RECEIPT_URI, name: STITCHED_RECEIPT_NAME, type: 'image/jpeg'});
        await waitForBatchedUpdates();
    });
}

async function getStitchedReceiptSource() {
    const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${STITCHING_TRANSACTION_ID}`);
    return transaction?.receipt?.source;
}

const permissionPollSpy = jest.fn();

// The argument list LocationPermissionModal passes, so the interval and the debounce window under proof are the
// ones that ship.
function ScreenPollingForAGrantedPermission() {
    usePolling(permissionPollSpy, CONST.TIMING.LOCATION_UPDATE_INTERVAL, true, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
    return <Text testID="polling-screen">polling</Text>;
}

function spendTime(milliseconds: number) {
    act(() => {
        jest.advanceTimersByTime(milliseconds);
    });
}

// Both timers stand between a due poll and the spy: the interval that decides a tick is due, and the debounce that
// coalesces ticks landing together.
function letThePollBecomeDue() {
    spendTime(CONST.TIMING.LOCATION_UPDATE_INTERVAL);
    spendTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
}

// Drives the real AppState listener chain that Visibility sits on, which is the closest this harness gets to the
// user leaving for the OS settings and coming back - the whole reason the poll exists.
function bringTheAppBackToTheForeground() {
    act(() => {
        AppState.emitCurrentTestState('background');
        AppState.emitCurrentTestState('active');
        jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
    });
}

// One module, two labels: a real dynamic import would hand back the same thing every time, and these differ only
// so the assertion can tell WHICH request the illustration on screen came from.
const LAZY_ILLUSTRATION_FIRST_REQUEST = 'illustration-from-the-request-made-on-mount';
const LAZY_ILLUSTRATION_WARM_CACHE = 'illustration-from-the-warm-module-cache';

const lazyIllustrationImport: {resolve?: (module: {default: string}) => void; wasRequestedBefore: boolean} = {resolve: undefined, wasRequestedBefore: false};

// Stands for a dynamic import: the first request is a real round trip, every later one is served from the module
// cache and settles on its own. Module level, because useLazyAsset keys its effect on the loader identity.
function loadTheIllustration(): Promise<{default: string}> {
    if (lazyIllustrationImport.wasRequestedBefore) {
        return Promise.resolve({default: LAZY_ILLUSTRATION_WARM_CACHE});
    }
    lazyIllustrationImport.wasRequestedBefore = true;
    return new Promise((resolve) => {
        lazyIllustrationImport.resolve = resolve;
    });
}

// The jest setup replaces the whole lazy-asset module with a synchronous stub for every suite, so no test in the
// repo runs the real loader. Here the loader IS the code under proof, hence the explicit actual import.
const {default: useLazyAsset} = jest.requireActual<{default: typeof UseLazyAsset}>('@hooks/useLazyAsset');

function ScreenShowingALazyIllustration() {
    const {asset, isLoaded} = useLazyAsset<string>(loadTheIllustration);
    return <Text testID="lazy-illustration">{isLoaded ? asset : 'placeholder'}</Text>;
}

const DRAFT_TYPED_BEFORE_THE_COVER = 'draft typed right before the cover';
const REPORT_WITH_A_CANCELLED_DRAFT_SAVE = '11';
const REPORT_WITH_A_FLUSHED_DRAFT_SAVE = '12';

const pendingDraftSave: {isSavePending?: RefObject<boolean>} = {isSavePending: undefined};

// The two configurations of the same hook that ship today, side by side: the edit composer takes the default and
// the main composer opts into a flush on cleanup. Both go through the real debounce and the real Onyx action, so
// the third argument is the only thing that differs between them.
function ScreenSavingADraftEachWay() {
    const {saveDraft: saveDraftThatIsCancelledOnCleanup, isSavePending} = useDebouncedSaveDraft(
        useCallback((comment: string) => saveReportDraftComment(REPORT_WITH_A_CANCELLED_DRAFT_SAVE, comment), []),
    );
    const {saveDraft: saveDraftThatIsFlushedOnCleanup} = useDebouncedSaveDraft(
        useCallback((comment: string) => saveReportDraftComment(REPORT_WITH_A_FLUSHED_DRAFT_SAVE, comment), []),
        undefined,
        true,
    );
    const didTypeRef = useRef(false);
    useEffect(() => {
        pendingDraftSave.isSavePending = isSavePending;
        if (didTypeRef.current) {
            return;
        }
        didTypeRef.current = true;
        saveDraftThatIsCancelledOnCleanup(DRAFT_TYPED_BEFORE_THE_COVER);
        saveDraftThatIsFlushedOnCleanup(DRAFT_TYPED_BEFORE_THE_COVER);
        // Both debounced functions are rebuilt on every reveal, so listing them would type again; the simulated
        // keystroke must happen exactly once, which the ref guard above ensures.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSavePending]);
    return <Text testID="draft-composer">composer</Text>;
}

function getDraftComment(reportID: string) {
    return getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
}

function letTheDebounceWindowElapse() {
    act(() => {
        jest.advanceTimersByTime(CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME + 100);
    });
}

const TABLE_ROWS = [{keyForList: 'row-1'}, {keyForList: 'row-2'}];
const NO_TABLE_FILTERS = {};
const SELECTED_TABLE_ROW = 'row-2';

const tableSelectionSpy = jest.fn<void, [string[]]>();

// The selection middleware every Table mounts, driven the way Table.tsx drives it: the selected keys live in the
// parent and come back down as a prop, so the hook's own calls are the only thing that can change them.
function ScreenWithASelectableTable() {
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const changeSelection = useCallback((keys: string[]) => {
        tableSelectionSpy(keys);
        setSelectedKeys(keys);
    }, []);
    const {
        methods: {handleSingleRowSelection},
    } = useSelection({
        data: TABLE_ROWS,
        originalSelectableCount: TABLE_ROWS.length,
        selectedKeys,
        currentFilters: NO_TABLE_FILTERS,
        activeSearchString: '',
        onRowSelectionChange: changeSelection,
    });
    return (
        <Text
            testID="table-selection"
            onPress={() => handleSingleRowSelection(SELECTED_TABLE_ROW)}
        >
            {selectedKeys.join(',')}
        </Text>
    );
}

function selectATableRow() {
    fireEvent.press(screen.getByTestId('table-selection'));
}

function selectedTableRows(): unknown {
    return screen.getByTestId('table-selection').props.children;
}

// The hook hardcodes how long a pressed button stays throttled, so the tests below reproduce it rather than
// import it.
const THROTTLED_BUTTON_RESET_DELAY = 1800;

// One cover and one reveal cost this much fake time in this harness: 500ms for the navigation that covers the
// screen and 500ms for the one that uncovers it. Completing the reveal transition itself advances no timers.
const TIME_SPENT_ON_A_COVER_AND_A_REVEAL = 1000;

function ScreenWithAThrottledButton() {
    const [isButtonActive, setButtonInactive] = useThrottledButtonState();
    return (
        <Text
            testID="throttled-button"
            onPress={setButtonInactive}
        >
            {isButtonActive ? 'active' : 'throttled'}
        </Text>
    );
}

function pressTheThrottledButton() {
    fireEvent.press(screen.getByTestId('throttled-button'));
}

function throttledButtonState(): unknown {
    return screen.getByTestId('throttled-button').props.children;
}

const writableStepParams = {
    action: CONST.IOU.ACTION.EDIT,
    iouType: CONST.IOU.TYPE.SUBMIT,
    transactionID: 'transaction-2',
    reportID: 'report-that-is-not-loaded',
    backTo: ROUTES.HOME,
};

describe('regressions of screens deprioritized with Activity, proven on real app code', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('EC-9: destructive cleanups fire on hide', () => {
        it.failing('keeps report action edit drafts when the report screen gets covered', async () => {
            renderScreenThatGetsCovered({component: ReportScreenClearingDraftsOnLeave});
            // The hook clears drafts in its own mount setup, so the draft is seeded only after mounting,
            // exactly like a user who starts editing a message after opening the report.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${REPORT_ID}`, {[DRAFT_ACTION_ID]: {message: 'edited message draft'}});
            });

            navigateTo('Cover');
            await flushOnyx();

            const drafts = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${REPORT_ID}`);
            expect(drafts?.[DRAFT_ACTION_ID]?.message).toBe('edited message draft');
        });

        it.failing('keeps drafts written while the screen was covered once it is revealed', async () => {
            renderScreenThatGetsCovered({component: ReportScreenClearingDraftsOnLeave});
            navigateTo('Cover');
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${REPORT_ID}`, {[DRAFT_ACTION_ID]: {message: 'draft from another surface'}});
            });

            goBack();
            await completeRevealTransition();
            await flushOnyx();

            const drafts = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${REPORT_ID}`);
            expect(drafts?.[DRAFT_ACTION_ID]?.message).toBe('draft from another surface');
        });

        it.failing('keeps unsaved distance transaction edits when the edit step gets covered', async () => {
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${DISTANCE_TRANSACTION_ID}`, {
                    transactionID: DISTANCE_TRANSACTION_ID,
                    amount: 100,
                    currency: 'USD',
                    merchant: 'Original merchant',
                    created: '2026-08-01',
                    reportID: '',
                    comment: {},
                });
            });
            renderScreenThatGetsCovered({component: DistanceStepScreen});
            await flushOnyx();
            expect(screen.getByTestId('distance-editor')).toBeTruthy();
            // The backup of the original transaction is created asynchronously on mount; only then does the
            // user edit arrive, like typing a new amount into the open editor.
            await flushOnyx();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${DISTANCE_TRANSACTION_ID}`, {amount: 999});
            });

            navigateTo('Cover');
            await flushOnyx();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${DISTANCE_TRANSACTION_ID}`);
            expect(draft?.amount).toBe(999);
        });

        // The failing revert below runs through restoreOriginalTransactionFromBackupWithImageCleanup, the
        // variant that also revokes the odometer receipt image object URLs, so covering the step destroys
        // the receipt images together with the edits.
        it.failing('keeps unsaved odometer edits when the odometer step gets covered', async () => {
            await renderOdometerEditorWithUnsavedEdit();

            navigateTo('Cover');
            await flushOnyxDeeply();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${ODOMETER_TRANSACTION_ID}`);
            expect(draft?.amount).toBe(999);
        });

        // ReportLifecycleHandler cancels the telemetry spans of the report it belongs to in an unmount cleanup, so a
        // cover ends a span that is still measuring an open report the user is about to come back to.
        it.failing('keeps the in-flight open report span when the report screen gets covered', () => {
            renderScreenThatGetsCovered({component: ReportScreenWithLifecycleHandler});
            startSpan(OPEN_REPORT_SPAN_ID, {name: CONST.TELEMETRY.SPAN_OPEN_REPORT});
            expect(getSpan(OPEN_REPORT_SPAN_ID)).toBeDefined();

            navigateTo('Cover');

            expect(getSpan(OPEN_REPORT_SPAN_ID)).toBeDefined();
        });

        // useSkeletonSpan measures how long a skeleton stays on screen, which is how "infinite skeleton" loads are
        // found in telemetry. Its cleanup ends the span, so a cover reports the load as finished at cover time.
        it.failing('keeps measuring the skeleton span of a screen that is still loading when it gets covered', () => {
            renderScreenThatGetsCovered({component: LoadingScreenWithSkeletonSpan});
            expect(mockedStartSpan).toHaveBeenCalledTimes(1);

            navigateTo('Cover');

            expect(mockedEndSpan).not.toHaveBeenCalled();
        });

        it.failing('keeps the partially entered PIN when the card ordering screen gets covered and revealed', async () => {
            renderScreenThatGetsCovered({component: CardOrderingScreen});
            expect(screen.getByTestId('pin-value').props.children).toBe('1234');

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();

            expect(screen.getByTestId('pin-value').props.children).toBe('1234');
        });
    });

    describe('EC-10: pending debounced saves are cancelled without a flush on hide', () => {
        it.failing('persists a draft typed right before the screen gets covered', () => {
            renderScreenThatGetsCovered({component: ComposerScreenWithPendingDraftSave});

            navigateTo('Cover');
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME + 100);
            });

            expect(saveDraftSpy).toHaveBeenCalledWith('typed message');
        });

        // useDebouncedState hands out the typed value immediately and the debounced one 300ms later. The typed value is
        // state and survives the hide, the pending debounced update is cancelled by it, so the two never converge again.
        it.failing('applies the search term typed right before the screen gets covered', async () => {
            renderScreenThatGetsCovered({component: SearchFilterScreen});
            expect(screen.getByTestId('search-term').props.children).toBe(TYPED_SEARCH_TERM);

            // Hiding is urgent, so the cover commits before the debounce window elapses - the case a user hits by
            // opening a row right after typing. The two acts keep that order; folding them into one would run the
            // pending timer first and never reach the cancel.
            act(() => {
                navigationRef.current?.dispatch(CommonActions.navigate('Cover'));
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 100);
            });
            goBack();
            await completeRevealTransition();

            // The revealed screen shows the typed term in the input while every consumer of the debounced term - the
            // filtered list, the search request - still works with the value from before the user typed.
            expect(screen.getByTestId('debounced-search-term').props.children).toBe(TYPED_SEARCH_TERM);
        });
    });

    describe('EC-14: beforeRemove guards are detached while hidden', () => {
        it.failing('still calls the guard of a covered screen when a reset removes it from the stack', () => {
            renderScreenThatGetsCovered({component: FormScreenWithUnsavedChangesGuard});

            navigateTo('Cover');
            act(() => {
                navigationRef.current?.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Cover'}]}));
                jest.advanceTimersByTime(500);
            });

            expect(beforeRemoveGuardSpy).toHaveBeenCalled();
        });
    });

    describe('EC-11: event-stream subscriptions are torn down on hide', () => {
        it.failing('re-subscribes to the report leaving events when the covered report screen is revealed', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
            });
            renderScreenThatGetsCovered({component: ReportScreenWithFetchHandler, name: SCREENS.REPORT, initialParams: {reportID: REPORT_ID}});
            await flushOnyx();
            await settleTransitionGatedWork();
            expect(mockedSubscribeToReportLeavingEvents).toHaveBeenCalledTimes(1);

            navigateTo('Cover');
            await flushOnyx();
            expect(mockedUnsubscribeFromLeavingRoomReportChannel).toHaveBeenCalledTimes(1);

            goBack();
            await completeRevealTransition();
            await settleTransitionGatedWork();

            // The ref that recorded the first subscription survives the hide that unsubscribed, so the reveal skips the
            // registration and the screen stays deaf to leaving events for the rest of its life.
            expect(mockedSubscribeToReportLeavingEvents).toHaveBeenCalledTimes(2);
        });
    });

    describe('EC-12: one-shot events fired while hidden are lost', () => {
        it.failing('shows the unread marker for a message marked unread while the report screen was covered', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${UNREAD_REPORT_ID}`, {reportID: UNREAD_REPORT_ID, lastReadTime: READ_TIME_AFTER_INCOMING_ACTION});
            });
            renderScreenThatGetsCovered({component: ReportScreenWithUnreadMarker});
            await flushOnyx();
            expect(screen.getByTestId('unread-marker').props.children).toBe('none');

            navigateTo('Cover');
            // markCommentAsUnread emits exactly this event, and the LHN entry it comes from stays usable while
            // another screen covers the report. Emitting it before the cover instead makes this test pass, which
            // pins the failure on the listener the hide removed.
            act(() => {
                DeviceEventEmitter.emit(`unreadAction_${UNREAD_REPORT_ID}`, READ_TIME_BEFORE_INCOMING_ACTION);
            });

            goBack();
            await completeRevealTransition();

            // The marker time is component state that survives the hide and is never re-seeded from the report on
            // reveal, so the revealed chat keeps showing the conversation as fully read.
            expect(screen.getByTestId('unread-marker').props.children).toBe(INCOMING_ACTION_ID);
        });
    });

    describe('EC-16: interval cleanups null the state they own', () => {
        it.failing('keeps the free trial discount on screen when the home screen gets covered and revealed', async () => {
            await seedUserOnFreeTrialWithOwnedWorkspace();
            renderScreenThatGetsCovered({component: HomeScreenWithFreeTrialSection});
            await flushOnyx();
            // The discount is recomputed by a one-second interval, so the first tick is what fills it in after the
            // Onyx values of the trial land.
            act(() => {
                jest.advanceTimersByTime(CONST.MILLISECONDS_PER_SECOND + 100);
            });
            expect(screen.getByTestId('free-trial-discount').props.children).not.toBe('none');

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();

            // The reveal only restarts the interval, so the discount stays null until its next tick a second later:
            // that gap is the empty free trial section the user sees flash after closing the covering screen.
            expect(screen.getByTestId('free-trial-discount').props.children).not.toBe('none');
        });
    });

    describe('EC-5: mount-once scroll positioning runs again on reveal', () => {
        it.failing('does not scroll the report list back to the bottom when the covered report screen is revealed', async () => {
            renderScreenThatGetsCovered({component: ReportActionsListWithInitialScroll, name: SCREENS.REPORT, initialParams: {reportID: SCROLLED_REPORT_ID}});
            await flushOnyx();
            await settleTransitionGatedWork();
            expect(mockReportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();
            await settleTransitionGatedWork();

            // The list keeps its native scroll position through the hide, so the second scheduling yanks a user who
            // had scrolled up to read history back to the newest message just because they closed an RHP.
            expect(mockReportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
        });
    });

    describe('EC-7: mount-once fetch effects re-fire on reveal', () => {
        it.failing('does not issue a second OpenReport call when the covered step is revealed', async () => {
            renderScreenThatGetsCovered({
                component: WritableDistanceStepForTestStack,
                name: SCREENS.MONEY_REQUEST.STEP_DISTANCE,
                initialParams: writableStepParams,
            });
            await flushOnyx();
            expect(mockedOpenReport).toHaveBeenCalledTimes(1);

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();

            expect(mockedOpenReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('EC-22: store transitions that round-trip while hidden are lost', () => {
        afterEach(() => {
            act(() => {
                setHasRadio(true);
            });
        });

        it.failing('refetches the data of a covered screen when the connection comes back while it is covered', async () => {
            renderScreenThatGetsCovered({component: ScreenRefetchingOnReconnect});

            navigateTo('Cover');
            goOfflineAndBackOnline();
            goBack();
            await completeRevealTransition();

            // useNetwork reads NetworkState through useSyncExternalStore, whose subscription is an effect, so the hide
            // disconnects the screen from the store. The reveal only re-reads the final snapshot, which is the same
            // "online" it had before the cover, and the offline dip in between is never rendered - so the reconnect
            // the hook detects by comparing the two never happens and the screen keeps the data it fetched before.
            expect(refetchOnReconnectSpy).toHaveBeenCalledTimes(1);
        });

        it('refetches when the same offline blip happens while the screen is visible', () => {
            renderScreenThatGetsCovered({component: ScreenRefetchingOnReconnect});

            goOfflineAndBackOnline();

            // The control for the test above: the exact same store transitions, only without a cover, do reach the
            // screen, which pins the missing refetch on the hide rather than on how this harness drives NetworkState.
            expect(refetchOnReconnectSpy).toHaveBeenCalledTimes(1);
        });

        it('clears the selection of a covered page when the move that emptied it completed behind the cover', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_DOMAIN_MEMBERS_SELECTED_FOR_MOVE, ['1', '2']);
            });
            renderScreenThatGetsCovered({component: DomainMembersPage});
            await flushOnyx();

            navigateTo('Cover');
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_DOMAIN_MEMBERS_SELECTED_FOR_MOVE, []);
            });

            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // The boundary of the collapse above: a one-way transition still lands, because the usePrevious ref keeps
            // the pre-cover value across the hide and the reveal re-reads the new one, so the two ends of the
            // transition meet on the first render after the reveal. Only a value that returns to where it started
            // (offline and back online) leaves no trace to compare against.
            expect(clearSelectedMembersSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('EC-23: a reveal re-reads Onyx as a brand new connection', () => {
        it('keeps rendering the data a covered screen already had when nothing changed behind the cover', async () => {
            await seedReportNameBeforeCover();
            renderScreenThatGetsCovered({component: ReportNameScreen});
            await flushOnyx();
            expect(screen.getByTestId('report-name').props.children).toBe(NAME_BEFORE_COVER);

            navigateTo('Cover');
            renderedReportNameSpy.mockClear();
            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // The baseline for the two tests below: the reveal drops the useOnyx subscription and makes a new one,
            // and as long as no write is in flight every render pass it produces still carries the loaded value.
            expect(rendersWithoutTheReportName()).toEqual([]);
        });

        // The reveal makes useOnyx treat the key as a first connection again, and a first connection with a queued
        // write renders `undefined` with status `loading` on purpose (useOnyx.js, hasPendingMergeForKey). That is the
        // frame of missing data an RHP that saves and closes itself could produce on the screen underneath. This
        // harness cannot hold a write queued that long - the reveal needs its timers to advance and the merge lands
        // first - so what is proven here is the settled case: one pass, with the new data, no empty frame.
        it('renders a report renamed behind the cover in one pass, without a frame of missing data', async () => {
            await seedReportNameBeforeCover();
            renderScreenThatGetsCovered({component: ReportNameScreen});
            await flushOnyx();

            navigateTo('Cover');
            const pendingRename = Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`, {reportName: NAME_WRITTEN_WHILE_COVERED});
            renderedReportNameSpy.mockClear();

            goBack();
            await completeRevealTransition();
            await act(async () => {
                await pendingRename;
            });
            await flushOnyx();

            expect(rendersWithNoReportNameAtAll()).toEqual([]);
            expect(screen.getByTestId('report-name').props.children).toBe(NAME_WRITTEN_WHILE_COVERED);
        });

        it.failing('re-runs a value-keyed effect only with the value the store holds at the reveal', async () => {
            await seedReportNameBeforeCover();
            renderScreenThatGetsCovered({component: ReportNameSyncingScreen});
            await flushOnyx();
            expect(reportNameEffectSpy).toHaveBeenCalledWith(NAME_BEFORE_COVER);

            navigateTo('Cover');
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${RENAMED_REPORT_ID}`, {reportName: NAME_WRITTEN_WHILE_COVERED});
            });
            reportNameEffectSpy.mockClear();

            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // The reveal re-runs every effect setup regardless of its dependencies, which is expected; what must not
            // happen is a pass with the pre-cover value, because an effect that fetches or writes with it would do so
            // with parameters the store has already moved past.
            expect(reportNameEffectSpy.mock.calls).toEqual([[NAME_WRITTEN_WHILE_COVERED]]);
        });

        it.failing('re-fetches a covered report with the betas that finished loading while it was covered', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
            });
            renderScreenThatGetsCovered({component: ReportScreenWithFetchHandler, name: SCREENS.REPORT, initialParams: {reportID: REPORT_ID}});
            await flushOnyx();
            expect(mockedOpenReport).toHaveBeenCalledWith(expect.objectContaining({betas: [CONST.BETAS.DEFAULT_ROOMS]}));

            navigateTo('Cover');
            await act(async () => {
                await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.PER_DIEM]);
            });
            mockedOpenReport.mockClear();

            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // The reveal re-fetches the report anyway, which is EC-7; what this pins down is the parameters it sends.
            // The effect calling openReport does not list the betas among its dependencies, so the stale pass is the
            // only pass it ever runs and the request goes out without the beta that landed behind the cover.
            expect(mockedOpenReport).toHaveBeenCalledWith(expect.objectContaining({betas: [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.PER_DIEM]}));
        });

        it('re-runs a context-keyed effect only with the value the provider holds at the reveal', async () => {
            const {rerender} = render(screenUnderPolicyIDProvider('policy-before-cover'));
            settleFirstRenderPass();
            expect(contextValueEffectSpy).toHaveBeenCalledWith('policy-before-cover');

            navigateTo('Cover');
            rerender(screenUnderPolicyIDProvider(POLICY_ID_CHANGED_WHILE_COVERED));
            contextValueEffectSpy.mockClear();

            goBack();
            await completeRevealTransition();

            // The boundary of the stale pass above: a value that comes down through React arrives on the reveal
            // render itself, so the single effect re-run already sees it. Only values the screen was subscribed to
            // through useSyncExternalStore need the extra catch-up render, which is what makes the pass before it
            // stale - so the fix belongs at the subscription, not at every effect.
            expect(contextValueEffectSpy.mock.calls).toEqual([[POLICY_ID_CHANGED_WHILE_COVERED]]);
        });
    });

    describe('EC-18: element refs detach on hide and reattach on reveal', () => {
        it('takes the node of a covered screen away and hands the same one back on reveal', async () => {
            renderScreenThatGetsCovered({component: ScreenHandingOutItsNode});
            const nodeBeforeCover = lastNodeHandedToTheRefCallback();
            expect(nodeBeforeCover).not.toBeNull();

            nodeRefCallbackSpy.mockClear();
            navigateTo('Cover');
            expect(lastNodeHandedToTheRefCallback()).toBeNull();

            nodeRefCallbackSpy.mockClear();
            goBack();
            await completeRevealTransition();

            // Locking in the axiom the workaround advice rests on: a hide runs the detach half of a callback ref,
            // so anything handed to a library at attach time is handed over again on every reveal - with the same
            // node, which is why the handoff has to be idempotent rather than one-shot.
            expect(lastNodeHandedToTheRefCallback()).toBe(nodeBeforeCover);
        });
    });

    describe('boundaries of the hide and reveal cycle that hold up', () => {
        it('runs the focus effect of a covered screen exactly once more when it is revealed', async () => {
            renderScreenThatGetsCovered({component: ScreenWithFocusEffect});
            expect(focusEffectSetupSpy).toHaveBeenCalledTimes(1);

            navigateTo('Cover');
            expect(focusEffectCleanupSpy).toHaveBeenCalledTimes(1);

            goBack();
            await completeRevealTransition();

            // A cover blurs and hides, a reveal focuses and re-runs effects, so both paths could run the same
            // callback. They do not stack: react-navigation drops its own reference to the cleanup when it fires it
            // on blur, which leaves the hide nothing to run a second time and the reveal one setup to do.
            expect(focusEffectSetupSpy).toHaveBeenCalledTimes(2);
            expect(focusEffectCleanupSpy).toHaveBeenCalledTimes(1);
        });

        it('hands a revealed screen the same derived object it had before the cover when its data did not change', async () => {
            await seedReportNameBeforeCover();
            renderScreenThatGetsCovered({component: ReportNameSelectorScreen});
            await flushOnyx();
            const selectedBeforeCover: unknown = selectedReportNameSpy.mock.calls.at(-1)?.at(0);

            navigateTo('Cover');
            selectedReportNameSpy.mockClear();
            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // Everything downstream of a selector - memoized lists, list item props, effects keyed on the derived
            // object - is keyed on its identity, so a reveal handing out a new object for data nobody touched would
            // restart all of that work. The snapshot cache keeps the identity, so it does not.
            expect(selectedReportNameSpy.mock.calls.filter(([selectedName]) => selectedName !== selectedBeforeCover)).toEqual([]);
        });

        it('loads an illustration whose import was still in flight when the cover landed', async () => {
            renderScreenThatGetsCovered({component: ScreenShowingALazyIllustration});
            expect(screen.getByTestId('lazy-illustration').props.children).toBe('placeholder');

            navigateTo('Cover');
            await act(async () => {
                lazyIllustrationImport.resolve?.({default: LAZY_ILLUSTRATION_FIRST_REQUEST});
                await waitForBatchedUpdates();
            });

            goBack();
            await completeRevealTransition();
            await flushOnyx();

            // Lazy assets are everywhere, and the hide does drop the import that was in flight: its cleanup flips the
            // isMounted flag the resolution is guarded by, so the module that arrives behind the cover is thrown away -
            // which is why the illustration on screen is the one the reveal asked for, not the one that resolved
            // during the cover. Nothing is lost anyway, and that makes lazy loading the one shape of in-flight async
            // work a cover cannot damage: the request is idempotent, so re-running the effect is a full recovery.
            expect(screen.getByTestId('lazy-illustration').props.children).toBe(LAZY_ILLUSTRATION_WARM_CACHE);
        });
    });

    describe('EC-24: async work aborted on hide is never restarted', () => {
        it('writes the stitched odometer receipt when nothing covers the confirmation step', async () => {
            await renderOdometerConfirmationWithAStitchInFlight();

            await finishTheCanvasWork();

            // The baseline for the two tests below: with the same images, the same real stitch path and the same
            // deferred canvas work, the receipt does land on the transaction and the step leaves the stitching state.
            expect(await getStitchedReceiptSource()).toBe(STITCHED_RECEIPT_URI);
            expect(screen.getByTestId('odometer-receipt-state').props.children).toBe('ready');
        });

        it.failing('writes the stitched odometer receipt when the stitch finishes behind a cover', async () => {
            await renderOdometerConfirmationWithAStitchInFlight();

            navigateTo('Cover');
            await finishTheCanvasWork();

            goBack();
            await completeRevealTransition();
            await flushOnyxDeeply();

            // The hide runs the mount-only cleanup that aborts the controller, so the result of the canvas work is
            // dropped on arrival and the receipt is never written. Without Activity this cleanup only runs when the
            // step really goes away, so the stitch of a merely blurred step completes.
            expect(await getStitchedReceiptSource()).toBe(STITCHED_RECEIPT_URI);
        });

        it.failing('starts the odometer stitch over when the cover aborted the one in flight', async () => {
            await renderOdometerConfirmationWithAStitchInFlight();

            navigateTo('Cover');
            await finishTheCanvasWork();

            goBack();
            await completeRevealTransition();
            await flushOnyxDeeply();

            // The worse half of the abort: the reveal re-runs the derivation effect, but the ref holding the last
            // derived key survives the hide and still matches these images, so the dedupe that exists to stop
            // re-derivation also blocks the recovery. The step stays in the stitching state for good, which is what
            // the confirmation page reads to decide the receipt is not ready yet.
            expect(screen.getByTestId('odometer-receipt-state').props.children).not.toBe('stitching');
        });
    });

    describe('EC-16: an interval restarts from zero on every reveal', () => {
        it('polls once the interval has elapsed on a screen nothing covers', async () => {
            renderScreenThatGetsCovered({component: ScreenPollingForAGrantedPermission});

            letThePollBecomeDue();
            await flushOnyx();

            // The control for the test below: this is the same hook, the same interval and the same debounce window,
            // and left alone they do produce a poll.
            expect(permissionPollSpy).toHaveBeenCalledTimes(1);
        });

        it.failing('polls a screen that spent more than one interval alternating between covered and revealed', async () => {
            renderScreenThatGetsCovered({component: ScreenPollingForAGrantedPermission});

            for (let cycle = 0; cycle < 3; cycle++) {
                spendTime(CONST.TIMING.LOCATION_UPDATE_INTERVAL / 2);
                navigateTo('Cover');
                goBack();
                await completeRevealTransition();
            }
            await flushOnyx();

            // Well over three intervals of wall clock have passed, and the screen was mounted for all of it, but the
            // hide clears the interval and the reveal starts a fresh one, so the countdown never gets to run out. A
            // screen covered more often than its own polling interval stops polling altogether.
            expect(permissionPollSpy).toHaveBeenCalled();
        });

        it('polls a visible screen as soon as the app comes back to the foreground', () => {
            renderScreenThatGetsCovered({component: ScreenPollingForAGrantedPermission});

            bringTheAppBackToTheForeground();

            // The control for the test below, and the reason the hook subscribes to visibility at all: coming back
            // from the OS settings must be noticed immediately rather than up to one interval later.
            expect(permissionPollSpy).toHaveBeenCalledTimes(1);
        });

        it.failing('polls a covered screen for the foreground it returned to while it was covered', async () => {
            renderScreenThatGetsCovered({component: ScreenPollingForAGrantedPermission});

            navigateTo('Cover');
            bringTheAppBackToTheForeground();

            goBack();
            await completeRevealTransition();
            spendTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);

            // The hide unsubscribes from visibility as well, so the one event this hook exists to react to passes
            // unheard, and the reveal starts a fresh interval instead of catching up on it. What makes this worse than
            // the missed interval above is the shape of the loss: a foreground is a moment, not a level, so no later
            // read of the store can recover it.
            expect(permissionPollSpy).toHaveBeenCalled();
        });
    });

    describe('EC-10: the flush the debounce hook already offers is the fix, and only one call site takes it', () => {
        it('saves both drafts when nothing covers the composer', async () => {
            renderScreenThatGetsCovered({component: ScreenSavingADraftEachWay});

            letTheDebounceWindowElapse();
            await flushOnyx();

            // The baseline for the three tests below: left alone, the two configurations are indistinguishable.
            expect(await getDraftComment(REPORT_WITH_A_CANCELLED_DRAFT_SAVE)).toBe(DRAFT_TYPED_BEFORE_THE_COVER);
            expect(await getDraftComment(REPORT_WITH_A_FLUSHED_DRAFT_SAVE)).toBe(DRAFT_TYPED_BEFORE_THE_COVER);
        });

        it('saves the draft of the call site that flushes on cleanup, even though the cover cut the debounce short', async () => {
            renderScreenThatGetsCovered({component: ScreenSavingADraftEachWay});

            navigateTo('Cover');
            await flushOnyx();

            // The workaround for this whole class of loss is already in the repo and already used by the main
            // composer: the hook registers its flush before the debounce so that cleanup runs first, and a hide runs
            // cleanups the same way an unmount does. The draft lands during the hide itself, without waiting out the
            // rest of the debounce window - which is what makes flipping the flag a real fix rather than a race.
            expect(await getDraftComment(REPORT_WITH_A_FLUSHED_DRAFT_SAVE)).toBe(DRAFT_TYPED_BEFORE_THE_COVER);
        });

        it.failing('saves the draft of the call site that takes the default, once its screen is revealed again', async () => {
            renderScreenThatGetsCovered({component: ScreenSavingADraftEachWay});

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();
            letTheDebounceWindowElapse();
            await flushOnyx();

            // The other configuration, in the same run, with the same keystroke: the cover cancels the pending save
            // and the reveal only rebuilds an idle debounced function, because the thing that would call it is a
            // keystroke and the user already made theirs. A full debounce window after the reveal changes nothing.
            expect(await getDraftComment(REPORT_WITH_A_CANCELLED_DRAFT_SAVE)).toBe(DRAFT_TYPED_BEFORE_THE_COVER);
        });

        it.failing('stops reporting a save as pending once the cover has cancelled it', async () => {
            renderScreenThatGetsCovered({component: ScreenSavingADraftEachWay});
            expect(pendingDraftSave.isSavePending?.current).toBe(true);

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();
            letTheDebounceWindowElapse();
            await flushOnyx();

            // The second half of the loss, and the reason it does not stay contained: the flag is raised by the
            // caller and lowered by the debounced function, so cancelling that function leaves it raised on a ref
            // that survives the hide. The edit composer hands this ref to the draft video-attribute cache as
            // isEditInProgressRef, which then stops syncing the draft for as long as the editor lives.
            expect(pendingDraftSave.isSavePending?.current).toBe(false);
        });
    });

    describe('EC-9 and EC-25: a table selection is cleared by the hide and cleared again by the reveal', () => {
        it('keeps a selected row on a table nothing covers', () => {
            renderScreenThatGetsCovered({component: ScreenWithASelectableTable});

            selectATableRow();

            // The control: selecting a row through the real middleware keeps it selected.
            expect(selectedTableRows()).toBe(SELECTED_TABLE_ROW);
        });

        it.failing('keeps a selected row when the table is covered and revealed', async () => {
            renderScreenThatGetsCovered({component: ScreenWithASelectableTable});
            selectATableRow();

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();

            // The middleware clears the selection in a mount-only cleanup, so every table in the app loses whatever
            // the user picked the moment something covers it. The selection lives in the parent, and the hook hands
            // it an empty array, so there is nothing left to restore from.
            expect(selectedTableRows()).toBe(SELECTED_TABLE_ROW);
        });

        it.failing('does not clear the selection a second time when the covered table is revealed', async () => {
            renderScreenThatGetsCovered({component: ScreenWithASelectableTable});
            selectATableRow();

            navigateTo('Cover');
            tableSelectionSpy.mockClear();

            goBack();
            await completeRevealTransition();

            // What makes the test above harder to fix than it looks: the middleware also resets the selection
            // whenever the filters or the search string change, and a reveal re-runs that effect with neither of them
            // changed. Deleting the mount-only cleanup would not save the selection - the reveal wipes it anyway, so
            // both paths have to be dealt with.
            expect(tableSelectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('EC-16: a timeout restarts from zero too, and that is the difference between a delay and a loss', () => {
        it('reactivates a throttled button on a screen nothing covers', () => {
            renderScreenThatGetsCovered({component: ScreenWithAThrottledButton});
            pressTheThrottledButton();
            expect(throttledButtonState()).toBe('throttled');

            spendTime(THROTTLED_BUTTON_RESET_DELAY + 100);

            // The control: the throttle window is the hook's whole contract, and left alone it runs out.
            expect(throttledButtonState()).toBe('active');
        });

        it.failing('reactivates a throttled button once its own window has passed, cover or no cover', async () => {
            renderScreenThatGetsCovered({component: ScreenWithAThrottledButton});
            pressTheThrottledButton();

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();
            spendTime(THROTTLED_BUTTON_RESET_DELAY - TIME_SPENT_ON_A_COVER_AND_A_REVEAL + 100);

            // Same as the interval above, on the other kind of timer and on a hook the copy buttons and the travel
            // card CVV page use: the hide clears the pending timeout and the reveal schedules a brand new one, so the
            // window the user waits out is measured from the reveal rather than from their press.
            expect(throttledButtonState()).toBe('active');
        });

        it('reactivates a throttled button a full window after the reveal', async () => {
            renderScreenThatGetsCovered({component: ScreenWithAThrottledButton});
            pressTheThrottledButton();

            navigateTo('Cover');
            goBack();
            await completeRevealTransition();
            spendTime(THROTTLED_BUTTON_RESET_DELAY + 100);

            // The line between the two halves of this batch. A restarted timer is late but not lost, because the
            // reveal itself is what schedules it again - nobody has to come back and press anything. The cancelled
            // draft save above has no such restart: its trigger was a keystroke, and the user already made theirs.
            expect(throttledButtonState()).toBe('active');
        });
    });
});
