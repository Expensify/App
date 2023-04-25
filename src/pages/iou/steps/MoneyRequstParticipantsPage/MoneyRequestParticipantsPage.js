import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import CONST from '../../../../CONST';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSplitSelector from './MoneyRequestParticipantsSplitSelector';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import withMoneyRequest, {moneyRequestPropTypes} from '../../withMoneyRequest';
import ModalHeader from '../../ModalHeader';

const propTypes = {
    ...moneyRequestPropTypes,
};

const MoneyRequestParticipantsPage = (props) => {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const navigateToNextStep = () => {
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
    };

    useEffect(() => {
        props.redirectIfEmpty([props.amount], iouType.current, reportID.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <ModalHeader
                        title={props.translate('iou.cash')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {iouType.current === CONST.IOU.MONEY_REQUEST_TYPE.SPLIT
                        ? (
                            <MoneyRequestParticipantsSplitSelector
                                onStepComplete={navigateToNextStep}
                                participants={props.participants}
                                onAddParticipants={props.setParticipants}
                                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            />
                        )
                        : (
                            <MoneyRequestParticipantsSelector
                                onStepComplete={navigateToNextStep}
                                onAddParticipants={props.setParticipants}
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

export default compose(
    withMoneyRequest,
    withLocalize,
)(MoneyRequestParticipantsPage);
