import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import OptionsList from './OptionsList';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import CONST from '../CONST';
import styles from '../styles/styles';
import optionPropTypes from './optionPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextInput from './TextInput';
import ArrowKeyFocusManager from './ArrowKeyFocusManager';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    onSelectRow: () => {},
    placeholderText: '',
    selectedOptions: [],
    headerMessage: '',
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    shouldFocusOnSelectRow: false,
};

class OptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.scrollToIndex = this.scrollToIndex.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.selectFocusedIndex = this.selectFocusedIndex.bind(this);
        this.viewableItems = [];
    }

    componentDidMount() {
        if (this.props.shouldDelayFocus) {
            setTimeout(() => this.textInput.focus(), CONST.ANIMATED_TRANSITION);
        } else {
            this.textInput.focus();
        }
    }

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     */
    scrollToIndex(index) {
        const allOptions = OptionsListUtils.flattenSections(this.props.sections);

        const {index: itemIndex, sectionIndex} = allOptions[index];
        if (!this.list) {
            return;
        }

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
     */
    selectRow(option) {
        if (this.props.shouldFocusOnSelectRow) {
            this.textInput.focus();
        }
        this.props.onSelectRow(option);
    }

    /**
     * @param {Number} focusedIndex
     */
    selectFocusedIndex(focusedIndex) {
        const allOptions = OptionsListUtils.flattenSections(this.props.sections);
        this.selectRow(allOptions[focusedIndex]);
        this.scrollToIndex(0);
    }

    render() {
        const allOptions = OptionsListUtils.flattenSections(this.props.sections);
        return (
            <ArrowKeyFocusManager
                listLength={allOptions.length}
                onFocusedIndexChanged={this.scrollToIndex}
                onEnterKeyPressed={this.selectFocusedIndex}
            >
                {({focusedIndex}) => (
                    <View style={[styles.flex1]}>
                        <View style={[styles.ph5, styles.pv3]}>
                            <TextInput
                                ref={el => this.textInput = el}
                                value={this.props.value}
                                onChangeText={this.props.onChangeText}
                                placeholder={this.props.placeholderText
                                    || this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                            />
                        </View>
                        <OptionsList
                            ref={el => this.list = el}
                            optionHoveredStyle={styles.hoveredComponentBG}
                            onSelectRow={this.selectRow}
                            sections={this.props.sections}
                            focusedIndex={focusedIndex}
                            selectedOptions={this.props.selectedOptions}
                            canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                            hideSectionHeaders={this.props.hideSectionHeaders}
                            headerMessage={this.props.headerMessage}
                            hideAdditionalOptionStates={this.props.hideAdditionalOptionStates}
                            forceTextUnreadStyle={this.props.forceTextUnreadStyle}
                            showTitleTooltip={this.props.showTitleTooltip}
                        />
                    </View>
                )}
            </ArrowKeyFocusManager>
        );
    }
}

OptionsSelector.defaultProps = defaultProps;
OptionsSelector.propTypes = propTypes;
export default withLocalize(OptionsSelector);
