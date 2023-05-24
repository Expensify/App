import React, {Component, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import OptionsSelector from './OptionsSelector';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import CONST from '../CONST';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import optionPropTypes from './optionPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** Callback function to navigate to a provided step in the MoneyRequestModal flow */
    navigateToStep: PropTypes.func.isRequired,

    /** The policyID of the request */
    policyID: PropTypes.string,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    canModifyParticipants: false,
    session: {
        email: null,
    },
    policyID: '',
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function MoneyRequestConfirmationList(props) {
    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithAmount = useCallback(
        (participants) => {
            const iouAmount = IOUUtils.calculateAmount(participants.length, props.iouAmount);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participants, CurrencyUtils.convertToDisplayString(iouAmount, props.iou.selectedCurrencyCode));
        },
        [props.iouAmount, props.iou.selectedCurrencyCode],
    );

    const formattedParticipants = _.map(getParticipantsWithAmount(props.participants), (participant) => ({
        ...participant,
        selected: true,
    }));

    const [participants, setParticipants] = useState(formattedParticipants);
    const [didConfirm, setDidConfirm] = useState(false);

    /**
     * Get the confirmation button options
     * @returns {Array}
     */
    const getSplitOrRequestOptions = useCallback(() => {
        const text = props.translate(props.hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount', {
            amount: CurrencyUtils.convertToDisplayString(props.iouAmount, props.iou.selectedCurrencyCode),
        });
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }, [props.hasMultipleParticipants, props.iouAmount, props.iou.selectedCurrencyCode]);

    /**
     * Get selected participants
     * @returns {Array}
     */
    const getSelectedParticipants = useCallback(() => {
        return _.filter(participants, (participant) => participant.selected);
    }, [participants]);

    /**
     * Get unselected participants
     * @returns {Array}
     */
    const getUnselectedParticipants = useCallback(() => {
        return _.filter(participants, (participant) => !participant.selected);
    }, [participants]);

    /**
     * @TODO: should I use useCallback here???????????????????????????
     * Returns the participants without amount
     *
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithoutAmount = (participants) => {
        return _.map(participants, (option) => _.omit(option, 'descriptiveText'));
    };

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const getSections = useCallback(() => {
        const sections = [];
        if (props.hasMultipleParticipants) {
            const selectedParticipants = getSelectedParticipants();
            const unselectedParticipants = getUnselectedParticipants();

            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            const formattedUnselectedParticipants = getParticipantsWithoutAmount(unselectedParticipants);
            const formattedParticipants = _.union(formattedSelectedParticipants, formattedUnselectedParticipants);

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, props.iouAmount, true);
            const formattedMyPersonalDetails = OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(
                props.currentUserPersonalDetails,
                CurrencyUtils.convertToDisplayString(myIOUAmount, props.iou.selectedCurrencyCode),
            );

            sections.push(
                {
                    title: props.translate('moneyRequestConfirmationList.whoPaid'),
                    data: [formattedMyPersonalDetails],
                    shouldShow: true,
                    indexOffset: 0,
                    isDisabled: true,
                },
                {
                    title: props.translate('moneyRequestConfirmationList.whoWasThere'),
                    data: formattedParticipants,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            const formattedParticipants = getParticipantsWithoutAmount(props.participants);
            sections.push({
                title: props.translate('common.to'),
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }, [props.hasMultipleParticipants, props.iouAmount, props.currentUserPersonalDetails, props.iou.selectedCurrencyCode, props.participants]);

    /**
     * Returns selected options -- there is checkmark for every row in List for split flow
     * @returns {Array}
     */
    const getSelectedOptions = useCallback(() => {
        if (!props.hasMultipleParticipants) {
            return [];
        }
        const selectedParticipants = getSelectedParticipants();
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromMyPersonalDetail(props.currentUserPersonalDetails)];
    }, [props.hasMultipleParticipants, props.currentUserPersonalDetails]);

    /**
     * Toggle selected option's selected prop.
     * @param {Object} option
     */
    const toggleOption = useCallback(
        (option) => {
            // Return early if selected option is currently logged in user.
            if (option.login === props.session.email) {
                return;
            }

            setParticipants((prevParticipants) => {
                const newParticipants = _.map(prevParticipants, (participant) => {
                    if (participant.login === option.login) {
                        return {...participant, selected: !participant.selected};
                    }
                    return participant;
                });
                return newParticipants;
            });
        },
        [props.session.email],
    );

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod) => {
            setDidConfirm(true);

            const selectedParticipants = getSelectedParticipants();
            if (_.isEmpty(selectedParticipants)) {
                return;
            }

            if (props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                props.onSendMoney(paymentMethod);
            } else {
                props.onConfirm(selectedParticipants);
            }
        },
        [getSelectedParticipants, props.iouType, props.onSendMoney, props.onConfirm],
    );

    const selectedParticipants = getSelectedParticipants();
    const shouldShowSettlementButton = props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
    const shouldDisableButton = selectedParticipants.length === 0;
    const recipient = participants[0];
    const canModifyParticipants = props.canModifyParticipants && props.hasMultipleParticipants;
    const formattedAmount = CurrencyUtils.convertToDisplayString(props.iouAmount, props.iou.selectedCurrencyCode);

    return (
        <OptionsSelector
            sections={getSections()}
            value=""
            onSelectRow={canModifyParticipants ? toggleOption : undefined}
            onConfirmSelection={confirm}
            selectedOptions={getSelectedOptions()}
            canSelectMultipleOptions={canModifyParticipants}
            disableArrowKeysActions={!canModifyParticipants}
            isDisabled={!canModifyParticipants}
            boldStyle
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
            footerContent={
                shouldShowSettlementButton ? (
                    <SettlementButton
                        isDisabled={shouldDisableButton}
                        onPress={confirm}
                        shouldShowPaypal={Boolean(recipient.payPalMeAddress)}
                        enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                        addBankAccountRoute={props.bankAccountRoute}
                        addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                        currency={props.iou.selectedCurrencyCode}
                        policyID={props.policyID}
                    />
                ) : (
                    <ButtonWithDropdownMenu
                        isDisabled={shouldDisableButton}
                        onPress={(_event, value) => confirm(value)}
                        options={getSplitOrRequestOptions()}
                    />
                )
            }
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={formattedAmount}
                description={props.translate('iou.amount')}
                onPress={() => props.navigateToStep(0)}
                style={[styles.moneyRequestMenuItem, styles.mt2]}
                titleStyle={styles.moneyRequestConfirmationAmount}
                disabled={didConfirm}
            />
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={props.iou.comment}
                description={props.translate('common.description')}
                onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_DESCRIPTION)}
                style={[styles.moneyRequestMenuItem, styles.mb2]}
                disabled={didConfirm}
            />
        </OptionsSelector>
    );
}

MoneyRequestConfirmationList.propTypes = propTypes;
MoneyRequestConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(MoneyRequestConfirmationList);
