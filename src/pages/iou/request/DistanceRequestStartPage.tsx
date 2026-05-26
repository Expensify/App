import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useResetIOUType from '@hooks/useResetIOUType';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {getPayeeName} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
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
        params: {iouType, action, reportID},
    },
    navigation,
    // This is currently only being used for testing
    defaultSelectedTab = CONST.TAB_REQUEST.DISTANCE_MAP,
}: DistanceRequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(route?.params.transactionID)}`);
    const {policy} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID, action, iouType});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const isTrackDistanceExpense = iouType === CONST.IOU.TYPE.TRACK;

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', getPayeeName(report)),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', getPayeeName(report)),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.trackDistance'),
    };

    const transactionRequestType = useMemo(() => {
        if (!transaction?.iouRequestType) {
            return lastDistanceExpenseType ?? selectedTab ?? CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, selectedTab, lastDistanceExpenseType]);

    const resetIOUTypeIfChanged = useResetIOUType({
        reportID,
        report,
        transaction,
        isLoadingSelectedTab,
        transactionRequestType,
        policy,
        isTrackDistanceExpense,
    });

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
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

    return (
        <AccessOrNotFoundWrapper
            reportID={reportID}
            iouType={iouType}
            policyID={policy?.id}
            accessVariants={[CONST.IOU.ACCESS_VARIANTS.CREATE]}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={selectedTab === CONST.TAB_REQUEST.DISTANCE_ODOMETER}
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
                    </OnyxTabNavigator>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DistanceRequestStartPage;
