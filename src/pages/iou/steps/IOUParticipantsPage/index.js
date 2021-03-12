
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import IOUParticipantsSplit from './IOUParticipantsSplit';
import IOUParticipantsRequest from './IOUParticipantsRequest';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Should we request a single or multiple participant selection from user
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving participants)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};

const IOUParticipantsPage = (props) => {
    if (props.hasMultipleParticipants) {
        return <IOUParticipantsSplit onStepComplete={props.onStepComplete} />;
    }
    return <IOUParticipantsRequest onStepComplete={props.onStepComplete} />;
};

IOUParticipantsPage.displayName = 'IOUParticipantsPage';
IOUParticipantsPage.propTypes = propTypes;
IOUParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    appStaiouteIOU: {key: ONYXKEYS.IOU},
})(IOUParticipantsPage);
