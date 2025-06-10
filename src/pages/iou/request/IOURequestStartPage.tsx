import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {getIsUserSubmittedExpenseOrScannedReceipt} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {getPerDiemCustomUnit, getPerDiemCustomUnits, isUserInvitedToWorkspace} from '@libs/PolicyUtils';
import {getPayeeName} from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {IOURequestType} from '@userActions/IOU';
import {initMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDestination from './step/IOURequestStepDestination';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepPerDiemWorkspace from './step/IOURequestStepPerDiemWorkspace';
import IOURequestStepScan from './step/IOURequestStepScan';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStartPage({
    route,
    route: {
        params: {iouType, reportID},
    },
    navigation,
}: IOURequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldUseTab = iouType !== CONST.IOU.TYPE.SEND && iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.INVOICE;
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [selectedTab = CONST.TAB_REQUEST.SCAN, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const isLoadingSelectedTab = shouldUseTab ? isLoadingOnyxValue(selectedTabResult) : false;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${route?.params.transactionID}`, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [isSwipeDisabled, setSwipeDisabled] = useState(false);
    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) => Object.values(items ?? {}),
        canBeMissing: true,
    });
    const [isMultiScanEnabled, setIsMultiScanEnabled] = useState((optimisticTransactions ?? []).length > 1);

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

    const isFromGlobalCreate = isEmptyObject(report?.reportID);
    const perDiemCustomUnits = getPerDiemCustomUnits(allPolicies, session?.email);
    const doesPerDiemPolicyExist = perDiemCustomUnits.length > 0;
    const moreThanOnePerDiemExist = perDiemCustomUnits.length > 1;
    const currentPolicyPerDiemUnit = getPerDiemCustomUnit(policy);
    const doesCurrentPolicyPerDiemExist = !isEmptyObject(currentPolicyPerDiemUnit) && !!currentPolicyPerDiemUnit.enabled;
    const shouldShowPerDiemOption =
        iouType !== CONST.IOU.TYPE.SPLIT && iouType !== CONST.IOU.TYPE.TRACK && ((!isFromGlobalCreate && doesCurrentPolicyPerDiemExist) || (isFromGlobalCreate && doesPerDiemPolicyExist));

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
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE);
    }, []);

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            if (transaction?.iouRequestType === newIOUType) {
                return;
            }
            setIsMultiScanEnabled(false);
            initMoneyRequest({
                reportID,
                policy,
                isFromGlobalCreate,
                currentIouRequestType: transaction?.iouRequestType,
                newIouRequestType: newIOUType,
            });
        },
        [policy, reportID, isFromGlobalCreate, transaction],
    );

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    useFocusEffect(
        useCallback(() => {
            // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
            if (
                (transaction?.reportID === reportID && iouType !== CONST.IOU.TYPE.CREATE && iouType !== CONST.IOU.TYPE.SUBMIT) ||
                isLoadingSelectedTab ||
                !transactionRequestType ||
                prevTransactionReportID !== transaction?.reportID
            ) {
                return;
            }
            resetIOUTypeIfChanged(transactionRequestType);
        }, [transaction?.reportID, reportID, iouType, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID]),
    );

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const {isBetaEnabled} = usePermissions();
    const setTestReceiptAndNavigateRef = useRef<() => void>();
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP,
        !getIsUserSubmittedExpenseOrScannedReceipt() && isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) && selectedTab === CONST.TAB_REQUEST.SCAN && !isUserInvitedToWorkspace(),
        {
            onConfirm: () => {
                setTestReceiptAndNavigateRef?.current?.();
            },
            onDismiss: () => {
                dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, true);
            },
        },
    );

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
                shouldEnableMinHeight={canUseTouchScreen()}
                headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.receiptDropHeaderGap] : []}
                testID={IOURequestStartPage.displayName}
                focusTrapSettings={{containerElements: focusTrapContainerElements}}
            >
                <DragAndDropProvider
                    setIsDraggingOver={setIsDraggingOver}
                    isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}
                >
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
                                defaultSelectedTab={CONST.TAB_REQUEST.SCAN}
                                onTabSelected={resetIOUTypeIfChanged}
                                tabBar={TabSelector}
                                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                                onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement}
                                shouldShowLabelWhenInactive={!shouldShowPerDiemOption}
                                shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
                                renderProductTrainingTooltip={renderProductTrainingTooltip}
                                lazyLoadEnabled
                                disableSwipe={isSwipeDisabled}
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
                                                setTabSwipeDisabled={setSwipeDisabled}
                                                isMultiScanEnabled={isMultiScanEnabled}
                                                setIsMultiScanEnabled={setIsMultiScanEnabled}
                                            />
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
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
                                {!!shouldShowPerDiemOption && (
                                    <TopTab.Screen name={CONST.TAB_REQUEST.PER_DIEM}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                {moreThanOnePerDiemExist && !doesCurrentPolicyPerDiemExist ? (
                                                    <IOURequestStepPerDiemWorkspace
                                                        route={route}
                                                        navigation={navigation}
                                                    />
                                                ) : (
                                                    <IOURequestStepDestination
                                                        openedFromStartPage
                                                        explicitPolicyID={moreThanOnePerDiemExist ? undefined : perDiemCustomUnits.at(0)?.policyID}
                                                        route={route}
                                                        navigation={navigation}
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

IOURequestStartPage.displayName = 'IOURequestStartPage';

export default IOURequestStartPage;
