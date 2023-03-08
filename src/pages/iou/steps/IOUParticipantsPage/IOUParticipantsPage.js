import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import ONYXKEYS from '../../../../ONYXKEYS';
import IOUParticipantsSplit from './IOUParticipantsSplit';
import IOUParticipantsRequest from './IOUParticipantsRequest';
import styles from '../../../../styles/styles';
import FullScreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';
import avatarPropTypes from '../../../../components/avatarPropTypes';

const propTypes = {
    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** Callback to add participants in IOUModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** Selected participants from IOUModal with login */
    participants: PropTypes.arrayOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        alternateText: PropTypes.string,
        hasDraftComment: PropTypes.bool,
        icons: PropTypes.arrayOf(avatarPropTypes),
        searchText: PropTypes.string,
        text: PropTypes.string,
        keyForList: PropTypes.string,
        isPinned: PropTypes.bool,
        reportID: PropTypes.string,
        phoneNumber: PropTypes.string,
        payPalMeAddress: PropTypes.string,
    })),

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving participants) */
        loading: PropTypes.bool,
    }),

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),
};

const defaultProps = {
    iou: {},
    participants: [],
    safeAreaPaddingBottomStyle: {},
};

const IOUParticipantsPage = (props) => {
    if (props.iou.loading) {
        return (
            <View style={styles.flex1}>
                <FullScreenLoadingIndicator />
            </View>
        );
    }

    return (props.hasMultipleParticipants
        ? (
            <IOUParticipantsSplit
                onStepComplete={props.onStepComplete}
                participants={props.participants}
                onAddParticipants={props.onAddParticipants}
                safeAreaPaddingBottomStyle={props.safeAreaPaddingBottomStyle}
            />
        )
        : (
            <IOUParticipantsRequest
                onStepComplete={props.onStepComplete}
                onAddParticipants={props.onAddParticipants}
                safeAreaPaddingBottomStyle={props.safeAreaPaddingBottomStyle}
            />
        )
    );
};

IOUParticipantsPage.displayName = 'IOUParticipantsPage';
IOUParticipantsPage.propTypes = propTypes;
IOUParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUParticipantsPage);
