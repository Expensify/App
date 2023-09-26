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
import DragAndDropProvider from '../../../components/DragAndDrop/Provider';
import * as IOUUtils from '../../../libs/IOUUtils';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import CreateIOUStartTabManual from './create/tab/IOURequestCreateTabManual';
import CreateIOUStartRequest from './create/IOURequestCreate';
import transactionPropTypes from '../../../components/transactionPropTypes';

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
            selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)),
        }),
    }).isRequired,

    /* Onyx Props */
    /** The transaction with changes saved to it in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestPage({route, transaction}) {
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const iouType = lodashGet(route, 'params.iouType');
    const selectedTab = lodashGet(route, 'params.selectedTab');
    const tabTitles = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            headerGapStyles={isDraggingOver ? [styles.isDraggingOver] : []}
            testID={IOURequestPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <DragAndDropProvider
                        isDisabled={selectedTab !== CONST.TAB_REQUEST.SCAN}
                        setIsDraggingOver={setIsDraggingOver}
                    >
                        <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                            <HeaderWithBackButton
                                title={tabTitles[iouType]}
                                onBackButtonPress={Navigation.dismissModal}
                            />

                            {iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST ? (
                                <CreateIOUStartRequest
                                    selectedTab={selectedTab}
                                    shouldDisplayDistanceTab={transaction.reportExistsOnServer}
                                    iouType={iouType}
                                />
                            ) : (
                                // @TODO see if this is necessary and if there are any routes using it
                                <CreateIOUStartTabManual />
                            )}
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOURequestPage.displayName = 'IOURequestPage';
IOURequestPage.propTypes = propTypes;
IOURequestPage.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`,
    },
})(IOURequestPage);
