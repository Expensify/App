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
import MoneyRequestAmount from './steps/MoneyRequestAmount';
import ReceiptSelector from './ReceiptSelector';
import * as IOU from '../../libs/actions/IOU';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';
import usePermissions from '../../hooks/usePermissions';
import OnyxTabNavigator, {TopTab} from '../../libs/Navigation/OnyxTabNavigator';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),

    /** Which tab has been selected */
    selectedTab: PropTypes.string,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    selectedTab: CONST.TAB.MANUAL,
};

function MoneyRequestSelectorPage(props) {
    const iouType = lodashGet(props.route, 'params.iouType', '');
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const {translate} = useLocalize();
    const {canUseScanReceipts} = usePermissions();

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
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDropProvider isDisabled={props.selectedTab === CONST.TAB.MANUAL}>
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={title[iouType]}
                                onBackButtonPress={Navigation.dismissModal}
                            />
                            {canUseScanReceipts ? (
                                <OnyxTabNavigator
                                    id={CONST.TAB.RECEIPT_TAB_ID}
                                    tabBar={({state, navigation}) => (
                                        <TabSelector
                                            state={state}
                                            navigation={navigation}
                                            onTabPress={resetMoneyRequestInfo}
                                        />
                                    )}
                                >
                                    <TopTab.Screen
                                        name={CONST.TAB.MANUAL}
                                        component={MoneyRequestAmount}
                                        initialParams={{reportID, iouType}}
                                    />
                                    <TopTab.Screen
                                        name={CONST.TAB.SCAN}
                                        component={ReceiptSelector}
                                        initialParams={{reportID, iouType}}
                                    />
                                </OnyxTabNavigator>
                            ) : (
                                <MoneyRequestAmount />
                            )}
                        </View>
                    </DragAndDropProvider>
                )}
            </ScreenWrapper>
        </FullPageNotFoundView>
    );
}

MoneyRequestSelectorPage.propTypes = propTypes;
MoneyRequestSelectorPage.defaultProps = defaultProps;
MoneyRequestSelectorPage.displayName = 'MoneyRequestSelectorPage';

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.SELECTED_TAB}_${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestSelectorPage);
