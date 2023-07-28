import {withOnyx} from 'react-native-onyx';
import {Animated, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import {compose} from 'underscore';
import {PortalHost} from '@gorhom/portal';
import PropTypes from 'prop-types';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import ONYXKEYS from '../../ONYXKEYS';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import TabSelector from '../../components/TabSelector/TabSelector';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import * as IOUUtils from '../../libs/IOUUtils';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import MoneyRequestAmount from './steps/MoneyRequestAmount';
import ReceiptSelector from './ReceiptSelector';
import DragAndDrop from '../../components/DragAndDrop';
import * as IOU from '../../libs/actions/IOU';
import reportPropTypes from '../reportPropTypes';
import NavigateToNextIOUPage from '../../libs/actions/NavigateToNextIOUPage';
import ReceiptUtils from '../../libs/ReceiptUtils';
import withCurrentReportID from '../../components/withCurrentReportID';
import {resetMoneyRequestAmount} from '../../libs/actions/IOU';
import Tab from '../../libs/actions/Tab';

const TopTab = createMaterialTopTabNavigator();

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

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

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    selectedTab: CONST.TAB.TAB_MANUAL,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function MoneyRequestSelectorPage(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const {translate} = useLocalize();

    const isEditing = useRef(lodashGet(props.route, 'path', '').includes('amount'));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const titleForStep = isEditing.current ? translate('iou.amount') : title[iouType.current];

    const navigateBack = () => {
        Navigation.goBack(isEditing.current ? ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current) : null);
    };

    const onTabPress = (tab) => {
        console.log(`tab: ${tab}`);

        if (tab === CONST.TAB.TAB_SCAN) {
            IOU.resetMoneyRequestAmount();
        } else if (tab === CONST.TAB.TAB_MANUAL) {
            IOU.resetMoneyRequestReceipt();
        }

        Tab.onTabPress(tab);
    };

    return (
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType.current)}>
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <DragAndDrop
                        dropZoneId={CONST.RECEIPT.DROP_NATIVE_ID}
                        activeDropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
                        onDragEnter={() => {
                            setIsDraggingOver(true);
                        }}
                        onDragLeave={() => {
                            setIsDraggingOver(false);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingOver(false);
                            const file = lodashGet(e, ['dataTransfer', 'files', 0]);

                            if (!ReceiptUtils.isValidReceipt(file)) {
                                return;
                            }

                            const filePath = URL.createObjectURL(file);
                            IOU.setMoneyRequestReceipt(filePath, file.name);
                            NavigateToNextIOUPage(props.iou, reportID, props.report, props.currentUserPersonalDetails);
                        }}
                    >
                        <View
                            nativeID={CONST.RECEIPT.DROP_NATIVE_ID}
                            style={[styles.flex1, safeAreaPaddingBottomStyle]}
                        >
                            <HeaderWithBackButton
                                title={titleForStep}
                                onBackButtonPress={navigateBack}
                            />
                            <TopTab.Navigator
                                initialRouteName={props.selectedTab}
                                tabBar={(materialTopBarProps) => (
                                    <TabSelector
                                        {...materialTopBarProps}
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
                            <PortalHost name={CONST.RECEIPT.DROP_HOST_NAME} />
                        </View>
                    </DragAndDrop>
                )}
            </ScreenWrapper>
        </FullPageNotFoundView>
    );
}

MoneyRequestSelectorPage.propTypes = propTypes;
MoneyRequestSelectorPage.defaultProps = defaultProps;
MoneyRequestSelectorPage.displayName = 'MoneyRequestSelectorPage';

export default compose(
    withCurrentUserPersonalDetails,
    withCurrentReportID,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({currentReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`,
        },
        selectedTab: {key: ONYXKEYS.SELECTED_TAB},
    }),
)(MoneyRequestSelectorPage);
