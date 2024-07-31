import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {TabSelectorProps} from '@components/TabSelector/TabSelector';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {IOURequestType} from '@userActions/IOU';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report, SelectedTabRequest, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepScan from './step/IOURequestStepScan';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestStartPageOnyxProps = {
    /** The report that holds the transaction */
    report: OnyxEntry<Report>;

    /** The policy tied to the report */
    policy: OnyxEntry<Policy>;

    /** The tab to select by default (whatever the user visited last) */
    selectedTab: OnyxEntry<SelectedTabRequest>;

    /** The transaction being modified */
    transaction: OnyxEntry<Transaction>;

    /** The list of all policies */
    allPolicies: OnyxCollection<Policy>;
};

type IOURequestStartPageProps = IOURequestStartPageOnyxProps & WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStartPage({
    report,
    policy,
    route,
    route: {
        params: {iouType, reportID},
    },
    selectedTab,
    transaction,
    allPolicies,
}: IOURequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.submitExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.submitExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.trackExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
    };
    const transactionRequestType = useRef(TransactionUtils.getRequestType(transaction));
    const {canUseP2PDistanceRequests} = usePermissions(iouType);
    const isFromGlobalCreate = isEmptyObject(report?.reportID);

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID
    useEffect(() => {
        if (transaction?.reportID === reportID) {
            return;
        }
        IOU.initMoneyRequest(reportID, policy, isFromGlobalCreate, transactionRequestType.current);
    }, [transaction, policy, reportID, iouType, isFromGlobalCreate]);

    const isExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isExpenseReport = ReportUtils.isExpenseReport(report);
    const shouldDisplayDistanceRequest = (!!canUseP2PDistanceRequests || isExpenseChat || isExpenseReport || isFromGlobalCreate) && iouType !== CONST.IOU.TYPE.SPLIT;

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            if (transaction?.iouRequestType === newIOUType) {
                return;
            }
            IOU.initMoneyRequest(reportID, policy, isFromGlobalCreate, newIOUType);
        },
        [policy, reportID, isFromGlobalCreate, transaction],
    );

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const onTabFocusTrapContainerElementChanged = useCallback((activeTabElement?: HTMLElement | null) => {
        setActiveTabContainerElement(activeTabElement ?? null);
    }, []);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element);
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const TabSelectorWithFocusTrapInclusion = useCallback(
        (props: TabSelectorProps) => {
            return (
                <FocusTrapContainerElement
                    onContainerElementChanged={setTabBarContainerElement}
                    style={[styles.w100]}
                >
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <TabSelector {...props} />
                </FocusTrapContainerElement>
            );
        },
        [styles],
    );

    if (!transaction?.transactionID) {
        // The draft transaction is initialized only after the component is mounted,
        // which will lead to briefly displaying the Not Found page without this loader.
        return <FullScreenLoadingIndicator />;
    }

    return (
        <AccessOrNotFoundWrapper
            reportID={reportID}
            iouType={iouType}
            policyID={policy?.id}
            accessVariants={[CONST.IOU.ACCESS_VARIANTS.CREATE]}
            allPolicies={allPolicies}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableKeyboardAvoidingView={false}
                shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
                headerGapStyles={isDraggingOver ? [styles.receiptDropHeaderGap] : []}
                testID={IOURequestStartPage.displayName}
                focusTrapSettings={{containerElements: focusTrapContainerElements, focusTrapOptions: {preventScroll: true}}}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDropProvider
                        setIsDraggingOver={setIsDraggingOver}
                        isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <FocusTrapContainerElement
                                onContainerElementChanged={setHeaderWithBackButtonContainerElement}
                                style={[styles.w100]}
                            >
                                <HeaderWithBackButton
                                    title={tabTitles[iouType]}
                                    onBackButtonPress={navigateBack}
                                />
                            </FocusTrapContainerElement>

                            {iouType !== CONST.IOU.TYPE.SEND && iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.INVOICE ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.IOU_REQUEST_TYPE}
                                    onTabSelected={resetIOUTypeIfChanged}
                                    tabBar={TabSelectorWithFocusTrapInclusion}
                                    onTabFocusTrapContainerElementChanged={onTabFocusTrapContainerElementChanged}
                                >
                                    <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                <IOURequestStepAmount
                                                    shouldKeepUserInput
                                                    route={route}
                                                />
                                            </TabScreenWithFocusTrapWrapper>
                                        )}
                                    </TopTab.Screen>
                                    <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>
                                        {() => (
                                            <TabScreenWithFocusTrapWrapper>
                                                <IOURequestStepScan route={route} />
                                            </TabScreenWithFocusTrapWrapper>
                                        )}
                                    </TopTab.Screen>
                                    {shouldDisplayDistanceRequest && (
                                        <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE}>
                                            {() => (
                                                <TabScreenWithFocusTrapWrapper>
                                                    <IOURequestStepDistance route={route} />
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
                                        shouldKeepUserInput
                                    />
                                </FocusTrapContainerElement>
                            )}
                        </View>
                    </DragAndDropProvider>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

IOURequestStartPage.displayName = 'IOURequestStartPage';

export default withOnyx<IOURequestStartPageProps, IOURequestStartPageOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route?.params?.reportID}`,
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${route?.params.transactionID ?? -1}`,
    },
    allPolicies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(IOURequestStartPage);
