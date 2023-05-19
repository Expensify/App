import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import ONYXKEYS from '../../../../ONYXKEYS';
import MoneyRequestParticipantsSplitSelector from './MoneyRequestParticipantsSplitSelector';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import FullScreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';
import optionPropTypes from '../../../../components/optionPropTypes';

const propTypes = {
    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(optionPropTypes),

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Whether or not the IOU step is loading (retrieving participants) */
        loading: PropTypes.bool,
    }),

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,
};

const defaultProps = {
    iou: {},
    participants: [],
    safeAreaPaddingBottomStyle: {},
};

const MoneyRequestParticipantsPage = (props) => {
    if (props.iou.loading) {
        return (
            <View style={styles.flex1}>
                <FullScreenLoadingIndicator />
            </View>
        );
    }

    return props.hasMultipleParticipants ? (
        <MoneyRequestParticipantsSplitSelector
            onStepComplete={props.onStepComplete}
            participants={props.participants}
            onAddParticipants={props.onAddParticipants}
            safeAreaPaddingBottomStyle={props.safeAreaPaddingBottomStyle}
        />
    ) : (
        <MoneyRequestParticipantsSelector
            onStepComplete={props.onStepComplete}
            onAddParticipants={props.onAddParticipants}
            safeAreaPaddingBottomStyle={props.safeAreaPaddingBottomStyle}
            iouType={props.iouType}
        />
    );
};

MoneyRequestParticipantsPage.displayName = 'IOUParticipantsPage';
MoneyRequestParticipantsPage.propTypes = propTypes;
MoneyRequestParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(MoneyRequestParticipantsPage);
