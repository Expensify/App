import React, {useState, useRef, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '@styles/styles';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import TabSelector from '@components/TabSelector/TabSelector';
import transactionPropTypes from '@components/transactionPropTypes';
import * as IOU from '@userActions/IOU';
import usePrevious from '@hooks/usePrevious';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportPropTypes from '@pages/reportPropTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
import IOURequestStepAmount from './step/IOURequestStepAmount';
import IOURequestStepDistance from './step/IOURequestStepDistance';
import IOURequestStepScan from './step/IOURequestStepScan';
import IOURequestStepRoutePropTypes from './step/IOURequestStepRoutePropTypes';
import * as ReportUtils from '@libs/ReportUtils';

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
        [CONST.IOU.TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const transactionRequestType = useRef(TransactionUtils.getRequestType(transaction));
    const previousIOURequestType = usePrevious(transactionRequestType.current);

    // Clear out the temporary money request when this component is unmounted
    useEffect(
        () => () => {
            IOU.startMoneyRequest_temporaryForRefactor('');
        },
        [],
    );

    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    const iouTypeParamIsInvalid = !_.contains(_.values(CONST.IOU.TYPE), iouType);
    if (iouTypeParamIsInvalid || !canUserPerformWriteAction) {
        return <FullPageNotFoundView shouldShow />;
    }

    const isFromGlobalCreate = _.isEmpty(report.reportID);
    const isExpenseRequest = ReportUtils.isPolicyExpenseChat(report);
    const shouldDisplayDistanceRequest = isExpenseRequest || isFromGlobalCreate;

    const navigateBack = () => {
        Navigation.dismissModal();
    };

    const resetIouTypeIfChanged = (newIouType) => {
        if (newIouType === previousIOURequestType) {
            return;
        }
        IOU.startMoneyRequest_temporaryForRefactor(reportID, newIouType);
        transactionRequestType.current = newIouType;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            headerGapStyles={isDraggingOver ? [styles.receiptDropHeaderGap] : []}
            testID={IOURequestStartPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <DragAndDropProvider setIsDraggingOver={setIsDraggingOver}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={tabTitles[iouType]}
                            onBackButtonPress={navigateBack}
                        />

                        <OnyxTabNavigator
                            id={CONST.TAB.IOU_REQUEST_TYPE}
                            selectedTab={selectedTab || CONST.IOU.REQUEST_TYPE.SCAN}
                            onTabSelected={resetIouTypeIfChanged}
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
            )}
        </ScreenWrapper>
    );
}

IOURequestStartPage.displayName = 'IOURequestStartPage';
IOURequestStartPage.propTypes = propTypes;
IOURequestStartPage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStartPage);
