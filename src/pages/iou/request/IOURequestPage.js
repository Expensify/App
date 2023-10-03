// TODO: cleanup - file was made from MoneyRequestSelectorPage
import React, {useState} from 'react';
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
import CreateIOUStartTabManual from './create/tab/IOURequestCreateTabManual';
import CreateIOUStartRequest from './create/IOURequestCreate';
import IOURouteContext from '../IOURouteContext';
import reportPropTypes from '../../reportPropTypes';
import transactionPropTypes from '../../../components/transactionPropTypes';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** An optional path to take the user to when the back button is pressed in the header */
            backTo: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** The transaction being modified */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestPage({
    report,
    route,
    route: {
        params: {iouType, backTo},
    },
    transaction,
}) {
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const tabTitles = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    const goBack = () => {
        // TODO: get this working
        if (backTo) {
            Navigation.goBack(backTo, true);
            return;
        }
        Navigation.dismissModal();
    };

    return (
        <IOURouteContext.Provider value={{report, route, transaction}}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableKeyboardAvoidingView={false}
                headerGapStyles={isDraggingOver ? [styles.isDraggingOver] : []}
                testID={IOURequestPage.displayName}
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

                                {iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST ? (
                                    <CreateIOUStartRequest />
                                ) : (
                                    // TODO: see if this is necessary and if there are any routes using it
                                    <CreateIOUStartTabManual />
                                )}
                            </View>
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                )}
            </ScreenWrapper>
        </IOURouteContext.Provider>
    );
}

IOURequestPage.displayName = 'IOURequestPage';
IOURequestPage.propTypes = propTypes;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestPage);
