import _ from 'lodash';
import lodashGet from 'lodash/get';
import lodashSize from 'lodash/size';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';

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

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)),

    /** Transaction that stores the distance request data */
    transaction: transactionPropTypes,
};

const defaultProps = {
    iou: iouDefaultProps,
    transaction: {},
    selectedTab: undefined,
};

function MoneyRequestParticipantsPage({iou, selectedTab, route, transaction}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const prevMoneyRequestId = useRef(iou.id);
    const optionsSelectorRef = useRef();
    const iouType = useInitialValue(() => lodashGet(route, 'params.iouType', ''));
    const reportID = useInitialValue(() => lodashGet(route, 'params.reportID', ''));
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType, selectedTab);
    const isSendRequest = iouType === CONST.IOU.TYPE.SEND;
    const isScanRequest = MoneyRequestUtils.isScanRequest(selectedTab);
    const isSplitRequest = iou.id === CONST.IOU.TYPE.SPLIT;
    const [headerTitle, setHeaderTitle] = useState();
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const isInvalidWaypoint = lodashSize(validatedWaypoints) < 2;

    useEffect(() => {
        if (isDistanceRequest) {
            setHeaderTitle(translate('common.distance'));
            return;
        }

        if (isSendRequest) {
            setHeaderTitle(translate('common.send'));
            return;
        }

        if (isScanRequest) {
            setHeaderTitle(translate('tabSelector.scan'));
            return;
        }

        setHeaderTitle(iou.isSplitRequest ? translate('iou.split') : translate('tabSelector.manual'));
    }, [iou.isSplitRequest, isDistanceRequest, translate, isScanRequest, isSendRequest]);

    const navigateToConfirmationStep = (moneyRequestType) => {
        IOU.setMoneyRequestId(moneyRequestType);
        IOU.resetMoneyRequestCategory();
        IOU.resetMoneyRequestTag();
        Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(moneyRequestType, reportID));
    };

    const navigateBack = useCallback((forceFallback = false) => {
        Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID), forceFallback);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- no deps as we use only initial values
    }, []);

    useEffect(() => {
        const isInvalidDistanceRequest = !isDistanceRequest || isInvalidWaypoint;

        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (prevMoneyRequestId.current !== iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing
            if (iou.id && isInvalidDistanceRequest && !isSplitRequest) {
                navigateBack(true);
            }
            return;
        }

        // Reset the money request Onyx if the ID in Onyx does not match the ID from params
        const moneyRequestId = `${iouType}${reportID}`;
        const shouldReset = iou.id !== moneyRequestId && !_.isEmpty(reportID);
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }
        if (isInvalidDistanceRequest && ((iou.amount === 0 && !iou.receiptPath) || shouldReset)) {
            navigateBack(true);
        }

        return () => {
            prevMoneyRequestId.current = iou.id;
        };
    }, [iou.amount, iou.id, iou.receiptPath, isDistanceRequest, isSplitRequest, iouType, reportID, navigateBack, isInvalidWaypoint]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
            testID={MoneyRequestParticipantsPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                    />
                    <MoneyRequestParticipantsSelector
                        ref={(el) => (optionsSelectorRef.current = el)}
                        participants={iou.isSplitRequest ? iou.participants : []}
                        onAddParticipants={IOU.setMoneyRequestParticipants}
                        navigateToRequest={() => navigateToConfirmationStep(iouType)}
                        navigateToSplit={() => navigateToConfirmationStep(CONST.IOU.TYPE.SPLIT)}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        iouType={iouType}
                        isDistanceRequest={isDistanceRequest}
                        isScanRequest={isScanRequest}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestParticipantsPage.displayName = 'MoneyRequestParticipantsPage';
MoneyRequestParticipantsPage.propTypes = propTypes;
MoneyRequestParticipantsPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
        selectedTab: {
            key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        transaction: {
            key: ({iou}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(iou, 'transactionID', 0)}`,
        },
    }),
)(MoneyRequestParticipantsPage);
