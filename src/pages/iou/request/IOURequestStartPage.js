import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepRoutePropTypes from './step/IOURequestStepRoutePropTypes';
import IOURequestStepScan from './step/IOURequestStepScan';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that holds the transaction */
    report: reportPropTypes,

    /** The tab to select by default (whatever the user visited last) */
    selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)),

    /** The transaction being modified */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    selectedTab: CONST.TAB_REQUEST.SCAN,
    transaction: {},
};

function IOURequestStartPage({
    report,
    route,
    route: {
        params: {iouType, reportID},
    },
    selectedTab,
    transaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const transactionRequestType = useRef(TransactionUtils.getRequestType(transaction));
    const previousIOURequestType = usePrevious(transactionRequestType.current);
    const isFromGlobalCreate = _.isEmpty(report.reportID);

    // Clear out the temporary money request when this component is unmounted
    useEffect(
        () => () => {
            IOU.clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        },
        [reportID],
    );

    // Clear out the temporary money request if the reportID in the URL has changed from the transaction's reportID
    useEffect(() => {
        if (transaction.reportID === reportID) {
            return;
        }
        IOU.startMoneyRequest_temporaryForRefactor(reportID, isFromGlobalCreate, transactionRequestType.current);
    }, [transaction, reportID, iouType, isFromGlobalCreate]);

    const isExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isExpenseReport = ReportUtils.isExpenseReport(report);
    const shouldDisplayDistanceRequest = isExpenseChat || isExpenseReport || isFromGlobalCreate;

    // Allow the user to create the request if we are creating the request in global menu or the report can create the request
    const isAllowedToCreateRequest = _.isEmpty(report.reportID) || ReportUtils.canCreateRequest(report, iouType);

    const navigateBack = () => {
        Navigation.dismissModal();
    };

    const resetIOUTypeIfChanged = useCallback(
        (newIouType) => {
            if (newIouType === previousIOURequestType) {
                return;
            }
            IOU.startMoneyRequest_temporaryForRefactor(reportID, isFromGlobalCreate, newIouType);
            transactionRequestType.current = newIouType;
        },
        [previousIOURequestType, reportID, isFromGlobalCreate],
    );

    if (!transaction.transactionID) {
        // The draft transaction is initialized only after the component is mounted,
        // which will lead to briefly displaying the Not Found page without this loader.
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            headerGapStyles={isDraggingOver ? [styles.receiptDropHeaderGap] : []}
            testID={IOURequestStartPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType) || !isAllowedToCreateRequest}>
                    <DragAndDropProvider
                        setIsDraggingOver={setIsDraggingOver}
                        isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={tabTitles[iouType]}
                                onBackButtonPress={navigateBack}
                            />
                            <OnyxTabNavigator
                                id={CONST.TAB.IOU_REQUEST_TYPE}
                                selectedTab={selectedTab || CONST.IOU.REQUEST_TYPE.SCAN}
                                onTabSelected={resetIOUTypeIfChanged}
                                tabBar={({state, navigation, position}) => (
                                    <TabSelector
                                        state={state}
                                        navigation={navigation}
                                        position={position}
                                    />
                                )}
                            >
                                <TopTab.Screen name={CONST.TAB_REQUEST.MANUAL}>{() => <IOURequestStepAmount route={route} />}</TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB_REQUEST.SCAN}>{() => <IOURequestStepScan route={route} />}</TopTab.Screen>
                                {shouldDisplayDistanceRequest && <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE}>{() => <IOURequestStepDistance route={route} />}</TopTab.Screen>}
                            </OnyxTabNavigator>
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOURequestStartPage.displayName = 'IOURequestStartPage';
IOURequestStartPage.propTypes = propTypes;
IOURequestStartPage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStartPage);
