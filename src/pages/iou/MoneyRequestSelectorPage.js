import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import React, {useEffect, useState} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../ONYXKEYS';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import TabSelector from '../../components/TabSelector/TabSelector';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import * as IOUUtils from '../../libs/IOUUtils';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import ReceiptSelector from './ReceiptSelector';
import * as IOU from '../../libs/actions/IOU';
import NewDistanceRequestPage from './NewDistanceRequestPage';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';
import OnyxTabNavigator, {TopTab} from '../../libs/Navigation/OnyxTabNavigator';
import NewRequestAmountPage from './steps/NewRequestAmountPage';
import reportPropTypes from '../reportPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';
import themeColors from '../../styles/themes/default';
import usePrevious from '../../hooks/usePrevious';

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
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const iouType = lodashGet(props.route, 'params.iouType', '');
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const {translate} = useLocalize();

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const isFromGlobalCreate = !reportID;
    const isExpenseRequest = ReportUtils.isPolicyExpenseChat(props.report);
    const shouldDisplayDistanceRequest = isExpenseRequest || isFromGlobalCreate;

    const resetMoneyRequestInfo = () => {
        const moneyRequestID = `${iouType}${reportID}`;
        IOU.resetMoneyRequestInfo(moneyRequestID);
    };

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
            headerGapStyles={
                isDraggingOver
                    ? [
                          {
                              backgroundColor: themeColors.receiptDropUIBG,
                          },
                      ]
                    : []
            }
            testID={MoneyRequestSelectorPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <DragAndDropProvider
                        isDisabled={props.selectedTab !== CONST.TAB.SCAN}
                        setIsDraggingOver={setIsDraggingOver}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={title[iouType]}
                                onBackButtonPress={Navigation.dismissModal}
                            />
                            {iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST ? (
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

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestSelectorPage);
