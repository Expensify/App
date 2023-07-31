import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import React, {useRef} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
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
import Tab from '../../libs/actions/Tab';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';

const TopTab = createMaterialTopTabNavigator();

const propTypes = {
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
    selectedTab: CONST.TAB.TAB_MANUAL,
};

function MoneyRequestSelectorPage(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const {translate} = useLocalize();

    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    const onTabPress = (tab) => {
        const moneyRequestID = `${iouType.current}${reportID.current}`;
        IOU.resetMoneyRequestInfo(moneyRequestID, iouType.current);
        Tab.setSelectedTab(tab);
    };

    return (
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType.current)}>
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDropProvider isDisabled={props.selectedTab === CONST.TAB.TAB_MANUAL}>
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={title[iouType.current]}
                                onBackButtonPress={() => Navigation.goBack()}
                            />
                            <TopTab.Navigator
                                initialRouteName={props.selectedTab}
                                backBehavior="order"
                                tabBar={({state, navigation}) => (
                                    <TabSelector
                                        state={state}
                                        navigation={navigation}
                                        onTabPress={onTabPress}
                                    />
                                )}
                            >
                                <TopTab.Screen
                                    name={CONST.TAB.TAB_MANUAL}
                                    component={MoneyRequestAmount}
                                />
                                <TopTab.Screen
                                    name={CONST.TAB.TAB_SCAN}
                                    component={ReceiptSelector}
                                />
                            </TopTab.Navigator>
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
    iou: {key: ONYXKEYS.IOU},
    selectedTab: {key: ONYXKEYS.SELECTED_TAB},
})(MoneyRequestSelectorPage);
