import React from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import IOUConfirmationList from '../../../components/IOUConfirmationList';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    /** Callback to update comment from IOUModal */
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.shape({
        // Currency code for the selected currency
        currencyCode: PropTypes.string,

        // Currency symbol for the selected currency
        currencySymbol: PropTypes.string,
    }).isRequired,

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
        reportID: PropTypes.number,
        participantsList: PropTypes.arrayOf(PropTypes.object),
    })).isRequired,

};

const defaultProps = {
    onUpdateComment: null,
    comment: '',
};

const IOUConfirmPage = props => (
    <Animatable.View animation={props.animation} duration={300}>
    <IOUConfirmationList
        hasMultipleParticipants={props.hasMultipleParticipants}
        participants={props.participants}
        comment={props.comment}
        onUpdateComment={props.onUpdateComment}
        selectedCurrency={props.selectedCurrency}
        iouAmount={props.iouAmount}
        onConfirm={props.onConfirm}
    />
                                            </Animatable.View>

);


IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default IOUConfirmPage;
