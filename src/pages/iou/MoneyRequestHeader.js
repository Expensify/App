import _ from 'underscore';
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Tooltip from '../../components/Tooltip';
import CONST from '../../CONST';

const propTypes = {
    currentStepIndex: PropTypes.number.isRequired,
    iouType: PropTypes.oneOf([CONST.IOU.IOU_TYPE.SEND, CONST.IOU.IOU_TYPE.REQUEST]).isRequired,
    hasMultipleParticipants: PropTypes.bool.isRequired,
    amount: PropTypes.string.isRequired,
    navigateToPreviousStep: PropTypes.func.isRequired,
    steps: PropTypes.array.isRequired,
    ...withLocalizePropTypes,
}

const MoneyRequestHeader = (props) => {
    /**
     * Retrieve title for current step, based upon current step and type of IOU
     *
     * @returns {String}
     */
    function getTitleForStep() {
        const isSendingMoney = props.iouType === CONST.IOU.IOU_TYPE.SEND;
        if (props.currentStepIndex === 1 || props.currentStepIndex === 2) {
            const formattedAmount = props.numberFormat(
                props.amount, {
                    style: 'currency',
                    currency: props.iou.selectedCurrencyCode,
                },
            );
            if (isSendingMoney) {
                return props.translate('iou.send', {
                    amount: formattedAmount,
                });
            }
            return props.translate(
                props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                    amount: formattedAmount,
                },
            );
        }
        if (props.currentStepIndex === 0) {
            if (isSendingMoney) {
                return props.translate('iou.sendMoney');
            }
            return props.translate(props.hasMultipleParticipants ? 'iou.splitBill' : 'iou.requestMoney');
        }

        return props.translate(props.steps[props.currentStepIndex]) || '';
    }

    return (
        <View style={[styles.headerBar]}>
            <View style={[
                styles.dFlex,
                styles.flexRow,
                styles.alignItemsCenter,
                styles.flexGrow1,
                styles.justifyContentBetween,
                styles.overflowHidden,
            ]}
            >
                {props.currentStepIndex > 0
                    && (
                    <View style={[styles.mr2]}>
                        <Tooltip text={props.translate('common.back')}>
                            <TouchableOpacity
                                onPress={props.navigateToPreviousStep}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={Expensicons.BackArrow} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                    )}
                <Header title={getTitleForStep()} />
                <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                    <Tooltip text={props.translate('common.close')}>
                        <TouchableOpacity
                            onPress={() => Navigation.dismissModal()}
                            style={[styles.touchableButtonImage]}
                            accessibilityRole="button"
                            accessibilityLabel={props.translate('common.close')}
                        >
                            <Icon src={Expensicons.Close} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>
            </View>
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
export default withLocalize(MoneyRequestHeader);
