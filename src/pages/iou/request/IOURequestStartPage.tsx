import ActivityIndicator from '@components/ActivityIndicator';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResetIOUType from '@hooks/useResetIOUType';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldShowPerDiemTabOption} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {isPerDiemEligiblePolicy, isTimeTrackingEnabled} from '@libs/PolicyUtils';
import {getPayeeName} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {cancelTracking} from '@libs/telemetry/submitFollowUpAction';
import {isPerDiemRequest, isScanRequest} from '@libs/TransactionUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {createIOURequestStartPoliciesSelector} from '@src/selectors/Policy';
import type {SelectedTabRequest} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

import DynamicIOURequestStepDestination from './step/DynamicIOURequestStepDestination';
import DynamicIOURequestStepDistance from './step/DynamicIOURequestStepDistance';
import {IOURequestStepAmountWithTransactionOnly} from './step/IOURequestStepAmount';
import IOURequestStepConfirmation from './step/IOURequestStepConfirmation';
import IOURequestStepHours from './step/IOURequestStepHours';
import IOURequestStepPerDiemWorkspace from './step/IOURequestStepPerDiemWorkspace';
import IOURequestStepScan from './step/IOURequestStepScan';
import IOURequestStepTimeWorkspace from './step/IOURequestStepTimeWorkspace';

type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & {
    defaultSelectedTab: SelectedTabRequest;
};

// Tab indices for IOURequestStartPage
const PER_DIEM_TAB_INDEX = 2;

