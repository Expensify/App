import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import ButtonWithLoader from '../../../../components/ButtonWithLoader';
import themeColors from '../../../../styles/themes/default';
import {getDisplayOptionsFromParticipants} from '../../../../libs/OptionsListUtils';
import OptionsList from '../../../../components/OptionsList';

const propTypes = {
    // Callback to inform parent modal of success
    onConfirm: PropTypes.func.isRequired,

    // IOU amount
    iouAmount: PropTypes.string.isRequired,

    // callback to update comment from IOUModal
    onUpdateComment: PropTypes.func,

    // Selected currency from the user
    // remove eslint disable after currency symbol is available
    // eslint-disable-next-line react/no-unused-prop-types
    selectedCurrency: PropTypes.string.isRequired,

    // comment value from IOUModal
    comment: PropTypes.string,

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
        participantsList: PropTypes.arrayOf(PropTypes.object),
    })).isRequired,

    /* Onyx Props */

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatar: PropTypes.string,
    }).isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (creating the IOU Report)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
    onUpdateComment: null,
    comment: '',
};

class IOUConfirmRequestPage extends Component {
    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections() {
        const sections = [];

        // $ should be replaced by currency symbol once available
        const formattedParticipants = getDisplayOptionsFromParticipants(this.props.participants,
            `$${this.props.iouAmount}`);

        sections.push({
            title: 'TO',
            data: formattedParticipants,
            shouldShow: true,
            indexOffset: 0,
        });
        return sections;
    }

    render() {
        const sections = this.getSections();
        return (
            <View style={[styles.flex1, styles.w100, styles.justifyContentBetween]}>
                <View>
                    <OptionsList
                        sections={sections}
                        disableArrowKeysActions
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                        disableFocusOptions
                    />
                    <View>
                        <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                            WHAT&apos;S IT FOR?
                        </Text>
                    </View>
                    <View style={[styles.ph5]}>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.props.comment}
                            onChangeText={this.props.onUpdateComment}
                            placeholder="Optional"
                            placeholderTextColor={themeColors.placeholderText}
                        />
                    </View>
                </View>
                <View style={[styles.ph5, styles.pb3]}>
                    <ButtonWithLoader
                        isLoading={this.props.iou.loading}
                        text={`Request $${this.props.iouAmount}`}
                        onClick={() => this.props.onConfirm({
                            debtorEmail: this.props.participants[0].login,
                        })}
                    />
                </View>
            </View>
        );
    }
}

IOUConfirmRequestPage.displayName = 'IOUConfirmRequestPage';
IOUConfirmRequestPage.propTypes = propTypes;
IOUConfirmRequestPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    myPersonalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(IOUConfirmRequestPage);
