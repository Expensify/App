import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import ArrowKeyFocusManager from '@components/ArrowKeyFocusManager';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import {Info} from '@components/Icon/Expensicons';
import OptionsList from '@components/OptionsList';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigationFocus from '@components/withNavigationFocus';
import compose from '@libs/compose';
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import setSelection from '@libs/setSelection';
import colors from '@styles/colors';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {defaultProps as optionsSelectorDefaultProps, propTypes as optionsSelectorPropTypes} from './optionsSelectorPropTypes';

const propTypes = {
    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Content container styles for OptionsList */
    contentContainerStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** List container styles for OptionsList */
    listContainerStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** List styles for OptionsList */
    listStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    /** Whether referral CTA should be displayed */
    shouldShowReferralCTA: PropTypes.bool,

    /** Referral content type */
    referralContentType: PropTypes.string,

    ...optionsSelectorPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    shouldShowReferralCTA: false,
    referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND,
    safeAreaPaddingBottomStyle: {},
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    listStyles: [],
    ...optionsSelectorDefaultProps,
};

class BaseOptionsSelector extends Component {
    constructor(props) {
        super(props);

        this.updateFocusedIndex = this.updateFocusedIndex.bind(this);
        this.scrollToIndex = this.scrollToIndex.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.handleReferralModal = this.handleReferralModal.bind(this);
        this.selectFocusedOption = this.selectFocusedOption.bind(this);
        this.addToSelection = this.addToSelection.bind(this);
        this.updateSearchValue = this.updateSearchValue.bind(this);
        this.relatedTarget = null;

        const allOptions = this.flattenSections();
        const focusedIndex = this.getInitiallyFocusedIndex(allOptions);

        this.state = {
            allOptions,
            focusedIndex,
            shouldDisableRowSelection: false,
            shouldShowReferralModal: false,
            errorMessage: '',
        };
    }

