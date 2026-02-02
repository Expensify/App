import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import Performance from '@libs/Performance';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
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
import IOURequestStepDistanceGPS from './step/IOURequestStepDistanceGPS';
import IOURequestStepDistanceManual from './step/IOURequestStepDistanceManual';
import IOURequestStepDistanceMap from './step/IOURequestStepDistanceMap';
import IOURequestStepDistanceOdometer from './step/IOURequestStepDistanceOdometer';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type DistanceRequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
    defaultSelectedTab: SelectedTabRequest;
};

function DistanceRequestStartPage({
    route,
    route: {
        params: {iouType, reportID},
    },
    navigation,
    // This is currently only being used for testing
    defaultSelectedTab = CONST.TAB_REQUEST.DISTANCE_MAP,
}: DistanceRequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, {canBeMissing: true});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(route?.params.transactionID)}`, {canBeMissing: true});
    const [draftTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const showGPSTab = isBetaEnabled(CONST.BETAS.GPS_MILEAGE);

    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(allPolicies), [allPolicies]);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: getPayeeName(report)}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: getPayeeName(report)}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.trackDistance'),
    };

    const isFromGlobalCreate = isEmptyObject(report?.reportID);

    const transactionRequestType = useMemo(() => {
        if (!transaction?.iouRequestType) {
            return lastDistanceExpenseType ?? selectedTab ?? CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, selectedTab, lastDistanceExpenseType]);

    const prevTransactionReportID = usePrevious(transaction?.reportID);

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE);
    }, []);

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            Keyboard.dismiss();
            if (transaction?.iouRequestType === newIOUType) {
                return;
            }
            initMoneyRequest({
                reportID,
                policy,
                personalPolicy,
                isFromGlobalCreate,
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

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    useFocusEffect(
        useCallback(() => {
            // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
            if (transaction?.reportID === reportID || isLoadingSelectedTab || !transactionRequestType || prevTransactionReportID !== transaction?.reportID) {
                return;
            }
            resetIOUTypeIfChanged(transactionRequestType);
        }, [transaction?.reportID, reportID, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID]),
    );

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element);
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

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
                testID="DistanceRequestStartPage"
                focusTrapSettings={{containerElements: focusTrapContainerElements}}
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
                    <OnyxTabNavigator
                        id={CONST.TAB.DISTANCE_REQUEST_TYPE}
                        defaultSelectedTab={defaultSelectedTab}
                        onTabSelected={resetIOUTypeIfChanged}
                        tabBar={TabSelector}
                        onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                        onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement}
                        lazyLoadEnabled
                    >
                        <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_MAP}>
                            {() => (
                                <TabScreenWithFocusTrapWrapper>
                                    <IOURequestStepDistanceMap
                                        route={route}
                                        navigation={navigation}
                                    />
                                </TabScreenWithFocusTrapWrapper>
                            )}
                        </TopTab.Screen>
                        <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_MANUAL}>
                            {() => (
                                <TabScreenWithFocusTrapWrapper>
                                    <IOURequestStepDistanceManual
                                        route={route}
                                        navigation={navigation}
                                    />
                                </TabScreenWithFocusTrapWrapper>
                            )}
                        </TopTab.Screen>
                        {showGPSTab && (
                            <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_GPS}>
                                {() => (
                                    <TabScreenWithFocusTrapWrapper>
                                        <IOURequestStepDistanceGPS
                                            route={route}
                                            navigation={navigation}
                                        />
                                    </TabScreenWithFocusTrapWrapper>
                                )}
                            </TopTab.Screen>
                        )}
                        {false && (
                            <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_ODOMETER}>
                                {() => (
                                    <TabScreenWithFocusTrapWrapper>
                                        <IOURequestStepDistanceOdometer
                                            route={route}
                                            navigation={navigation}
                                        />
                                    </TabScreenWithFocusTrapWrapper>
                                )}
                            </TopTab.Screen>
                        )}
                    </OnyxTabNavigator>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DistanceRequestStartPage;
