import React, {useState, useCallback, useMemo} from 'react';
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
    onConfirm: PropTypes.func,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** IOU comment */
    iouComment: PropTypes.string,

    /** IOU currency */
    iouCurrencyCode: PropTypes.string,

    /** IOU type */
    iouType: PropTypes.string,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** Payee of the money request with login */
    payeePersonalDetails: optionPropTypes,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    /** Should the list be read only, and not editable? */
    isReadOnly: PropTypes.bool,

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** Callback function to navigate to a provided step in the MoneyRequestModal flow */
    navigateToStep: PropTypes.func,

    /** The policyID of the request */
    policyID: PropTypes.string,
};

const defaultProps = {
    onConfirm: () => {},
    onSendMoney: () => {},
    navigateToStep: () => {},
    iou: {
        loading: false,
    },
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    payeePersonalDetails: null,
    canModifyParticipants: false,
    isReadOnly: false,
    bankAccountRoute: '',
    session: {
        email: null,
    },
    policyID: '',
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function MoneyRequestConfirmationList(props) {
    // Destructure functions from props to pass it as a dependecy to useCallback/useMemo hooks.
    // Prop functions pass props itself as a "this" value to the function which means they change every time props change.
    const {translate, onSendMoney, onConfirm} = props;

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList) => {
            const iouAmount = IOUUtils.calculateAmount(participantsList.length, props.iouAmount);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participantsList, CurrencyUtils.convertToDisplayString(iouAmount, props.iouCurrencyCode));
        },
        [props.iouAmount, props.iouCurrencyCode],
    );

    const getFormattedParticipants = () =>
        _.map(getParticipantsWithAmount(props.participants), (participant) => ({
            ...participant,
            selected: true,
        }));

    const [participants, setParticipants] = useState(getFormattedParticipants);
    const [didConfirm, setDidConfirm] = useState(false);

    const splitOrRequestOptions = useMemo(() => {
        const text = translate(props.hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount', {
            amount: CurrencyUtils.convertToDisplayString(props.iouAmount, props.iouCurrencyCode),
        });
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }, [props.hasMultipleParticipants, props.iouAmount, props.iouCurrencyCode, translate]);

    const selectedParticipants = useMemo(() => _.filter(participants, (participant) => participant.selected), [participants]);
    const getParticipantsWithoutAmount = useCallback((participantsList) => _.map(participantsList, (option) => _.omit(option, 'descriptiveText')), []);
    const payeePersonalDetails = useMemo(() => props.payeePersonalDetails || props.currentUserPersonalDetails, [props.payeePersonalDetails, props.currentUserPersonalDetails]);

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = _.filter(participants, (participant) => !participant.selected);
        if (props.hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            const formattedUnselectedParticipants = getParticipantsWithoutAmount(unselectedParticipants);
            const formattedParticipantsList = _.union(formattedSelectedParticipants, formattedUnselectedParticipants);

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, props.iouAmount, true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                payeePersonalDetails,
                CurrencyUtils.convertToDisplayString(myIOUAmount, props.iouCurrencyCode),
            );

            sections.push(
                {
                    title: translate('moneyRequestConfirmationList.whoPaid'),
                    data: [formattedPayeeOption],
                    shouldShow: true,
                    indexOffset: 0,
                },
                {
                    title: translate('moneyRequestConfirmationList.whoWasThere'),
                    data: formattedParticipantsList,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            const formattedParticipantsList = getParticipantsWithoutAmount(props.participants);
            sections.push({
                title: translate('common.to'),
                data: formattedParticipantsList,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }, [
        selectedParticipants,
        getParticipantsWithAmount,
        getParticipantsWithoutAmount,
        props.hasMultipleParticipants,
        props.iouAmount,
        props.iouCurrencyCode,
        props.participants,
        participants,
        translate,
        payeePersonalDetails,
    ]);

    const selectedOptions = useMemo(() => {
        if (!props.hasMultipleParticipants) {
            return [];
        }
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)];
    }, [selectedParticipants, props.hasMultipleParticipants, payeePersonalDetails]);

    /**
     * Toggle selected option's selected prop.
     * @param {Object} option
     */
    const toggleOption = useCallback(
        (option) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === props.session.accountID) {
                return;
            }

            setParticipants((prevParticipants) => {
                const newParticipants = _.map(prevParticipants, (participant) => {
                    if (participant.accountID === option.accountID) {
                        return {...participant, selected: !participant.selected};
                    }
                    return participant;
                });
                return newParticipants;
            });
        },
        [props.session.accountID],
    );

    /**
     * Navigate to profile of selected user
     * @param {Object} option
     */
    const navigateToUserDetail = (option) => {
        if (!option.accountID) {
            return;
        }
        Navigation.navigate(ROUTES.getProfileRoute(option.accountID));
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod) => {
            setDidConfirm(true);

            if (_.isEmpty(selectedParticipants)) {
                return;
            }

            if (props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                onConfirm(selectedParticipants);
            }
        },
        [selectedParticipants, onSendMoney, onConfirm, props.iouType],
    );

    const canModifyParticipants = !props.isReadOnly && props.canModifyParticipants && props.hasMultipleParticipants;
    const formattedAmount = CurrencyUtils.convertToDisplayString(props.iouAmount, props.iouCurrencyCode);

    const footerContent = useMemo(() => {
        if (props.isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;
        const recipient = participants[0];

        return shouldShowSettlementButton ? (
            <SettlementButton
                isDisabled={shouldDisableButton}
                onPress={confirm}
                shouldShowPaypal={Boolean(recipient && recipient.payPalMeAddress)}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={props.bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={props.iouCurrencyCode}
                policyID={props.policyID}
                shouldShowPaymentOptions
            />
        ) : (
            <ButtonWithDropdownMenu
                isDisabled={shouldDisableButton}
                onPress={(_event, value) => confirm(value)}
                options={splitOrRequestOptions}
            />
        );
    }, [confirm, participants, props.bankAccountRoute, props.iouCurrencyCode, props.iouType, props.isReadOnly, props.policyID, selectedParticipants, splitOrRequestOptions]);

    return (
        <OptionsSelector
            sections={optionSelectorSections}
            value=""
            onSelectRow={canModifyParticipants ? toggleOption : navigateToUserDetail}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={canModifyParticipants}
            disableArrowKeysActions={!canModifyParticipants}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
            footerContent={footerContent}
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon={!props.isReadOnly}
                title={formattedAmount}
                description={translate('iou.amount')}
                onPress={() => props.navigateToStep(0)}
                style={[styles.moneyRequestMenuItem, styles.mt2]}
                titleStyle={styles.moneyRequestConfirmationAmount}
                disabled={didConfirm || props.isReadOnly}
            />
            <MenuItemWithTopDescription
                shouldShowRightIcon={!props.isReadOnly}
                title={props.iouComment}
                description={translate('common.description')}
                onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_DESCRIPTION)}
                style={[styles.moneyRequestMenuItem, styles.mb2]}
                disabled={didConfirm || props.isReadOnly}
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
