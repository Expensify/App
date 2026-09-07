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
import {isMapOrGPSRequired} from '@libs/PolicyDistanceRatesUtils';
import {getActivePolicies, isGroupPolicy} from '@libs/PolicyUtils';
import {getPayeeName, isExpenseReport, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
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

import DynamicIOURequestStepDistanceManual from './step/DynamicIOURequestStepDistanceManual';
import IOURequestStepDistanceGPS from './step/IOURequestStepDistanceGPS';
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
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(route?.params.transactionID)}`);
    const {policy} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID, action, iouType});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {participants} = useDefaultParticipants({sourceReport: report, transaction, iouType});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const isTrackDistanceExpense = iouType === CONST.IOU.TYPE.TRACK;
    const activeGroupPolicies = getActivePolicies(policies ?? null, currentUserLogin).filter(isGroupPolicy);
    const onlyActivePolicy = activeGroupPolicies.length === 1 ? activeGroupPolicies.at(0) : undefined;
    const targetParticipant = participants.find((participant) => participant.isPolicyExpenseChat);
    const isOnlyWorkspaceTheTarget = onlyActivePolicy?.id === targetParticipant?.policyID;
    const targetPolicy = isOnlyWorkspaceTheTarget ? onlyActivePolicy : undefined;
    const reportPolicy = report?.policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
    // Manual/Odometer distance produces no mapped route, so hide those tabs whenever the resolved
    // destination restricts distance to maps and GPS:
    // - Report-scoped flows (workspace chat / expense report): use that report's own policy.
    // - Global FAB flows: never hide for a Self-DM target (personal expenses are exempt); otherwise hide
    //   when the single target workspace restricts, or when the user has multiple workspaces that ALL
    //   restrict. `length > 1` is required because a single workspace is handled by `targetPolicy`, and
    //   `[].every()` is vacuously true (which would wrongly hide the tabs for personal-only users).
    const isSelfDMTarget = isSelfDM(report) || participants.some((participant) => participant.isSelfDM);
    const isReportScopedTarget = isPolicyExpenseChat(report) || isExpenseReport(report);
    const isEveryActiveWorkspaceRestricted = activeGroupPolicies.length > 1 && activeGroupPolicies.every(isMapOrGPSRequired);
    const shouldHideManualAndOdometerTabs = isReportScopedTarget
        ? isMapOrGPSRequired(reportPolicy)
        : !isSelfDMTarget && (isMapOrGPSRequired(targetPolicy) || isEveryActiveWorkspaceRestricted);

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.trackDistance'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', getPayeeName(report, translate, currentUserAccountID)),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', getPayeeName(report, translate, currentUserAccountID)),
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
            const rememberedRequestType = selectedTab ?? lastDistanceExpenseType ?? CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;

            // Both of those values are remembered from a previous expense, so they go stale once the destination
            // starts requiring map or GPS. Typing the draft from a tab that is no longer rendered would leave it
            // as Manual or Odometer under a visible Map tab, which later steps then reject.
            if (shouldHideManualAndOdometerTabs && (rememberedRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL || rememberedRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER)) {
                return CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
            }

            return rememberedRequestType;
        }

        return transaction.iouRequestType;
    }, [transaction?.iouRequestType, selectedTab, lastDistanceExpenseType, shouldHideManualAndOdometerTabs]);

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
                        {!shouldHideManualAndOdometerTabs && (
                            <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_MANUAL}>
                                {() => (
                                    <TabScreenWithFocusTrapWrapper>
                                        <DynamicIOURequestStepDistanceManual
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
