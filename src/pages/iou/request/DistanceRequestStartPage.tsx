import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import Performance from '@libs/Performance';
import {getPayeeName} from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {IOURequestType} from '@userActions/IOU';
import {initMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import IOURequestStepDistanceManual from './step/IOURequestStepDistanceManual';
import IOURequestStepDistanceMap from './step/IOURequestStepDistanceMap';
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
    const policy = usePolicy(report?.policyID);
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_DISTANCE_REQUEST_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const [transaction, transactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${route?.params.transactionID}`, {canBeMissing: true});
    const isLoadingTransaction = isLoadingOnyxValue(transactionResult);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

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

    const transactionRequestType = useMemo(() => {
        if (!transaction?.iouRequestType) {
            if (selectedTab) {
                return selectedTab;
            }

            return CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, selectedTab]);

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
            if (isLoadingTransaction || transaction?.reportID === reportID || isLoadingSelectedTab || !transactionRequestType || prevTransactionReportID !== transaction?.reportID) {
                return;
            }
            resetIOUTypeIfChanged(transactionRequestType);
        }, [transaction?.reportID, reportID, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID, isLoadingTransaction]),
    );

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element) as HTMLElement[];
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
                testID={DistanceRequestStartPage.displayName}
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
                        id={CONST.TAB.IOU_REQUEST_TYPE}
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
                    </OnyxTabNavigator>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

DistanceRequestStartPage.displayName = 'DistanceRequestStartPage';

export default DistanceRequestStartPage;
