import React from 'react';
import PropTypes from 'prop-types';
import MoneyRequestConfirmationList from '../../../components/MoneyRequestConfirmationList';
import CONST from '../../../CONST';
import optionPropTypes from '../../../components/optionPropTypes';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Callback to update comment from MoneyRequestModal */
    onUpdateComment: PropTypes.func,

    /** Comment value from MoneyRequestModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,
};

const defaultProps = {
    onUpdateComment: null,
    comment: '',
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    canModifyParticipants: false,
};

const MoneyRequestConfirmPage = props => (
    <MoneyRequestConfirmationList
        hasMultipleParticipants={props.hasMultipleParticipants}
        participants={props.participants}
        comment={props.comment}
        onUpdateComment={props.onUpdateComment}
        iouAmount={props.iouAmount}
        onConfirm={props.onConfirm}
        onSendMoney={props.onSendMoney}
        iouType={props.iouType}
        canModifyParticipants={props.canModifyParticipants}
    />
);

MoneyRequestConfirmPage.displayName = 'IOUConfirmPage';
MoneyRequestConfirmPage.propTypes = propTypes;
MoneyRequestConfirmPage.defaultProps = defaultProps;

export default MoneyRequestConfirmPage;
