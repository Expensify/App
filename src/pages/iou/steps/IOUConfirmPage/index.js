import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import IOUConfirmRequest from './IOUConfirmRequest';
import IOUConfirmSplit from './IOUConfirmSplit';

const propTypes = {
    // Callback to inform parent modal of success
    onConfirm: PropTypes.func.isRequired,

    // Selected currency from the user
    selectedCurrency: PropTypes.string.isRequired,

    // Should we request a single or multiple participant selection from user
    hasMultipleParticipants: PropTypes.bool.isRequired,

    // IOU amount
    iouAmount: PropTypes.string.isRequired,

    // optional comment
    comment: PropTypes.string,

    // callback to update comment
    onUpdateComment: PropTypes.func,

    // Selected participants from IOUMOdal with login
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
        reportID: PropTypes.number,
    })).isRequired,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (creating the IOU Report)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
    comment: '',
    onUpdateComment: null,
};

const IOUConfirmPage = props => (props.hasMultipleParticipants
    ? (
        <IOUConfirmSplit
            iouAmount={props.iouAmount}
            onConfirm={props.onConfirm}
            participants={props.participants}
            comment={props.comment}
            selectedCurrency={props.selectedCurrency}
            onUpdateComment={props.onUpdateComment}
        />
    )
    : (
        <IOUConfirmRequest
            iouAmount={props.iouAmount}
            onConfirm={props.onConfirm}
            participants={props.participants}
            comment={props.comment}
            selectedCurrency={props.selectedCurrency}
            onUpdateComment={props.onUpdateComment}
        />
    )
);

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUConfirmPage);
