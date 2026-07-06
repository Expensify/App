import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    getPerDiemCustomUnit,
    isControlPolicy,
    isPerDiemEnabled,
    isTimeTrackingEnabled,
} from '@libs/PolicyUtils';
import {getPayeeName} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {cancelTracking} from '@libs/telemetry/submitFollowUpAction';
import {isScanRequest} from '@libs/TransactionUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setNativeShortcutFlag} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {iouRequestPolicyCollectionSelector} from '@src/selectors/Policy';
import type {SelectedTabRequest} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

import {IOURequestStepAmountWithTransactionOnly} from './step/IOURequestStepAmount';
import IOURequestStepConfirmation from './step/IOURequestStepConfirmation';
import IOURequestStepDestination from './step/IOURequestStepDestination';
import IOURequestStepDistance from './step/IOURequestStepDistance';
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
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: iouRequestPolicyCollectionSelector,
    });

    const perDiemInputRef = useRef<AnimatedTextInputRef | null>(null);
    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', getPayeeName(report)),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', getPayeeName(report)),
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
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const policiesWithPerDiemEnabledAndHasRates = useMemo(
        () => getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates(allPolicies, currentUserPersonalDetails.login),
        [allPolicies, currentUserPersonalDetails.login],
    );
    const policiesWithTimeEnabled = useMemo(
        () => getActivePoliciesWithExpenseChatAndTimeEnabled(allPolicies, currentUserPersonalDetails.login),
        [allPolicies, currentUserPersonalDetails.login],
    );
    const doesPerDiemPolicyExist = policiesWithPerDiemEnabledAndHasRates.length > 0;
    const moreThanOnePerDiemExist = policiesWithPerDiemEnabledAndHasRates.length > 1;
    const hasCurrentPolicyPerDiemEnabled = isControlPolicy(policy) && isPerDiemEnabled(policy);
    const hasCurrentPolicyTimeTrackingEnabled = policy ? isTimeTrackingEnabled(policy) : false;
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const hasPolicyPerDiemRates = !isEmptyObject(perDiemCustomUnit?.rates);
    const hasCurrentPolicyPerDiemWithRates = !isFromGlobalCreate && hasCurrentPolicyPerDiemEnabled && hasPolicyPerDiemRates;
    const hasAnyPolicyPerDiemWithRates = (iouType === CONST.IOU.TYPE.TRACK || isFromGlobalCreate) && doesPerDiemPolicyExist;
    const shouldShowPerDiemOption = iouType !== CONST.IOU.TYPE.SPLIT && (hasCurrentPolicyPerDiemWithRates || hasAnyPolicyPerDiemWithRates);
    const shouldShowTimeOption =
        (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE) &&
        ((!isFromGlobalCreate && hasCurrentPolicyTimeTrackingEnabled) || (isFromGlobalCreate && !!policiesWithTimeEnabled.length));

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
    const isStaleTransactionDraft = !!transaction?.reportID && transaction.reportID !== reportID;

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

    useEffect(() => {
        // Native home-screen shortcuts open IOURequestStartPage directly via deeplink without
        // calling startMoneyRequest first. In contrast, in-app flows (FAB, Search empty state, etc.)
        // always call startMoneyRequest which clears the draft and creates a fresh one with the
        // matching reportID. We detect a native shortcut by:
        //   1. isFromGlobalCreate — the route's reportID doesn't map to a real report
        //   2. Draft is missing or stale (reportID mismatch) — startMoneyRequest wasn't called
        // We intentionally ignore flags on stale drafts (e.g. isFromFloatingActionButton from an
        // abandoned FAB flow) since they belong to a previous, unrelated flow.
        if (!isFromGlobalCreate) {
            return;
        }
        // A fresh draft (matching reportID) means startMoneyRequest was called — this is an in-app flow.
        if (transaction && !isStaleTransactionDraft) {
            return;
        }
        setNativeShortcutFlag(route.params.transactionID);
        // Only run once on mount to capture the original creation source; later transaction/route changes must not re-mark the flag.
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

    let manualTabContent: React.ReactNode;
    if (!isNewManualExpenseFlowEnabled) {
        manualTabContent = (
            <IOURequestStepAmountWithTransactionOnly
                shouldKeepUserInput
                route={route}
                navigation={navigation}
                report={report}
                reportDraft={reportDraft}
            />
        );
    } else if (isScanRequest(transaction)) {
        // When switching from the Scan tab, the shared draft is briefly still a scan request (with the uploaded
        // receipt) until the tab-switch reset rebuilds it as manual. Mounting the embedded confirmation against that
        // stale scan draft does throwaway work (scan loader, reading the receipt blob and a heavy first render) that
        // is immediately discarded once the reset lands. Wait for the reset so the manual confirmation mounts once.
        manualTabContent = <FullScreenLoadingIndicator reasonAttributes={{context: 'IOURequestStartPage.manualTabPendingReset'}} />;
    } else {
        manualTabContent = (
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
            allPolicies={iouType === CONST.IOU.TYPE.INVOICE ? allPolicies : undefined}
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
                            >
                                <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>{() => <TabScreenWithFocusTrapWrapper>{manualTabContent}</TabScreenWithFocusTrapWrapper>}</TopTab.Screen>
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
                                                <IOURequestStepDistance
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
                                                    <IOURequestStepDestination
                                                        openedFromStartPage
                                                        ref={perDiemInputRef}
                                                        explicitPolicyID={moreThanOnePerDiemExist ? undefined : policiesWithPerDiemEnabledAndHasRates.at(0)?.id}
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
                                                {isFromGlobalCreate && policiesWithTimeEnabled.length > 1 ? (
                                                    <IOURequestStepTimeWorkspace
                                                        route={route}
                                                        navigation={navigation}
                                                    />
                                                ) : (
                                                    <IOURequestStepHours
                                                        route={route}
                                                        navigation={navigation}
                                                        explicitPolicyID={isFromGlobalCreate ? policiesWithTimeEnabled.at(0)?.id : undefined}
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
                                <IOURequestStepAmountWithTransactionOnly
                                    route={route}
                                    navigation={navigation}
                                    shouldKeepUserInput
                                    report={report}
                                    reportDraft={reportDraft}
                                />
                            </FocusTrapContainerElement>
                        )}
                    </View>
                </DragAndDropProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default IOURequestStartPage;
