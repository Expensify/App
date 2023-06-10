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
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as IOU from '../../../../libs/actions/IOU';

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        participants: [],
    },
};

function MoneyRequestParticipantsPage(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const navigateToNextStep = () => {
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
    };

    const navigateBack = (forceFallback = false) => {
        Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), forceFallback);
    };

    useEffect(() => {
        const moneyRequestId = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }
        if (props.iou.amount === 0 || shouldReset) {
            navigateBack(shouldReset);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={props.translate('iou.cash')}
                        onBackButtonPress={navigateBack}
                    />
                    {iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT ? (
                        <MoneyRequestParticipantsSplitSelector
                            onStepComplete={navigateToNextStep}
                            participants={props.iou.participants}
                            onAddParticipants={IOU.setMoneyRequestParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    ) : (
                        <MoneyRequestParticipantsSelector
                            onStepComplete={navigateToNextStep}
                            onAddParticipants={IOU.setMoneyRequestParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            iouType={iouType.current}
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

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestParticipantsPage);
