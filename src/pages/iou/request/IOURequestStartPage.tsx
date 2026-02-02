import {useFocusEffect} from '@react-navigation/native';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {getIsUserSubmittedExpenseOrScannedReceipt} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    getPerDiemCustomUnit,
    hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil,
    isTimeTrackingEnabled,
} from '@libs/PolicyUtils';
import {getPayeeName} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {IOURequestType} from '@userActions/IOU';
import {initMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import IOURequestStepAmount from './step/IOURequestStepAmount';
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
    const personalPolicy = usePersonalPolicy();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [lastSelectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, {canBeMissing: true});
    const [selectedTab, setSelectedTab] = useState(lastSelectedTab);

    const isLoadingSelectedTab = shouldUseTab ? isLoadingOnyxValue(selectedTabResult) : false;
    const [transaction, transactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(route?.params.transactionID)}`, {canBeMissing: true});
    const isLoadingTransaction = isLoadingOnyxValue(transactionResult);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftValuesSelector,
        canBeMissing: true,
    });
    const [draftTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [isMultiScanEnabled, setIsMultiScanEnabled] = useState((optimisticTransactions ?? []).length > 1);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(allPolicies), [allPolicies]);

    const perDiemInputRef = useRef<AnimatedTextInputRef | null>(null);

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: getPayeeName(report)}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: getPayeeName(report)}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    const onTabSelectFocusHandler = ({index}: {index: number}) => {
        // We requestAnimationFrame since the function is called in the animate block in the web implementation
        // which fixes a locked animation glitch when swiping between tabs, and aligns with the native implementation internal delay
        requestAnimationFrame(() => {
            //  2 - PerDiem
            if (index !== 2) {
                return;
            }
            perDiemInputRef.current?.focus?.();
        });
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
    const hasCurrentPolicyPerDiemEnabled = !!policy?.arePerDiemRatesEnabled;
    const hasCurrentPolicyTimeTrackingEnabled = policy ? isTimeTrackingEnabled(policy) : false;
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const hasPolicyPerDiemRates = !isEmptyObject(perDiemCustomUnit?.rates);
    const shouldShowPerDiemOption =
        iouType !== CONST.IOU.TYPE.SPLIT &&
        iouType !== CONST.IOU.TYPE.TRACK &&
        ((!isFromGlobalCreate && hasCurrentPolicyPerDiemEnabled && hasPolicyPerDiemRates) || (isFromGlobalCreate && doesPerDiemPolicyExist));

    const transactionRequestType = useMemo(() => {
        if (!transaction?.iouRequestType) {
            if (shouldUseTab) {
                if (selectedTab === CONST.TAB_REQUEST.PER_DIEM && !shouldShowPerDiemOption) {
                    return undefined;
                }
                return selectedTab;
            }

            return CONST.IOU.REQUEST_TYPE.MANUAL;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, shouldUseTab, selectedTab, shouldShowPerDiemOption]);

    const prevTransactionReportID = usePrevious(transaction?.reportID);

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE);
    }, []);

    useEffect(() => {
        if (isLoadingSelectedTab || selectedTab) {
            return;
        }
        setSelectedTab(lastSelectedTab);
    }, [isLoadingSelectedTab, selectedTab, lastSelectedTab]);

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            Keyboard.dismiss();
            if (transaction?.iouRequestType === newIOUType) {
                return;
            }
            setIsMultiScanEnabled(false);
            initMoneyRequest({
                reportID,
                policy,
                personalPolicy,
                isFromGlobalCreate: transaction?.isFromGlobalCreate ?? isFromGlobalCreate,
                currentIouRequestType: transaction?.iouRequestType,
                newIouRequestType: newIOUType,
                report,
                parentReport,
                currentDate,
                lastSelectedDistanceRates,
                currentUserPersonalDetails,
                hasOnlyPersonalPolicies,
                draftTransactions,
            });
        },
        [
            transaction?.iouRequestType,
            transaction?.isFromGlobalCreate,
            reportID,
            policy,
            personalPolicy,
            isFromGlobalCreate,
            report,
            parentReport,
            currentDate,
            lastSelectedDistanceRates,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies,
            draftTransactions,
        ],
    );

    const onTabSelected = useCallback(
        (newIouType: IOURequestType) => {
            setSelectedTab(newIouType);
            resetIOUTypeIfChanged(newIouType);
        },
        [resetIOUTypeIfChanged],
    );

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    useFocusEffect(
        useCallback(() => {
            // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
            if (
                transaction?.reportID === reportID ||
                isLoadingTransaction ||
                isLoadingSelectedTab ||
                !transactionRequestType ||
                prevTransactionReportID !== transaction?.reportID ||
                !personalPolicy?.id
            ) {
                return;
            }
            resetIOUTypeIfChanged(transactionRequestType);
        }, [transaction?.reportID, reportID, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID, isLoadingTransaction, personalPolicy?.id]),
    );

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
        !getIsUserSubmittedExpenseOrScannedReceipt(nvpDismissedProductTraining) &&
            isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) &&
            selectedTab === CONST.TAB_REQUEST.SCAN &&
            !(isOffline && isWeb),
        {
            onConfirm: () => {
                setTestReceiptAndNavigateRef?.current?.();
            },
            onDismiss: () => {
                dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, true);
            },
        },
    );
    const shouldShowTimeOption =
        isBetaEnabled(CONST.BETAS.TIME_TRACKING) &&
        (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE) &&
        ((!isFromGlobalCreate && hasCurrentPolicyTimeTrackingEnabled) || (isFromGlobalCreate && !!policiesWithTimeEnabled.length));

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
            allPolicies={allPolicies}
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
                                onTabSelected={onTabSelected}
                                onTabSelect={onTabSelectFocusHandler}
                                tabBar={TabSelector}
                                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                                onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement}
                                shouldShowLabelWhenInactive={!shouldShowPerDiemOption}
                                shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                                renderProductTrainingTooltip={renderProductTrainingTooltip}
                                lazyLoadEnabled
                            >
                                <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepAmount
                                                shouldKeepUserInput
                                                route={route}
                                                navigation={navigation}
                                            />
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepScan
                                                route={route}
                                                navigation={navigation}
                                                onLayout={(setTestReceiptAndNavigate) => {
                                                    setTestReceiptAndNavigateRef.current = setTestReceiptAndNavigate;
                                                }}
                                                isMultiScanEnabled={isMultiScanEnabled}
                                                setIsMultiScanEnabled={setIsMultiScanEnabled}
                                                isStartingScan
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
                                <IOURequestStepAmount
                                    route={route}
                                    navigation={navigation}
                                    shouldKeepUserInput
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
