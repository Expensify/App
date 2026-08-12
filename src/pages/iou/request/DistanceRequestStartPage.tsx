import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultParticipants from '@hooks/useDefaultParticipants';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useResetIOUType from '@hooks/useResetIOUType';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {isCommuterExclusionEnabled} from '@libs/PolicyDistanceRatesUtils';
import {getActivePolicies, isGroupPolicy} from '@libs/PolicyUtils';
import {getPayeeName, isPolicyExpenseChat} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SelectedTabRequest} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

import IOURequestStepDistanceGPS from './step/IOURequestStepDistanceGPS';
import IOURequestStepDistanceManual from './step/IOURequestStepDistanceManual';
import IOURequestStepDistanceMap from './step/IOURequestStepDistanceMap';
import IOURequestStepDistanceOdometer from './step/IOURequestStepDistanceOdometer';

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
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {participants} = useDefaultParticipants({sourceReport: report, transaction, iouType});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const isTrackDistanceExpense = iouType === CONST.IOU.TYPE.TRACK;
    const activeGroupPolicies = getActivePolicies(policies ?? null, currentUserPersonalDetails.login).filter(isGroupPolicy);
    const onlyActivePolicy = activeGroupPolicies.length === 1 ? activeGroupPolicies.at(0) : undefined;
    const targetParticipant = participants.find((participant) => participant.isPolicyExpenseChat);
    const isOnlyWorkspaceTheTarget = onlyActivePolicy?.id === targetParticipant?.policyID;
    let targetPolicy = isOnlyWorkspaceTheTarget ? onlyActivePolicy : undefined;
    if (isPolicyExpenseChat(report)) {
        targetPolicy = policy;
    }
    const shouldHideManualAndOdometerTabs = isCommuterExclusionEnabled(targetPolicy);

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', getPayeeName(report, translate)),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', getPayeeName(report, translate)),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.trackDistance'),
    };

    const transactionRequestType = useMemo(() => {
        if (!transaction?.iouRequestType) {
            // The tab navigator renders whichever tab was last selected, so the draft has to be typed from that
            // same value. Preferring the last-created distance type instead rebuilds the draft as Odometer under
            // a visible Map tab, leaving it without waypoints so tapping one opens the "Not here" page.
            return selectedTab ?? lastDistanceExpenseType ?? CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, selectedTab, lastDistanceExpenseType]);

    const resetIOUTypeIfChanged = useResetIOUType({
        reportID,
        report,
        transaction,
        isLoadingSelectedTab,
        transactionRequestType,
        iouType,
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
            {/* IOURequestStepDistanceOdometer handles keyboard avoidance without resizing the shared tab layout. */}
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
                        // The Odometer tab has text inputs, and Android keeps the keyboard up after the focused input
                        // goes away, so without this the next tab lays out while the keyboard still occupies the screen.
                        shouldDismissKeyboardBeforeTabSwitch
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
                        {!shouldHideManualAndOdometerTabs && (
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
                        )}
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
                        {!shouldHideManualAndOdometerTabs && (
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
