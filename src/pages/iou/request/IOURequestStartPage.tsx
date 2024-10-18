import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ReportUtils from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {IOURequestType} from '@userActions/IOU';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepScan from './step/IOURequestStepScan';
import type {WithWritableReportOrNotFoundProps} from './step/withWritableReportOrNotFound';

type IOURequestStartPageProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStartPage({
    route,
    route: {
        params: {iouType, reportID},
    },
}: IOURequestStartPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldUseTab = iouType !== CONST.IOU.TYPE.SEND && iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.INVOICE;
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [selectedTab = CONST.TAB_REQUEST.SCAN, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`);
    const isLoadingSelectedTab = shouldUseTab ? isLoadingOnyxValue(selectedTabResult) : false;
    // eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${route?.params.transactionID || -1}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {canUseP2PDistanceRequests, canUseCombinedTrackSubmit} = usePermissions(iouType);

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.submitExpense'),
        [CONST.IOU.TYPE.SUBMIT]: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.submitExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitExpense'),
        [CONST.IOU.TYPE.TRACK]: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.trackExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };
    const transactionRequestType = useMemo(() => (transaction?.iouRequestType ?? shouldUseTab ? selectedTab : CONST.IOU.REQUEST_TYPE.MANUAL), [transaction?.iouRequestType, shouldUseTab, selectedTab]);
    const isFromGlobalCreate = isEmptyObject(report?.reportID);

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID
    useEffect(() => {
        if (transaction?.reportID === reportID || isLoadingSelectedTab) {
            return;
        }
        IOU.initMoneyRequest(reportID, policy, isFromGlobalCreate, transaction?.iouRequestType, transactionRequestType);
    }, [transaction, policy, reportID, iouType, isFromGlobalCreate, transactionRequestType, isLoadingSelectedTab]);

    const isExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isExpenseReport = ReportUtils.isExpenseReport(report);
    const shouldDisplayDistanceRequest =
        !!canUseCombinedTrackSubmit || !!canUseP2PDistanceRequests || isExpenseChat || isExpenseReport || (isFromGlobalCreate && iouType !== CONST.IOU.TYPE.SPLIT);

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIOUType: IOURequestType) => {
            if (transaction?.iouRequestType === newIOUType) {
                return;
            }
            IOU.initMoneyRequest(reportID, policy, isFromGlobalCreate, transaction?.iouRequestType, newIOUType);
        },
        [policy, reportID, isFromGlobalCreate, transaction],
    );

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const focusTrapContainerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

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
                focusTrapSettings={{containerElements: focusTrapContainerElements}}
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

                            {shouldUseTab ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.IOU_REQUEST_TYPE}
                                    defaultSelectedTab={CONST.TAB_REQUEST.SCAN}
                                    onTabSelected={resetIOUTypeIfChanged}
                                    tabBar={TabSelector}
                                    onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                                    onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement}
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

export default IOURequestStartPage;
