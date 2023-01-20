import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Button from '../Button';
import FixedFooter from '../FixedFooter';
import OptionsList from '../OptionsList';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import TextInput from '../TextInput';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import {propTypes as optionsSelectorPropTypes, defaultProps as optionsSelectorDefaultProps} from './optionsSelectorPropTypes';
import setSelection from '../../libs/setSelection';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    ...optionsSelectorPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    ...optionsSelectorDefaultProps,
};

class BaseOptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.updateFocusedIndex = this.updateFocusedIndex.bind(this);
        this.scrollToIndex = this.scrollToIndex.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.relatedTarget = null;

        const allOptions = this.flattenSections();

        let focusedIndex = this.props.shouldTextInputAppearBelowOptions ? allOptions.length : 0;

        const focusedOptionIndex = _.findIndex(allOptions, option => option.text === this.props.focusedValue);

        if (focusedOptionIndex >= 0) {
            focusedIndex = focusedOptionIndex;
        }

        this.state = {
            allOptions,
            focusedIndex,
        };
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
                if (this.props.canSelectMultipleOptions) {
                    this.props.onConfirmSelection();
                    return;
                }

                const focusedOption = this.state.allOptions[this.state.focusedIndex];
                if (!focusedOption) {
                    return;
                }

                this.selectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );

        if (!this.props.autoFocus) {
            return;
        }

        if (this.props.shouldDelayFocus) {
            this.focusTimeout = setTimeout(() => this.textInput.focus(), CONST.ANIMATED_TRANSITION);
        } else {
            this.textInput.focus();
        }

        this.scrollToIndex(this.state.focusedIndex, false);
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(this.props.sections, prevProps.sections)) {
            return;
        }

        const newOptions = this.flattenSections();
        const newFocusedIndex = this.props.selectedOptions.length;
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
            allOptions: newOptions,
            focusedIndex: newFocusedIndex,
        }, () => {
            // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
            if (this.props.selectedOptions.length !== prevProps.selectedOptions.length || this.props.value === '') {
                this.scrollToIndex(0);
                return;
            }

            // Otherwise, scroll to the focused index (as long as it's in range)
            if (this.state.allOptions.length <= this.state.focusedIndex) {
                return;
            }
            this.scrollToIndex(this.state.focusedIndex);
        });
    }

    componentWillUnmount() {
        if (this.focusTimeout) {
            clearTimeout(this.focusTimeout);
        }

        if (this.unsubscribeEnter) {
            this.unsubscribeEnter();
        }

        if (this.unsubscribeCTRLEnter) {
            this.unsubscribeCTRLEnter();
        }
    }

    /**
     * Flattens the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     *
     * @returns {Array<Object>}
     */
    flattenSections() {
        const allOptions = [];
        this.disabledOptionsIndexes = [];
        let index = 0;
        _.each(this.props.sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });
                if (section.isDisabled || option.isDisabled) {
                    this.disabledOptionsIndexes.push(index);
                }
                index += 1;
            });
        });
        return allOptions;
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
     * @param {Boolean} animated
     */
    scrollToIndex(index, animated = true) {
        const option = this.state.allOptions[index];
        if (!this.list || !option) {
            return;
        }

        const itemIndex = option.index;
        const sectionIndex = option.sectionIndex;

        // Note: react-native's SectionList automatically strips out any empty sections.
        // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
        // Otherwise, it will cause an index-out-of-bounds error and crash the app.
        let adjustedSectionIndex = sectionIndex;
        for (let i = 0; i < sectionIndex; i++) {
            if (_.isEmpty(lodashGet(this.props.sections, `[${i}].data`))) {
                adjustedSectionIndex--;
            }
        }

        this.list.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, animated});
    }

    /**
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     */
    selectRow(option, ref) {
        if (this.props.shouldFocusOnSelectRow) {
            if (this.relatedTarget && ref === this.relatedTarget) {
                this.textInput.focus();
                this.relatedTarget = null;
            }
            if (this.textInput.isFocused()) {
                setSelection(this.textInput, 0, this.props.value.length);
            }
        }
        this.props.onSelectRow(option);

        if (!this.props.canSelectMultipleOptions) {
            return;
        }

        // Focus the first unselected item from the list (i.e: the best result according to the current search term)
        this.setState({
            focusedIndex: this.props.selectedOptions.length,
        });
    }

    render() {
        const shouldShowFooter = (this.props.shouldShowConfirmButton || this.props.footerContent)
            && !(this.props.canSelectMultipleOptions && _.isEmpty(this.props.selectedOptions));
        const defaultConfirmButtonText = _.isUndefined(this.props.confirmButtonText)
            ? this.props.translate('common.confirm')
            : this.props.confirmButtonText;
        const shouldShowDefaultConfirmButton = !this.props.footerContent && defaultConfirmButtonText;
        const textInput = (
            <TextInput
                ref={el => this.textInput = el}
                value={this.props.value}
                label={this.props.textInputLabel}
                onChangeText={this.props.onChangeText}
                placeholder={this.props.placeholderText}
                onBlur={(e) => {
                    if (!this.props.shouldFocusOnSelectRow) {
                        return;
                    }
                    this.relatedTarget = e.relatedTarget;
                }}
                selectTextOnFocus
                blurOnSubmit={Boolean(this.state.allOptions.length)}
            />
        );
        const optionsList = this.props.shouldShowOptions ? (
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
                boldStyle={this.props.boldStyle}
                showTitleTooltip={this.props.showTitleTooltip}
                isDisabled={this.props.isDisabled}
                shouldHaveOptionSeparator={this.props.shouldHaveOptionSeparator}
                onLayout={this.props.onLayout}
            />
        ) : <FullScreenLoadingIndicator />;
        return (
            <ArrowKeyFocusManager
                disabledIndexes={this.disabledOptionsIndexes}
                focusedIndex={this.state.focusedIndex}
                maxIndex={this.state.allOptions.length - 1}
                onFocusedIndexChanged={this.props.disableArrowKeysActions ? () => {} : this.updateFocusedIndex}
            >
                <View style={[styles.flex1]}>
                    {
                        this.props.shouldTextInputAppearBelowOptions
                            ? (
                                <>
                                    <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>
                                        {optionsList}
                                    </View>
                                    <View style={[styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0]}>
                                        {textInput}
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.ph5, styles.pv3]}>
                                        {textInput}
                                    </View>
                                    {optionsList}
                                </>
                            )
                    }
                </View>
                {shouldShowFooter && (
                    <FixedFooter>
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

BaseOptionsSelector.defaultProps = defaultProps;
BaseOptionsSelector.propTypes = propTypes;

export default withLocalize(BaseOptionsSelector);
