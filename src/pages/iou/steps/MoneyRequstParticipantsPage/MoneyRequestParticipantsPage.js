import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import CONST from '../../../../CONST';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSplitSelector from './MoneyRequestParticipantsSplitSelector';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import withMoneyRequest, {moneyRequestPropTypes} from '../../withMoneyRequest';
import ModalHeader from '../../ModalHeader';

const propTypes = {
    moneyRequest: moneyRequestPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const MoneyRequestParticipantsPage = (props) => {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const navigateToNextStep = () => {
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
    };

    useEffect(() => {
        props.moneyRequest.redirectIfEmpty([props.moneyRequest.amount], iouType.current, reportID.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <ModalHeader
                        title={props.translate('iou.cash')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT ? (
                        <MoneyRequestParticipantsSplitSelector
                            onStepComplete={navigateToNextStep}
                            participants={props.moneyRequest.participants}
                            onAddParticipants={props.moneyRequest.setParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    ) : (
                        <MoneyRequestParticipantsSelector
                            onStepComplete={navigateToNextStep}
                            onAddParticipants={props.moneyRequest.setParticipants}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            iouType={iouType.current}
                        />
                    )}
                </View>
            )}
        </ScreenWrapper>
    );
};

MoneyRequestParticipantsPage.displayName = 'IOUParticipantsPage';
MoneyRequestParticipantsPage.propTypes = propTypes;

export default compose(withMoneyRequest, withLocalize)(MoneyRequestParticipantsPage);
