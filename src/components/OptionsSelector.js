import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import TextInputWithFocusStyles from './TextInputWithFocusStyles';
import OptionsList from './OptionsList';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import optionPropTypes from './optionPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
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

    /** Whether to allow arrow key actions on the list */
    disableArrowKeysActions: PropTypes.bool,

    /** A flag to indicate whether to show additional optional states, such as pin and draft icons */
    hideAdditionalOptionStates: PropTypes.bool,

    /** Force the text style to be the unread style on all rows */
    forceTextUnreadStyle: PropTypes.bool,

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether to focus the textinput after an option is selected */
    shouldFocusOnSelectRow: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onSelectRow: () => {},
    placeholderText: '',
    selectedOptions: [],
    headerMessage: '',
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    disableArrowKeysActions: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    shouldFocusOnSelectRow: false,
};

class OptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.viewableItems = [];

        this.state = {
            focusedIndex: 0,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} sectionIndex
     * @param {Number} itemIndex
     */
    scrollToFocusedIndex(sectionIndex, itemIndex) {
        this.list.scrollToLocation({sectionIndex, itemIndex});
    }

    /**
     * Delegate key presses to specific callbacks
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        // We are mapping over all the options to combine them into a single array and also saving the section index
        // index within that section so we can navigate
        const allOptions = _.reduce(this.props.sections, (options, section, sectionIndex) => (
            [...options, ..._.map(section.data, (option, index) => ({
                ...option,
                index,
                sectionIndex,
            }))]
        ), []);

        if (this.props.disableArrowKeysActions && e.nativeEvent.key.startsWith('Arrow')) {
            return;
        }

        switch (e.nativeEvent.key) {
            case 'Enter': {
                this.selectRow(allOptions[this.state.focusedIndex]);
                e.preventDefault();
                break;
            }

            case 'ArrowDown': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex + 1;

                    // Wrap around to the top of the list
                    if (newFocusedIndex > allOptions.length - 1) {
                        newFocusedIndex = 0;
                    }

                    const {index, sectionIndex} = allOptions[newFocusedIndex];
                    this.scrollToFocusedIndex(sectionIndex, index);
                    return {focusedIndex: newFocusedIndex};
                });


                e.preventDefault();
                break;
            }

            case 'ArrowUp': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex - 1;

                    // Wrap around to the bottom of the list
                    if (newFocusedIndex < 0) {
                        newFocusedIndex = allOptions.length - 1;
                    }

                    const {index, sectionIndex} = allOptions[newFocusedIndex];
                    this.scrollToFocusedIndex(sectionIndex, index);
                    return {focusedIndex: newFocusedIndex};
                });
                e.preventDefault();
                break;
            }

            default:
        }
    }

    /**
     * Completes the follow up actions after a row is selected
     *
     * @param {Object} option
     */
    selectRow(option) {
        if (this.props.shouldFocusOnSelectRow) {
            this.textInput.focus();
        }
        this.props.onSelectRow(option);
    }

    render() {
        return (
            <View style={[styles.flex1]}>
                <View style={[styles.ph5, styles.pv3]}>
                    <TextInputWithFocusStyles
                        styleFocusIn={[styles.textInputReversedFocus]}
                        ref={el => this.textInput = el}
                        style={[styles.textInput]}
                        value={this.props.value}
                        onChangeText={this.props.onChangeText}
                        onKeyPress={this.handleKeyPress}
                        placeholder={this.props.placeholderText
                            || this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                        placeholderTextColor={themeColors.placeholderText}
                    />
                </View>
                <OptionsList
                    ref={el => this.list = el}
                    animation={this.props.animation}
                    optionHoveredStyle={styles.hoveredComponentBG}
                    onSelectRow={this.selectRow}
                    sections={this.props.sections}
                    focusedIndex={this.state.focusedIndex}
                    selectedOptions={this.props.selectedOptions}
                    canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                    hideSectionHeaders={this.props.hideSectionHeaders}
                    headerMessage={this.props.headerMessage}
                    disableFocusOptions={this.props.disableArrowKeysActions}
                    hideAdditionalOptionStates={this.props.hideAdditionalOptionStates}
                    forceTextUnreadStyle={this.props.forceTextUnreadStyle}
                    showTitleTooltip={this.props.showTitleTooltip}
                />
            </View>
        );
    }
}

OptionsSelector.defaultProps = defaultProps;
OptionsSelector.propTypes = propTypes;
export default withLocalize(OptionsSelector);
