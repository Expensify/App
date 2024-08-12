import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as KeyDownPressListener from '@libs/KeyboardShortcut/KeyDownPressListener';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as IOU from '@userActions/IOU';
import type {IOURequestType} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [selectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`);
    // eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${route?.params.transactionID || -1}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

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

    useFocusEffect(
        useCallback(() => {
            const handler = (event: KeyboardEvent) => {
                if (event.code !== CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            };
            KeyDownPressListener.addKeyDownPressListener(handler);

            return () => KeyDownPressListener.removeKeyDownPressListener(handler);
        }, []),
    );

    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID
    useEffect(() => {
        if (transaction?.reportID === reportID) {
            return;
        }
        IOU.initMoneyRequest(reportID, policy, isFromGlobalCreate, transactionRequestType.current);
    }, [transaction, policy, reportID, iouType, isFromGlobalCreate]);

    const isExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isExpenseReport = ReportUtils.isExpenseReport(report);
    const shouldDisplayDistanceRequest = !!canUseP2PDistanceRequests || isExpenseChat || isExpenseReport || (isFromGlobalCreate && iouType !== CONST.IOU.TYPE.SPLIT);

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
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDropProvider
                        setIsDraggingOver={setIsDraggingOver}
                        isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={tabTitles[iouType]}
                                onBackButtonPress={navigateBack}
                            />
                            {iouType !== CONST.IOU.TYPE.SEND && iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.INVOICE ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.IOU_REQUEST_TYPE}
                                    onTabSelected={resetIOUTypeIfChanged}
                                    tabBar={TabSelector}
                                >
                                    <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>
                                        {() => (
                                            <IOURequestStepAmount
                                                shouldKeepUserInput
                                                route={route}
                                            />
                                        )}
                                    </TopTab.Screen>
                                    <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>{() => <IOURequestStepScan route={route} />}</TopTab.Screen>
                                    {shouldDisplayDistanceRequest && <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE}>{() => <IOURequestStepDistance route={route} />}</TopTab.Screen>}
                                </OnyxTabNavigator>
                            ) : (
                                <IOURequestStepAmount
                                    route={route}
                                    shouldKeepUserInput
                                />
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
