import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, findNodeHandle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from './Button';
import FixedFooter from './FixedFooter';
import OptionsList from './OptionsList';
import Text from './Text';
import compose from '../libs/compose';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import CONST from '../CONST';
import styles from '../styles/styles';
import optionPropTypes from './optionPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextInput from './TextInput';
import ArrowKeyFocusManager from './ArrowKeyFocusManager';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import ONYXKEYS from '../ONYXKEYS';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions  */
    shouldDelayFocus: PropTypes.bool,

    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({
        /** Title of the section */
        title: PropTypes.string,

        /** The initial index of this section given the total number of options in each section's data array */
        indexOffset: PropTypes.number,

        /** Array of options */
        data: PropTypes.arrayOf(optionPropTypes),

        /** Whether this section should show or not */
        shouldShow: PropTypes.bool,
    })).isRequired,

    /** Value in the search input field */
    value: PropTypes.string.isRequired,

    /** Callback fired when text changes */
    onChangeText: PropTypes.func.isRequired,

    /** Label to display for the text input */
    textInputLabel: PropTypes.string,

    /** Optional placeholder text for the selector */
    placeholderText: PropTypes.string,

    /** Options that have already been selected */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Optional header message */
    headerMessage: PropTypes.string,

    /** Whether we can select multiple options */
    canSelectMultipleOptions: PropTypes.bool,

    /** Whether any section headers should be visible */
    hideSectionHeaders: PropTypes.bool,

    /** A flag to indicate whether to show additional optional states, such as pin and draft icons */
    hideAdditionalOptionStates: PropTypes.bool,

    /** Force the text style to be the unread style on all rows */
    forceTextUnreadStyle: PropTypes.bool,

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether to focus the textinput after an option is selected */
    shouldFocusOnSelectRow: PropTypes.bool,

    /** Whether to autofocus the search input on mount */
    autoFocus: PropTypes.bool,

    /** Should a button be shown if a selection is made (only relevant if canSelectMultipleOptions is true) */
    shouldShowConfirmButton: PropTypes.bool,

    /** Text to show in the confirm button (only visible if multiple options are selected) */
    confirmButtonText: PropTypes.string,

    /** True if the maximum number of options have been selected, false otherwise. */
    maxParticipantsReached: PropTypes.bool,

    /** Text to show if the maximum number of participants are reached */
    maxParticipantsReachedMessage: PropTypes.string,

    /** Function to execute if the confirm button is pressed */
    onConfirmSelection: PropTypes.func,

    /** If true, the text input will be below the options in the selector, not above. */
    shouldTextInputAppearBelowOptions: PropTypes.bool,

    /** If true, a message will display in the footer if the app is offline. */
    shouldShowOfflineMessage: PropTypes.bool,

    /** Custom content to display in the footer instead of the default button. */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Hover style for options in the OptionsList */
    optionHoveredStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Whether to show options list */
    shouldShowOptions: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    onSelectRow: () => {},
    textInputLabel: '',
    placeholderText: '',
    selectedOptions: [],
    headerMessage: '',
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    shouldFocusOnSelectRow: false,
    autoFocus: true,
    shouldShowConfirmButton: false,
    confirmButtonText: undefined,
    maxParticipantsReached: false,
    maxParticipantsReachedMessage: undefined,
    onConfirmSelection: () => {},
    shouldTextInputAppearBelowOptions: false,
    shouldShowOfflineMessage: false,
    footerContent: undefined,
    optionHoveredStyle: styles.hoveredComponentBG,
    shouldShowOptions: true,
};

class OptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.updateFocusedIndex = this.updateFocusedIndex.bind(this);
        this.scrollToIndex = this.scrollToIndex.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.relatedTarget = null;

        this.state = {
            allOptions: OptionsListUtils.flattenSections(this.props.sections),
        };
        this.state.focusedIndex = this.props.shouldTextInputAppearBelowOptions ? this.state.allOptions.length : 0;
    }

    componentDidMount() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        this.unsubscribeEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            () => {
                const focusedOption = this.state.allOptions[this.state.focusedIndex];
                if (!focusedOption) {
                    return;
                }

                this.selectRow(focusedOption);

                if (!this.props.canSelectMultipleOptions) {
                    return;
                }

                this.scrollToIndex(0);
            },
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !this.state.allOptions[this.state.focusedIndex],
        );

        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        this.unsubscribeCTRLEnter = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                const focusedOption = this.state.allOptions[this.state.focusedIndex];
                if (!this.canSelectMultipleOptions && !focusedOption) {
                    return;
                }

                this.props.onConfirmSelection(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );

        if (!this.props.autoFocus) {
            return;
        }

        if (this.props.shouldDelayFocus) {
            setTimeout(() => this.textInput.focus(), CONST.ANIMATED_TRANSITION);
        } else {
            this.textInput.focus();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (_.isEqual(this.props.sections, prevProps.sections)) {
            return;
        }

        const newOptions = OptionsListUtils.flattenSections(this.props.sections);
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
            allOptions: newOptions,
        });

        if (this.focusManager && newOptions.length !== lodashGet(prevState, 'allOptions.length')) {
            const newFocusedIndex = this.props.selectedOptions.length;
            this.focusManager.setFocusedIndex(newFocusedIndex);
            if (newOptions.length > newFocusedIndex) {
                this.scrollToIndex(newFocusedIndex);
            }
        }
    }

    componentWillUnmount() {
        if (this.unsubscribeEnter) {
            this.unsubscribeEnter();
        }

        if (this.unsubscribeCTRLEnter) {
            this.unsubscribeCTRLEnter();
        }
    }

    /**
     * @param {Number} index
     */
    updateFocusedIndex(index) {
        this.setState({focusedIndex: index}, () => this.scrollToIndex(index));
    }

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     */
    scrollToIndex(index) {
        const option = this.state.allOptions[index];
        if (!this.list || !option) {
            return;
        }

        const {index: itemIndex, sectionIndex} = option;

        // Note: react-native's SectionList automatically strips out any empty sections.
        // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
        // Otherwise, it will cause an index-out-of-bounds error and crash the app.
        let adjustedSectionIndex = sectionIndex;
        for (let i = 0; i < sectionIndex; i++) {
            if (_.isEmpty(lodashGet(this.props.sections, `[${i}].data`))) {
                adjustedSectionIndex--;
            }
        }

        this.list.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex});
    }

    /**
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     */
    selectRow(option, ref) {
        if (this.props.shouldFocusOnSelectRow) {
            // Input is permanently focused on native platforms, so we always highlight the text inside of it
            this.textInput.setNativeProps({selection: {start: 0, end: this.props.value.length}});
            if (this.relatedTarget && ref === findNodeHandle(this.relatedTarget)) {
                this.textInput.focus();
            }
            this.relatedTarget = null;
        }
        this.props.onSelectRow(option);
    }

    render() {
        const defaultConfirmButtonText = _.isUndefined(this.props.confirmButtonText)
            ? this.props.translate('common.confirm')
            : this.props.confirmButtonText;
        const shouldShowDefaultConfirmButton = !this.props.footerContent && defaultConfirmButtonText;
        const defaultMaxParticipantsReachedMessage = _.isUndefined(this.props.maxParticipantsReachedMessage)
            ? this.props.translate('common.maxParticipantsReached', {count: this.props.selectedOptions.length})
            : this.props.maxParticipantsReachedMessage;
        const shouldShowMaxParticipantsMessage = this.props.maxParticipantsReached && defaultMaxParticipantsReachedMessage;
        const textInput = (
            <TextInput
                ref={el => this.textInput = el}
                value={this.props.value}
                label={this.props.textInputLabel}
                onChangeText={(text) => {
                    if (this.props.shouldFocusOnSelectRow) {
                        this.textInput.setNativeProps({selection: null});
                    }
                    this.props.onChangeText(text);
                }}
                placeholder={this.props.placeholderText || this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                onBlur={(e) => {
                    if (!this.props.shouldFocusOnSelectRow) {
                        return;
                    }
                    this.relatedTarget = e.relatedTarget;
                }}
                selectTextOnFocus
            />
        );
        return (
            <ArrowKeyFocusManager
                focusedIndex={this.state.focusedIndex}
                maxIndex={this.props.canSelectMultipleOptions ? this.state.allOptions.length : this.state.allOptions.length - 1}
                onFocusedIndexChanged={this.updateFocusedIndex}
            >
                <View style={[styles.flex1]}>
                    {this.props.shouldShowOptions
                        ? (
                            <>
                                {!this.props.shouldTextInputAppearBelowOptions && (
                                    <View style={[styles.ph5, styles.pv3]}>
                                        {textInput}
                                    </View>
                                )}
                                <OptionsList
                                    ref={el => this.list = el}
                                    optionHoveredStyle={this.props.optionHoveredStyle}
                                    onSelectRow={this.selectRow}
                                    sections={this.props.sections}
                                    focusedIndex={this.state.focusedIndex}
                                    selectedOptions={this.props.selectedOptions}
                                    canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                                    hideSectionHeaders={this.props.hideSectionHeaders}
                                    headerMessage={this.props.headerMessage}
                                    hideAdditionalOptionStates={this.props.hideAdditionalOptionStates}
                                    forceTextUnreadStyle={this.props.forceTextUnreadStyle}
                                    showTitleTooltip={this.props.showTitleTooltip}
                                />
                                {this.props.shouldTextInputAppearBelowOptions && (
                                    <View style={[styles.ph5, styles.pv5, styles.iouConfirmComment]}>
                                        {textInput}
                                    </View>
                                )}
                            </>
                        )
                        : <FullScreenLoadingIndicator />
                    }
                </View>
                {this.props.shouldShowConfirmButton && !_.isEmpty(this.props.selectedOptions) && (
                    <FixedFooter>
                        {shouldShowMaxParticipantsMessage && (
                            <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mt1, styles.mb3]}>
                                {defaultMaxParticipantsReachedMessage}
                            </Text>
                        )}
                        {!shouldShowMaxParticipantsMessage && this.props.shouldShowOfflineMessage && this.props.network.isOffline && (
                            <Text style={[styles.formError, styles.pb2]}>
                                {this.props.translate('session.offlineMessage')}
                            </Text>
                        )}
                        {shouldShowDefaultConfirmButton && (
                            <Button
                                success
                                style={[styles.w100]}
                                text={defaultConfirmButtonText}
                                onPress={this.props.onConfirmSelection}
                                pressOnEnter
                                enterKeyEventListenerPriority={1}
                            />
                        )}
                        {this.props.footerContent}
                    </FixedFooter>
                )}
            </ArrowKeyFocusManager>
        );
    }
}

OptionsSelector.defaultProps = defaultProps;
OptionsSelector.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(OptionsSelector);
