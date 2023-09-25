// @TODO cleanup - file was made from MoneyRequestSelectorPage
import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../ONYXKEYS';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import DragAndDropProvider from '../../../components/DragAndDrop/Provider';
import * as IOUUtils from '../../../libs/IOUUtils';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import TabSelector from '../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../libs/Navigation/OnyxTabNavigator';
import CreateIOUStartTabScan from './CreateIOUStartTabScan';
import CreateIOUStartTabManual from './CreateIOUStartTabManual';
import CreateIOUStartTabDistance from './CreateIOUStartTabDistance';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** The optimistic ID of a new transaction that is being created */
            transactionID: PropTypes.string.isRequired,

            /** The ID of a report the transaction is attached to (can be null if the user is starting from the global create) */
            reportID: PropTypes.string,

            /** The ID of the currently selected tab */
            tabName: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)),
        }),
    }).isRequired,

    /* Onyx Props */
    /** Which tab has been selected */
    selectedTab: PropTypes.string,
};

const defaultProps = {
    selectedTab: CONST.TAB_REQUEST.SCAN,
};

function CreateIOUStartPage({route}) {
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const iouType = lodashGet(route, 'params.iouType');
    const tabName = lodashGet(route, 'params.tabName');
    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    // @TODO const isFromGlobalCreate = !reportID;
    // @TODO const isExpenseRequest = ReportUtils.isPolicyExpenseChat(props.report);
    // @TODO const shouldDisplayDistanceRequest = isExpenseRequest || isFromGlobalCreate;
    const shouldDisplayDistanceRequest = true;

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
            testID={CreateIOUStartPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <DragAndDropProvider
                        isDisabled={tabName !== CONST.TAB_REQUEST.SCAN}
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
                                    selectedTab={tabName}
                                    tabBar={({state, navigation, position}) => (
                                        <TabSelector
                                            state={state}
                                            navigation={navigation}
                                            // @TODO onTabPress={resetMoneyRequestInfo}
                                            onTabPress={() => {}}
                                            position={position}
                                        />
                                    )}
                                >
                                    <TopTab.Screen
                                        name={CONST.TAB_REQUEST.MANUAL}
                                        component={CreateIOUStartTabManual}
                                    />
                                    <TopTab.Screen
                                        name={CONST.TAB_REQUEST.SCAN}
                                        component={CreateIOUStartTabScan}
                                    />
                                    {shouldDisplayDistanceRequest && (
                                        <TopTab.Screen
                                            name={CONST.TAB_REQUEST.DISTANCE}
                                            component={CreateIOUStartTabDistance}
                                        />
                                    )}
                                </OnyxTabNavigator>
                            ) : (
                                <CreateIOUStartTabManual />
                            )}
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

CreateIOUStartPage.displayName = 'CreateIOUStartPage';
CreateIOUStartPage.propTypes = propTypes;
CreateIOUStartPage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(CreateIOUStartPage);
