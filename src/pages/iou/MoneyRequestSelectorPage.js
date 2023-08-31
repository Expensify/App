import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import React from 'react';
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
import DistanceRequestPage from './DistanceRequestPage';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';
import usePermissions from '../../hooks/usePermissions';
import OnyxTabNavigator, {TopTab} from '../../libs/Navigation/OnyxTabNavigator';
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

    /** Which tab has been selected */
    selectedTab: PropTypes.string,
};

const defaultProps = {
    selectedTab: CONST.TAB.MANUAL,
};

function MoneyRequestSelectorPage(props) {
    const iouType = lodashGet(props.route, 'params.iouType', '');
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const {translate} = useLocalize();
    const {canUseScanReceipts, canUseDistanceRequests} = usePermissions();

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    const resetMoneyRequestInfo = () => {
        const moneyRequestID = `${iouType}${reportID}`;
        IOU.resetMoneyRequestInfo(moneyRequestID);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <DragAndDropProvider isDisabled={props.selectedTab !== CONST.TAB.SCAN}>
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={title[iouType]}
                                onBackButtonPress={Navigation.dismissModal}
                            />
                            {(canUseScanReceipts || canUseDistanceRequests) && iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.RECEIPT_TAB_ID}
                                    tabBar={({state, navigation, position}) => (
                                        <TabSelector
                                            state={state}
                                            navigation={navigation}
                                            onTabPress={resetMoneyRequestInfo}
                                            position={position}
                                        />
                                    )}
                                >
                                    <TopTab.Screen
                                        name={CONST.TAB.MANUAL}
                                        component={NewRequestAmountPage}
                                        initialParams={{reportID, iouType}}
                                    />
                                    {canUseScanReceipts && (
                                        <TopTab.Screen
                                            name={CONST.TAB.SCAN}
                                            component={ReceiptSelector}
                                            initialParams={{reportID, iouType}}
                                        />
                                    )}
                                    {canUseDistanceRequests && (
                                        <TopTab.Screen
                                            name={CONST.TAB.DISTANCE}
                                            component={DistanceRequestPage}
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
    selectedTab: {
        key: `${ONYXKEYS.SELECTED_TAB}_${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestSelectorPage);