function IOURequestStartPage({
    route,
    route: {
        params: {iouType, reportID},
    },
    navigation,
    // This is currently only being used for testing
    defaultSelectedTab = CONST.TAB_REQUEST.SCAN,
}: IOURequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldUseTab = iouType !== CONST.IOU.TYPE.SEND && iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.INVOICE;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [lastSelectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`);
    // Derive selectedTab directly instead of using state
    const selectedTab = lastSelectedTab;

    const isLoadingSelectedTab = shouldUseTab ? isLoadingOnyxValue(selectedTabResult) : false;
    const [transaction, transactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(route?.params.transactionID)}`);
    const isLoadingTransaction = isLoadingOnyxValue(transactionResult);
    const perDiemInputRef = useRef<AnimatedTextInputRef | null>(null);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [iouRequestStartPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: createIOURequestStartPoliciesSelector(currentUserPersonalDetails.login, iouType === CONST.IOU.TYPE.INVOICE),
    });
    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', getPayeeName(report, translate, currentUserPersonalDetails.accountID)),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', getPayeeName(report, translate, currentUserPersonalDetails.accountID)),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    const onTabSelectFocusHandler = ({index}: {index: number}) => {
        if (index !== PER_DIEM_TAB_INDEX) {
            return;
        }
        setTimeout(() => {
            perDiemInputRef.current?.focus?.();
        }, CONST.ANIMATED_TRANSITION);
    };

    const isFromGlobalCreate = isEmptyObject(report?.reportID);
    const doesPerDiemPolicyExist = !!iouRequestStartPolicies?.hasPerDiemPolicy;
    const moreThanOnePerDiemExist = !!iouRequestStartPolicies?.hasMultiplePerDiemPolicies;
    const hasCurrentPolicyPerDiemEnabled = isPerDiemEligiblePolicy(policy);
    const hasCurrentPolicyTimeTrackingEnabled = policy ? isTimeTrackingEnabled(policy) : false;
    const shouldShowPerDiemOption = shouldShowPerDiemTabOption(iouType, isFromGlobalCreate, hasCurrentPolicyPerDiemEnabled, doesPerDiemPolicyExist);
    const shouldShowTimeOption =
        (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE) &&
        ((!isFromGlobalCreate && hasCurrentPolicyTimeTrackingEnabled) || (isFromGlobalCreate && !!iouRequestStartPolicies?.hasTimePolicy));

    // Mirrors the tabs rendered below so a stale persisted selectedTab that isn't valid for this iouType is rejected.
    const availableTabs = useMemo<Set<SelectedTabRequest>>(() => {
        if (!shouldUseTab) {
            return new Set();
        }
        const tabs = new Set<SelectedTabRequest>([CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.SCAN]);
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            tabs.add(CONST.TAB_REQUEST.DISTANCE);
        }
        if (shouldShowPerDiemOption) {
            tabs.add(CONST.TAB_REQUEST.PER_DIEM);
        }
        if (shouldShowTimeOption) {
            tabs.add(CONST.TAB_REQUEST.TIME);
        }
        return tabs;
    }, [shouldUseTab, iouType, shouldShowPerDiemOption, shouldShowTimeOption]);

    // A quick-action deeplink (e.g. iOS home-screen "Scan receipt") bypasses startMoneyRequest
    // and leaves the previous flow's draft in place under OPTIMISTIC_TRANSACTION_ID. Detect it
    // by comparing the draft's reportID to the URL's so we don't inherit its stale iouRequestType.
    const [latchedDraftStaleness, setLatchedDraftStaleness] = useState<{reportID: string; isStale: boolean}>();
    if (!isLoadingTransaction && latchedDraftStaleness?.reportID !== reportID) {
        setLatchedDraftStaleness({reportID, isStale: !!transaction?.reportID && transaction.reportID !== reportID});
    }
    const isStaleTransactionDraft = latchedDraftStaleness?.isStale ?? false;

    const transactionRequestType = useMemo(() => {
        if (transaction?.iouRequestType && !isStaleTransactionDraft) {
            return transaction.iouRequestType;
        }
        if (!shouldUseTab) {
            return CONST.IOU.REQUEST_TYPE.MANUAL;
        }
        // selectedTab must be valid for the currently-rendered tab set; otherwise let
        // OnyxTabNavigator.onTabSelected initialize from the URL (which is authoritative).
        if (selectedTab && availableTabs.has(selectedTab)) {
            return selectedTab;
        }
        return undefined;
    }, [transaction?.iouRequestType, isStaleTransactionDraft, shouldUseTab, selectedTab, availableTabs]);

    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const resetIOUTypeIfChanged = useResetIOUType({
        reportID,
        report,
        transaction,
        isLoadingTransaction,
        isLoadingSelectedTab,
        transactionRequestType,
        iouType,
        policy,
        skipKeyboardDismissForPerDiem: true,
        isNewManualExpenseFlowEnabled,
    });

    useEffect(() => {
        // Don't end span for scan flows - it will be ended when camera initializes (or canceled if permission is denied).
        if (transactionRequestType === CONST.IOU.REQUEST_TYPE.SCAN) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        // Tab switches change transactionRequestType but shouldn't re-trigger endSpan.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        // In the new manual expense beta the confirmation is embedded with its header hidden,
        // so this back button is the only way to abandon the flow. Cancel any active span
        // unconditionally (mirrors IOURequestStepConfirmation.navigateBack). No-op when no
        // tracking session is active.
        cancelTracking();

        // Restore the pre-inserted fullscreen tab while the RHP is still on top so the clean
        // REMOVE_FULLSCREEN_UNDER_RHP branch is used. Otherwise closeRHPFlow pops the RHP first and the
        // confirmation's unmount cleanup restores the original tab a frame later, briefly flashing the
        // pre-inserted Search/Spend tab. This is a no-op when nothing was pre-inserted.
        Navigation.removePreInsertedFullscreenIfNeeded();
        Navigation.closeRHPFlow();
    };

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element);
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const onBackButtonPress = () => {
        navigateBack();
        return true;
    };

    useAndroidBackButtonHandler(onBackButtonPress);

    const shouldShowWorkspaceSelectForPerDiem = moreThanOnePerDiemExist && !hasCurrentPolicyPerDiemEnabled;

    // Every flow that reaches this page embeds the confirmation as its landing step except INVOICE, which stays on the
    // amount-first flow. (`shouldUseTab` also excludes the deprecated SEND type, but nothing builds a create route with
    // it, so PAY is the only type this has to add back.)
    // The pay quick action still writes SKIP_CONFIRMATION, but IOURequestStepAmount is its only reader and no longer
    // mounts for PAY - the embedded confirmation carries the amount inline, so there is no separate step left to skip.
    const shouldEmbedConfirmation = isNewManualExpenseFlowEnabled && (shouldUseTab || iouType === CONST.IOU.TYPE.PAY);

    let manualContent: React.ReactNode;
    if (!shouldEmbedConfirmation) {
        manualContent = (
            <IOURequestStepAmountWithTransactionOnly
                shouldKeepUserInput
                shouldHideHeader
                route={route}
                navigation={navigation}
                report={report}
                reportDraft={reportDraft}
            />
        );
    } else if (shouldUseTab && (isScanRequest(transaction) || isPerDiemRequest(transaction))) {
        // Only the tabbed flows can land here with a stale draft, and only they run the reset that clears it
        // (`resetIOUTypeIfChanged` is wired to `onTabSelected` below). PAY renders no tabs, so it must skip this
        // branch or a leftover scan/per-diem draft would strand it on a loader with no way out but the back button.
        // When switching from the Scan or Per diem tab, the shared draft is briefly still a scan/per-diem request
        // until the tab-switch reset rebuilds it as manual. Mounting the embedded confirmation against that stale
        // draft does throwaway work that is immediately discarded once the reset lands - for scan a heavy first
        // render (scan loader, reading the receipt blob), and for per diem the confirmation renders per-diem UI
        // (wrong fields, and the "Confirm page shows per diem" bug). Wait for the reset so the manual confirmation
        // mounts once against the rebuilt manual draft.
        // The header and tab bar remain visible above this loader, so per UI-1 use ActivityIndicator (users can still go back) instead of FullScreenLoadingIndicator.
        manualContent = (
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator
                    testID="manualTabPendingReset"
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                />
            </View>
        );
    } else {
        manualContent = (
            <IOURequestStepConfirmation
                route={route}
                navigation={navigation}
                shouldHideHeader
            />
        );
    }

    return (
        <AccessOrNotFoundWrapper
            reportID={reportID}
            iouType={iouType}
            policyID={policy?.id}
            accessVariants={[CONST.IOU.ACCESS_VARIANTS.CREATE]}
            canSendInvoice={iouRequestStartPolicies?.canSendInvoiceFromAnyWorkspace}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={isNewManualExpenseFlowEnabled}
                shouldEnableMaxHeight={selectedTab === CONST.TAB_REQUEST.PER_DIEM}
                shouldEnableMinHeight={canUseTouchScreen()}
                testID="IOURequestStartPage"
                focusTrapSettings={{containerElements: focusTrapContainerElements}}
            >
                {/* If the new manual expense flow is enabled, the confirmation screen is shown on the start page, so we do not want to disable the drag and drop provider in that case */}
                <DragAndDropProvider isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN && !(isNewManualExpenseFlowEnabled && selectedTab === CONST.TAB_REQUEST.MANUAL)}>
                    <View style={styles.flex1}>
                        <FocusTrapContainerElement
                            onContainerElementChanged={setHeaderWithBackButtonContainerElement}
                            style={[styles.w100]}
                        >
                            <HeaderWithBackButton
                                title={tabTitles[iouType]}
                                onBackButtonPress={navigateBack}
                            />
                        </FocusTrapContainerElement>

                        {shouldUseTab ? (
                            <OnyxTabNavigator
                                id={CONST.TAB.IOU_REQUEST_TYPE}
                                defaultSelectedTab={defaultSelectedTab}
                                onTabSelected={resetIOUTypeIfChanged}
                                onTabSelect={onTabSelectFocusHandler}
                                tabBar={TabSelector}
                                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                                onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement}
                                lazyLoadEnabled
                                shouldReapplyInterruptedTabPress
                            >
                                <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>{() => <TabScreenWithFocusTrapWrapper>{manualContent}</TabScreenWithFocusTrapWrapper>}</TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepScan
                                                key={transactionRequestType}
                                                route={route}
                                                navigation={navigation}
                                            />
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                                {iouType === CONST.IOU.TYPE.SPLIT && (
                                    <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                <DynamicIOURequestStepDistance
                                                    route={route}
                                                    navigation={navigation}
                                                />
                                            </TabScreenWithFocusTrapWrapper>
                                        )}
                                    </TopTab.Screen>
                                )}
                                {!!shouldShowPerDiemOption && (
                                    <TopTab.Screen name={CONST.TAB_REQUEST.PER_DIEM}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                {shouldShowWorkspaceSelectForPerDiem ? (
                                                    <IOURequestStepPerDiemWorkspace
                                                        route={route}
                                                        navigation={navigation}
                                                    />
                                                ) : (
                                                    <DynamicIOURequestStepDestination
                                                        openedFromStartPage
                                                        ref={perDiemInputRef}
                                                        explicitPolicyID={moreThanOnePerDiemExist ? undefined : iouRequestStartPolicies?.firstPerDiemPolicyID}
                                                        route={route}
                                                        navigation={navigation}
                                                    />
                                                )}
                                            </TabScreenWithFocusTrapWrapper>
                                        )}
                                    </TopTab.Screen>
                                )}
                                {shouldShowTimeOption && (
                                    <TopTab.Screen name={CONST.TAB_REQUEST.TIME}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                {isFromGlobalCreate && iouRequestStartPolicies?.hasMultipleTimePolicies ? (
                                                    <IOURequestStepTimeWorkspace
                                                        route={route}
                                                        navigation={navigation}
                                                    />
                                                ) : (
                                                    <IOURequestStepHours
                                                        route={route}
                                                        navigation={navigation}
                                                        explicitPolicyID={isFromGlobalCreate ? iouRequestStartPolicies?.firstTimePolicyID : undefined}
                                                    />
                                                )}
                                            </TabScreenWithFocusTrapWrapper>
                                        )}
                                    </TopTab.Screen>
                                )}
                            </OnyxTabNavigator>
                        ) : (
                            <FocusTrapContainerElement
                                onContainerElementChanged={setActiveTabContainerElement}
                                style={[styles.flexColumn, styles.flex1]}
                            >
                                {manualContent}
                            </FocusTrapContainerElement>
                        )}
                    </View>
                </DragAndDropProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default IOURequestStartPage;
