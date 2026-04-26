import {iouRequestPolicyCollectionSelector} from '@selectors/Policy';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResetIOUType from '@hooks/useResetIOUType';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import GoogleTagManager from '@libs/GoogleTagManager';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    getPerDiemCustomUnit,
    isControlPolicy,
    isTimeTrackingEnabled,
} from '@libs/PolicyUtils';
import {getPayeeName} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {DismissedProductTraining, SelectedTabRequest} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {IOURequestStepAmountWithTransactionOnly} from './step/IOURequestStepAmount';
import IOURequestStepDestination from './step/IOURequestStepDestination';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepHours from './step/IOURequestStepHours';
import IOURequestStepPerDiemWorkspace from './step/IOURequestStepPerDiemWorkspace';
import IOURequestStepScan from './step/IOURequestStepScan';
import IOURequestStepTimeWorkspace from './step/IOURequestStepTimeWorkspace';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & {
    defaultSelectedTab: SelectedTabRequest;
};

const platform = getPlatform(true);
const isWeb = ([CONST.PLATFORM.WEB, CONST.PLATFORM.MOBILE_WEB] as Platform[]).includes(platform);

// Tab indices for IOURequestStartPage
const PER_DIEM_TAB_INDEX = 2;

const isTestReceiptTooltipDismissedSelector = (nvp: OnyxEntry<DismissedProductTraining>): boolean => !!nvp?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP];

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

    const {isOffline} = useNetwork();
    const [hasUserSubmittedExpenseOrScannedReceipt] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: isTestReceiptTooltipDismissedSelector});

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
    const accountID = currentUserPersonalDetails.accountID;
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
    const hasCurrentPolicyPerDiemEnabled = isControlPolicy(policy) && !!policy?.arePerDiemRatesEnabled;
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

    const resetIOUTypeIfChanged = useResetIOUType({
        reportID,
        report,
        transaction,
        isLoadingTransaction,
        isLoadingSelectedTab,
        transactionRequestType,
        policy,
        skipKeyboardDismissForPerDiem: true,
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
        Navigation.closeRHPFlow();
    };

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element);
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const {isBetaEnabled} = usePermissions();
    const setTestReceiptAndNavigateRef = useRef<() => void>(() => {});
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP,
        // The test receipt image is served via our server on web so it requires internet connection
        !hasUserSubmittedExpenseOrScannedReceipt && isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) && selectedTab === CONST.TAB_REQUEST.SCAN && !(isOffline && isWeb),
        {
            onShown: () => {
                GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.PRODUCT_TRAINING_SCAN_TEST_TOOLTIP_SHOWN, accountID);
            },
            onConfirm: () => {
                setTestReceiptAndNavigateRef?.current?.();
                GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.PRODUCT_TRAINING_SCAN_TEST_TOOLTIP_CONFIRMED, accountID);
            },
            onDismiss: () => {
                dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, true);
                GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.PRODUCT_TRAINING_SCAN_TEST_TOOLTIP_DISMISSED, accountID);
            },
        },
    );
    const onBackButtonPress = () => {
        navigateBack();
        return true;
    };

    useAndroidBackButtonHandler(onBackButtonPress);

    const shouldShowWorkspaceSelectForPerDiem = moreThanOnePerDiemExist && !hasCurrentPolicyPerDiemEnabled;

    return (
        <AccessOrNotFoundWrapper
            reportID={reportID}
            iouType={iouType}
            policyID={policy?.id}
            accessVariants={[CONST.IOU.ACCESS_VARIANTS.CREATE]}
            allPolicies={iouType === CONST.IOU.TYPE.INVOICE ? allPolicies : undefined}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                shouldEnableMaxHeight={selectedTab === CONST.TAB_REQUEST.PER_DIEM}
                shouldEnableMinHeight={canUseTouchScreen()}
                testID="IOURequestStartPage"
                focusTrapSettings={{containerElements: focusTrapContainerElements}}
            >
                <DragAndDropProvider isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}>
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
                                shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                                renderProductTrainingTooltip={renderProductTrainingTooltip}
                                lazyLoadEnabled
                            >
                                <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepAmountWithTransactionOnly
                                                shouldKeepUserInput
                                                route={route}
                                                navigation={navigation}
                                                report={report}
                                                reportDraft={reportDraft}
                                            />
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepScan
                                                key={transactionRequestType}
                                                route={route}
                                                navigation={navigation}
                                                onLayout={(setTestReceiptAndNavigate) => {
                                                    setTestReceiptAndNavigateRef.current = setTestReceiptAndNavigate;
                                                }}
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
