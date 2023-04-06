import React from 'react';
import PropTypes from 'prop-types';
import IOUConfirmationList from '../../../components/IOUConfirmationList';
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
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
    canModifyParticipants: false,
};

const IOUConfirmPage = props => (
    <IOUConfirmationList
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

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default IOUConfirmPage;
