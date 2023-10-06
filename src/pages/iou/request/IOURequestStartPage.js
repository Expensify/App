// TODO: cleanup - file was made from MoneyRequestSelectorPage
import React, {useState, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import DragAndDropProvider from '../../../components/DragAndDrop/Provider';
import * as IOUUtils from '../../../libs/IOUUtils';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import OnyxTabNavigator, {TopTab} from '../../../libs/Navigation/OnyxTabNavigator';
import TabSelector from '../../../components/TabSelector/TabSelector';
import IOURouteContext from '../IOURouteContext';
import reportPropTypes from '../../reportPropTypes';
import transactionPropTypes from '../../../components/transactionPropTypes';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestCreateTabScan from './create/tab/IOURequestCreateTabScan';
import * as IOU from '../../../libs/actions/IOU';
import usePrevious from '../../../hooks/usePrevious';
import * as TransactionUtils from '../../../libs/TransactionUtils';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** The tab to select by default (whatever the user visited last) */
    selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)),

    /** The transaction being modified */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    selectedTab: CONST.TAB_REQUEST.MANUAL,
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
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const tabTitles = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const transactionRequestType = useRef(TransactionUtils.getRequestType(transaction));
    const previousIOURequestType = usePrevious(transactionRequestType.current);

    const goBack = () => {
        Navigation.dismissModal();
    };

    const resetIouTypeIfChanged = (newIouType) => {
        if (newIouType === previousIOURequestType) {
            return;
        }
        IOU.startMoneeRequest(reportID, newIouType);
        transactionRequestType.current = newIouType;
    };

    return (
        <IOURouteContext.Provider value={{report, route, transaction}}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableKeyboardAvoidingView={false}
                headerGapStyles={isDraggingOver ? [styles.isDraggingOver] : []}
                testID={IOURequestStartPage.displayName}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                        <DragAndDropProvider
                            isDisabled={iouType !== CONST.TAB_REQUEST.SCAN}
                            setIsDraggingOver={setIsDraggingOver}
                        >
                            <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                                <HeaderWithBackButton
                                    title={tabTitles[iouType]}
                                    onBackButtonPress={goBack}
                                />

                                <OnyxTabNavigator
                                    id={CONST.TAB.IOU_REQUEST_TYPE}
                                    selectedTab={selectedTab || CONST.IOU.REQUEST_TYPE.MANUAL}
                                    onTabSelected={resetIouTypeIfChanged}
                                    tabBar={({state, navigation, position}) => (
                                        <TabSelector
                                            state={state}
                                            navigation={navigation}
                                            position={position}
                                        />
                                    )}
                                >
                                    <TopTab.Screen
                                        name={CONST.TAB_REQUEST.MANUAL}
                                        component={IOURequestStepAmount}
                                    />
                                    <TopTab.Screen
                                        name={CONST.TAB_REQUEST.SCAN}
                                        // TODO: get rid of this tab and do like amount and distance
                                        component={IOURequestCreateTabScan}
                                    />
                                    <TopTab.Screen
                                        name={CONST.TAB_REQUEST.DISTANCE}
                                        component={IOURequestStepDistance}
                                    />
                                </OnyxTabNavigator>
                            </View>
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                )}
            </ScreenWrapper>
        </IOURouteContext.Provider>
    );
}

IOURequestStartPage.displayName = 'IOURequestStartPage';
IOURequestStartPage.propTypes = propTypes;
IOURequestStartPage.defaultProps = defaultProps;

export default withOnyx({
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`,
    },
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStartPage);
