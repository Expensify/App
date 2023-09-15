import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSplitSelector from './MoneyRequestParticipantsSplitSelector';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as IOU from '../../../../libs/actions/IOU';
import * as MoneyRequestUtils from '../../../../libs/MoneyRequestUtils';
import {iouPropTypes, iouDefaultProps} from '../../propTypes';
import useLocalize from '../../../../hooks/useLocalize';

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
    selectedTab: PropTypes.oneOf([CONST.TAB.DISTANCE, CONST.TAB.MANUAL, CONST.TAB.SCAN]).isRequired,
};

const defaultProps = {
    iou: iouDefaultProps,
};

function MoneyRequestParticipantsPage(props) {
    const {translate} = useLocalize();
    const prevMoneyRequestId = useRef(props.iou.id);
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));
    const isNewReportIDSelectedLocally = useRef(false);
    const optionsSelectorRef = useRef();
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType.current, props.selectedTab);

    const splitNavigateToNextStep = () => {
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
    };

    const moneyRequestNavigateToNextStep = (option) => {
        isNewReportIDSelectedLocally.current = true;

        if (!option.reportID) {
            IOU.setMoneyRequestId(iouType.current);
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));

            return;
        }

        IOU.setMoneyRequestId(`${iouType.current}${option.reportID}`);
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, option.reportID));
    };

    const navigateBack = (forceFallback = false) => {
        Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), forceFallback);
    };

    useEffect(() => {
        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (prevMoneyRequestId.current !== props.iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing
            if (!isNewReportIDSelectedLocally.current && !isDistanceRequest && props.iou.id) {
                navigateBack(true);
            }
            return;
        }

        // Reset the money request Onyx if the ID in Onyx does not match the ID from params
        const moneyRequestId = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestId && !isNewReportIDSelectedLocally.current;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }
        if (!isDistanceRequest && ((props.iou.amount === 0 && !props.iou.receiptPath) || shouldReset)) {
            navigateBack(true);
        }

        return () => {
            prevMoneyRequestId.current = props.iou.id;
        };
    }, [props.iou.amount, props.iou.id, props.iou.receiptPath, isDistanceRequest]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={isDistanceRequest ? translate('common.distance') : translate('iou.cash')}
                        onBackButtonPress={navigateBack}
                    />
                    {iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT ? (
                        <MoneyRequestParticipantsSplitSelector
                            onStepComplete={splitNavigateToNextStep}
                            participants={props.iou.participants}
                            onAddParticipants={IOU.setMoneyRequestParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    ) : (
                        <MoneyRequestParticipantsSelector
                            ref={(el) => (optionsSelectorRef.current = el)}
                            onStepComplete={moneyRequestNavigateToNextStep}
                            onAddParticipants={IOU.setMoneyRequestParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            iouType={iouType.current}
                            isDistanceRequest={isDistanceRequest}
                        />
                    )}
                </View>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestParticipantsPage.displayName = 'IOUParticipantsPage';
MoneyRequestParticipantsPage.propTypes = propTypes;
MoneyRequestParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestParticipantsPage);
