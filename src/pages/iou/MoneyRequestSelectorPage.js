import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import NewDistanceRequestPage from './NewDistanceRequestPage';
import ReceiptSelector from './ReceiptSelector';
import NewRequestAmountPage from './steps/NewRequestAmountPage';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Report on which the money request is being created */
    report: reportPropTypes,

    /** Which tab has been selected */
    selectedTab: PropTypes.string,
};

const defaultProps = {
    selectedTab: CONST.TAB.SCAN,
    report: {},
};

function MoneyRequestSelectorPage(props) {
    const styles = useThemeStyles();
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const iouType = lodashGet(props.route, 'params.iouType', '');
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const {translate} = useLocalize();

    const title = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const isFromGlobalCreate = !reportID;
    const isExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isExpenseReport = ReportUtils.isExpenseReport(props.report);
    const shouldDisplayDistanceRequest = isExpenseChat || isExpenseReport || isFromGlobalCreate;

    const resetMoneyRequestInfo = () => {
        const moneyRequestID = `${iouType}${reportID}`;
        IOU.resetMoneyRequestInfo(moneyRequestID);
    };

    // Allow the user to create the request if we are creating the request in global menu or the report can create the request
    const isAllowedToCreateRequest = _.isEmpty(props.report.reportID) || ReportUtils.canCreateRequest(props.report, iouType);
    const prevSelectedTab = usePrevious(props.selectedTab);

    useEffect(() => {
        if (prevSelectedTab === props.selectedTab) {
            return;
        }

        resetMoneyRequestInfo();
        // resetMoneyRequestInfo function is not added as dependencies since they don't change between renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.selectedTab, prevSelectedTab]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            headerGapStyles={isDraggingOver ? [styles.receiptDropHeaderGap] : []}
            testID={MoneyRequestSelectorPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType) || !isAllowedToCreateRequest}>
                    <DragAndDropProvider
                        isDisabled={props.selectedTab !== CONST.TAB.SCAN}
                        setIsDraggingOver={setIsDraggingOver}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={title[iouType]}
                                onBackButtonPress={Navigation.dismissModal}
                            />
                            {iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.SPLIT ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.RECEIPT_TAB_ID}
                                    selectedTab={props.selectedTab}
                                    tabBar={({state, navigation, position}) => (
                                        <TabSelector
                                            state={state}
                                            navigation={navigation}
                                            position={position}
                                        />
                                    )}
                                >
                                    <TopTab.Screen
                                        name={CONST.TAB.MANUAL}
                                        component={NewRequestAmountPage}
                                        initialParams={{reportID, iouType}}
                                    />
                                    <TopTab.Screen
                                        name={CONST.TAB.SCAN}
                                        component={ReceiptSelector}
                                        initialParams={{reportID, iouType, pageIndex: 1}}
                                    />
                                    {shouldDisplayDistanceRequest && (
                                        <TopTab.Screen
                                            name={CONST.TAB.DISTANCE}
                                            component={NewDistanceRequestPage}
                                            initialParams={{reportID, iouType}}
                                        />
                                    )}
                                </OnyxTabNavigator>
                            ) : (
                                <NewRequestAmountPage route={props.route} />
                            )}
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestSelectorPage.propTypes = propTypes;
MoneyRequestSelectorPage.defaultProps = defaultProps;
MoneyRequestSelectorPage.displayName = 'MoneyRequestSelectorPage';

export default compose(
    withReportOrNotFound(false),
    withOnyx({
        selectedTab: {
            key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
        },
    }),
)(MoneyRequestSelectorPage);
