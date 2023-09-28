import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSelector from '../../steps/MoneyRequstParticipantsPage/MoneeRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as IOU from '../../../../libs/actions/IOU';
import * as MoneyRequestUtils from '../../../../libs/MoneyRequestUtils';
import useLocalize from '../../../../hooks/useLocalize';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import * as TransactionUtils from '../../../../libs/TransactionUtils';

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

    /* Onyx Props */
    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestFieldParticipants({route, transaction, transaction: {transactionID, reportID, participants}}) {
    const {translate} = useLocalize();
    const prevMoneyRequestId = useRef(transactionID);
    const isNewReportIDSelectedLocally = useRef(false);
    const optionsSelectorRef = useRef();
    const headerTitles = {
        [CONST.IOU.REQUEST_TYPE.DISTANCE]: translate('common.distance'),
        [CONST.IOU.REQUEST_TYPE.MANUAL]: translate('common.manual'),
        // @TODO - figure out if this step is used for scan, and find the correct tanslation for it
        // @TODO - figure out how this component was used in the split flow.
        // @TODO - I can't even find "common.split" in our language file
        [CONST.IOU.REQUEST_TYPE.SCAN]: translate('common.split'),
    };
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = headerTitles[iouRequestType];

    const navigateToRequestStep = (moneyRequestType, option) => {
        if (option.reportID) {
            isNewReportIDSelectedLocally.current = true;
            IOU.setMoneyRequestId(`${moneyRequestType}${option.reportID}`);
            Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(moneyRequestType, option.reportID));
            return;
        }

        IOU.setMoneyRequestId(moneyRequestType);
        Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(moneyRequestType, reportID.current));
    };

    const navigateToSplitStep = (moneyRequestType) => {
        IOU.setMoneyRequestId(moneyRequestType);
        Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(moneyRequestType, reportID.current));
    };

    const navigateBack = (forceFallback = false) => {
        // @TODO figure out this route and where to take them
        Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType.current, reportID.current), forceFallback);
    };

    useEffect(() => {
        // @TODO this whole thing needs cleaned up to work
        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (prevMoneyRequestId.current !== iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing
            if (iou.id && !isDistanceRequest && !isSplitRequest && !isNewReportIDSelectedLocally.current) {
                navigateBack(true);
            }
            return;
        }

        if (!isDistanceRequest && ((iou.amount === 0 && !iou.receiptPath) || shouldReset)) {
            navigateBack(true);
        }

        return () => {
            prevMoneyRequestId.current = iou.id;
        };
    }, [iou.amount, iou.id, iou.receiptPath, isDistanceRequest, isSplitRequest]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
            testID={IOURequestFieldParticipants.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                    />
                    <MoneyRequestParticipantsSelector
                        ref={(el) => (optionsSelectorRef.current = el)}
                        participants={participants}
                        onAddParticipants={(val) => IOU.setMoneeRequestParticipants(transactionID, val)}
                        navigateToRequest={(option) => navigateToRequestStep(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, option)}
                        navigateToSplit={() => navigateToSplitStep(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        iouType={CONST.IOU.TYPE.REQUEST}
                        iouRequestType={iouRequestType}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestFieldParticipants.displayName = 'IOURequestFieldParticipants';
IOURequestFieldParticipants.propTypes = propTypes;
IOURequestFieldParticipants.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestFieldParticipants);
