import React from 'react';
import PropTypes from 'prop-types';
import IOUConfirmationList from '../../../components/IOUConfirmationList';
import CONST from '../../../CONST';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to to parent modal to send money */
    onSendMoney: PropTypes.func.isRequired,

    /** Callback to update comment from IOUModal */
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    /** Selected participants from IOUMOdal with login */
    participants: PropTypes.arrayOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        alternateText: PropTypes.string,
        hasDraftComment: PropTypes.bool,
        icons: PropTypes.arrayOf(PropTypes.string),
        searchText: PropTypes.string,
        text: PropTypes.string,
        keyForList: PropTypes.string,
        isPinned: PropTypes.bool,
        isUnread: PropTypes.bool,
        reportID: PropTypes.string,
        // eslint-disable-next-line react/forbid-prop-types
        participantsList: PropTypes.arrayOf(PropTypes.object),
        payPalMeAddress: PropTypes.string,
        phoneNumber: PropTypes.string,
    })).isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    /** Is this IOU associated with existing report */
    isIOUAttachedToExistingChatReport: PropTypes.bool.isRequired,
};

const defaultProps = {
    onUpdateComment: null,
    comment: '',
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
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
        isIOUAttachedToExistingChatReport={props.isIOUAttachedToExistingChatReport}
    />
);

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default IOUConfirmPage;