    componentDidMount() {
        this.subscribeToKeyboardShortcut();

        if (this.props.isFocused && this.props.autoFocus && this.textInput) {
            this.focusTimeout = setTimeout(() => {
                this.textInput.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        this.scrollToIndex(this.props.selectedOptions.length ? 0 : this.state.focusedIndex, false);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused !== this.props.isFocused) {
            if (this.props.isFocused) {
                this.subscribeToKeyboardShortcut();
            } else {
                this.unSubscribeFromKeyboardShortcut();
            }
        }

        // Screen coming back into focus, for example
        // when doing Cmd+Shift+K, then Cmd+K, then Cmd+Shift+K.
        // Only applies to platforms that support keyboard shortcuts
        if ([CONST.PLATFORM.DESKTOP, CONST.PLATFORM.WEB].includes(getPlatform()) && !prevProps.isFocused && this.props.isFocused && this.props.autoFocus && this.textInput) {
            setTimeout(() => {
                this.textInput.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        if (_.isEqual(this.props.sections, prevProps.sections)) {
            return;
        }

        const newOptions = this.flattenSections();

        if (prevProps.preferredLocale !== this.props.preferredLocale) {
            this.setState({
                allOptions: newOptions,
            });
            return;
        }
        const newFocusedIndex = this.props.selectedOptions.length;
        const isNewFocusedIndex = newFocusedIndex !== this.state.focusedIndex;

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(
            {
                allOptions: newOptions,
                focusedIndex: _.isNumber(this.props.initialFocusedIndex) ? this.props.initialFocusedIndex : newFocusedIndex,
            },
            () => {
                // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
                if (this.props.selectedOptions.length !== prevProps.selectedOptions.length || (!!prevProps.value && !this.props.value)) {
                    this.scrollToIndex(0);
                    return;
                }

                // Otherwise, scroll to the focused index (as long as it's in range)
                if (this.state.allOptions.length <= this.state.focusedIndex || !isNewFocusedIndex) {
                    return;
                }
                this.scrollToIndex(this.state.focusedIndex);
            },
        );
    }

    componentWillUnmount() {
        if (this.focusTimeout) {
            clearTimeout(this.focusTimeout);
        }

        this.unSubscribeFromKeyboardShortcut();
    }

    /**
     * @param {Array<Object>} allOptions
     * @returns {Number}
     */
    getInitiallyFocusedIndex(allOptions) {
        if (_.isNumber(this.props.initialFocusedIndex)) {
            return this.props.initialFocusedIndex;
        }

        if (this.props.selectedOptions.length > 0) {
            return this.props.selectedOptions.length;
        }
        const defaultIndex = this.props.shouldTextInputAppearBelowOptions ? allOptions.length : 0;
        if (_.isUndefined(this.props.initiallyFocusedOptionKey)) {
            return defaultIndex;
        }

        const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === this.props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    }

    updateSearchValue(value) {
        this.setState({
            errorMessage: value.length > this.props.maxLength ? this.props.translate('common.error.characterLimitExceedCounter', {length: value.length, limit: this.props.maxLength}) : '',
        });

        this.props.onChangeText(value);
    }

    handleReferralModal() {
        this.setState((prevState) => ({shouldShowReferralModal: !prevState.shouldShowReferralModal}));
    }

    subscribeToKeyboardShortcut() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        this.unsubscribeEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            this.selectFocusedOption,
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
    }

    unSubscribeFromKeyboardShortcut() {
        if (this.unsubscribeEnter) {
            this.unsubscribeEnter();
        }

        if (this.unsubscribeCTRLEnter) {
            this.unsubscribeCTRLEnter();
        }
    }

    selectFocusedOption() {
        const focusedOption = this.state.allOptions[this.state.focusedIndex];

        if (!focusedOption || !this.props.isFocused) {
            return;
        }

        if (this.props.canSelectMultipleOptions) {
            this.selectRow(focusedOption);
        } else if (!this.state.shouldDisableRowSelection) {
            this.setState({shouldDisableRowSelection: true});

            let result = this.selectRow(focusedOption);
            if (!(result instanceof Promise)) {
                result = Promise.resolve();
            }

            setTimeout(() => {
                result.finally(() => {
                    this.setState({shouldDisableRowSelection: false});
                });
            }, 500);
        }
    }

    focus() {
        if (!this.textInput) {
            return;
        }

        this.textInput.focus();
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
     * @returns {Promise}
     */
    selectRow(option, ref) {
        return new Promise((resolve) => {
            if (this.props.shouldShowTextInput && this.props.shouldPreventDefaultFocusOnSelectRow) {
                if (this.relatedTarget && ref === this.relatedTarget) {
                    this.textInput.focus();
                    this.relatedTarget = null;
                }
                if (this.textInput.isFocused()) {
                    setSelection(this.textInput, 0, this.props.value.length);
                }
            }
            const selectedOption = this.props.onSelectRow(option);
            resolve(selectedOption);

            if (!this.props.canSelectMultipleOptions) {
                return;
            }

            // Focus the first unselected item from the list (i.e: the best result according to the current search term)
            this.setState({
                focusedIndex: this.props.selectedOptions.length,
            });
        });
    }

    /**
     * Completes the follow-up action after clicking on multiple select button
     * @param {Object} option
     */
    addToSelection(option) {
        if (this.props.shouldShowTextInput && this.props.shouldPreventDefaultFocusOnSelectRow) {
            this.textInput.focus();
            if (this.textInput.isFocused()) {
                setSelection(this.textInput, 0, this.props.value.length);
            }
        }
        this.props.onAddToSelection(option);
    }

    render() {
        const shouldShowFooter =
            !this.props.isReadOnly && (this.props.shouldShowConfirmButton || this.props.footerContent) && !(this.props.canSelectMultipleOptions && _.isEmpty(this.props.selectedOptions));
        const defaultConfirmButtonText = _.isUndefined(this.props.confirmButtonText) ? this.props.translate('common.confirm') : this.props.confirmButtonText;
        const shouldShowDefaultConfirmButton = !this.props.footerContent && defaultConfirmButtonText;
        const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : this.props.safeAreaPaddingBottomStyle;
        const textInput = (
            <TextInput
                ref={(el) => (this.textInput = el)}
                value={this.props.value}
                label={this.props.textInputLabel}
                accessibilityLabel={this.props.textInputLabel}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                onChangeText={this.updateSearchValue}
                errorText={this.state.errorMessage}
                onSubmitEditing={this.selectFocusedOption}
                placeholder={this.props.placeholderText}
                maxLength={this.props.maxLength + CONST.ADDITIONAL_ALLOWED_CHARACTERS}
                keyboardType={this.props.keyboardType}
                onBlur={(e) => {
                    if (!this.props.shouldPreventDefaultFocusOnSelectRow) {
                        return;
                    }
                    this.relatedTarget = e.relatedTarget;
                }}
                selectTextOnFocus
                blurOnSubmit={Boolean(this.state.allOptions.length)}
                spellCheck={false}
                shouldInterceptSwipe={this.props.shouldTextInputInterceptSwipe}
                isLoading={this.props.isLoadingNewOptions}
            />
        );
        const optionsList = (
            <OptionsList
                ref={(el) => (this.list = el)}
                optionHoveredStyle={this.props.optionHoveredStyle}
                onSelectRow={this.props.onSelectRow ? this.selectRow : undefined}
                sections={this.props.sections}
                focusedIndex={this.state.focusedIndex}
                selectedOptions={this.props.selectedOptions}
                canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                shouldShowMultipleOptionSelectorAsButton={this.props.shouldShowMultipleOptionSelectorAsButton}
                multipleOptionSelectorButtonText={this.props.multipleOptionSelectorButtonText}
                onAddToSelection={this.addToSelection}
                hideSectionHeaders={this.props.hideSectionHeaders}
                headerMessage={this.state.errorMessage ? '' : this.props.headerMessage}
                boldStyle={this.props.boldStyle}
                showTitleTooltip={this.props.showTitleTooltip}
                isDisabled={this.props.isDisabled}
                shouldHaveOptionSeparator={this.props.shouldHaveOptionSeparator}
                highlightSelectedOptions={this.props.highlightSelectedOptions}
                onLayout={() => {
                    if (this.props.selectedOptions.length === 0) {
                        this.scrollToIndex(this.state.focusedIndex, false);
                    }

                    if (this.props.onLayout) {
                        this.props.onLayout();
                    }
                }}
                contentContainerStyles={[safeAreaPaddingBottomStyle, ...this.props.contentContainerStyles]}
                sectionHeaderStyle={this.props.sectionHeaderStyle}
                listContainerStyles={this.props.listContainerStyles}
                listStyles={this.props.listStyles}
                isLoading={!this.props.shouldShowOptions}
                showScrollIndicator={this.props.showScrollIndicator}
                isRowMultilineSupported={this.props.isRowMultilineSupported}
                isLoadingNewOptions={this.props.isLoadingNewOptions}
                shouldPreventDefaultFocusOnSelectRow={this.props.shouldPreventDefaultFocusOnSelectRow}
                nestedScrollEnabled={this.props.nestedScrollEnabled}
                bounces={!this.props.shouldTextInputAppearBelowOptions || !this.props.shouldAllowScrollingChildren}
            />
        );

        const optionsAndInputsBelowThem = (
            <>
                <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>{optionsList}</View>
                <View style={this.props.shouldUseStyleForChildren ? [styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0] : []}>
                    {this.props.children}
                    {this.props.shouldShowTextInput && textInput}
                </View>
            </>
        );

        return (
            <ArrowKeyFocusManager
                disabledIndexes={this.disabledOptionsIndexes}
                focusedIndex={this.state.focusedIndex}
                maxIndex={this.state.allOptions.length - 1}
                onFocusedIndexChanged={this.props.disableArrowKeysActions ? () => {} : this.updateFocusedIndex}
                shouldResetIndexOnEndReached={false}
            >
                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto]}>
                    {/*
                     * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                     * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                     * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                     */}
                    {this.props.shouldTextInputAppearBelowOptions && this.props.shouldAllowScrollingChildren && (
                        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                            <ScrollView
                                horizontal
                                bounces={false}
                                contentContainerStyle={[styles.flex1, styles.flexColumn]}
                            >
                                {optionsAndInputsBelowThem}
                            </ScrollView>
                        </ScrollView>
                    )}

                    {this.props.shouldTextInputAppearBelowOptions && !this.props.shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                    {!this.props.shouldTextInputAppearBelowOptions && (
                        <>
                            <View style={this.props.shouldUseStyleForChildren ? [styles.ph5, styles.pb3] : []}>
                                {this.props.children}
                                {this.props.shouldShowTextInput && textInput}
                                {Boolean(this.props.textInputAlert) && (
                                    <FormHelpMessage
                                        message={this.props.textInputAlert}
                                        style={[styles.mb3]}
                                        isError={false}
                                    />
                                )}
                            </View>
                            {optionsList}
                        </>
                    )}
                </View>
                {this.props.shouldShowReferralCTA && (
                    <View style={[styles.ph5, styles.pb5, styles.flexShrink0]}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(this.props.referralContentType));
                            }}
                            style={[styles.p5, styles.w100, styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, {gap: 10}]}
                            accessibilityLabel="referral"
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            <Text>
                                {this.props.translate(`referralProgram.${this.props.referralContentType}.buttonText1`)}
                                <Text
                                    color={colors.green400}
                                    style={styles.textStrong}
                                >
                                    {this.props.translate(`referralProgram.${this.props.referralContentType}.buttonText2`)}
                                </Text>
                            </Text>
                            <Icon
                                src={Info}
                                height={20}
                                width={20}
                            />
                        </PressableWithoutFeedback>
                    </View>
                )}

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

export default compose(withLocalize, withNavigationFocus)(BaseOptionsSelector);
