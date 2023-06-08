import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import MoneyRequestConfirmationList from '../../../components/MoneyRequestConfirmationList';
import CONST from '../../../CONST';
import optionPropTypes from '../../../components/optionPropTypes';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        comment: PropTypes.string,
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    /** Function to navigate to a given step in the parent MoneyRequestModal */
    navigateToStep: PropTypes.func.isRequired,

    /** The policyID of the request */
    policyID: PropTypes.string,

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string.isRequired,
};

const defaultProps = {
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    canModifyParticipants: false,
    policyID: '',
    iou: {
        comment: '',
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};

const MoneyRequestConfirmPage = (props) => (
    <MoneyRequestConfirmationList
        hasMultipleParticipants={props.hasMultipleParticipants}
        participants={props.participants}
        iouAmount={props.iouAmount}
        iouComment={props.iou.comment}
        iouCurrencyCode={props.iou.selectedCurrencyCode}
        onConfirm={props.onConfirm}
        onSendMoney={props.onSendMoney}
        iouType={props.iouType}
        canModifyParticipants={props.canModifyParticipants}
        navigateToStep={props.navigateToStep}
        policyID={props.policyID}
        bankAccountRoute={props.bankAccountRoute}
    />
);

MoneyRequestConfirmPage.displayName = 'MoneyRequestConfirmPage';
MoneyRequestConfirmPage.propTypes = propTypes;
MoneyRequestConfirmPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(MoneyRequestConfirmPage);
