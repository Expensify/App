import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
<<<<<<< HEAD
import useLocalize from '@hooks/useLocalize';
=======
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigationFocus from '@components/withNavigationFocus';
import withTheme, {withThemePropTypes} from '@components/withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import setSelection from '@libs/setSelection';
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

<<<<<<< HEAD
    ...optionsSelectorPropTypes,
=======
    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    /** Whether referral CTA should be displayed */
    shouldShowReferralCTA: PropTypes.bool,

    /** Referral content type */
    referralContentType: PropTypes.string,

    ...optionsSelectorPropTypes,
    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7
};

const defaultProps = {
    shouldDelayFocus: false,
    shouldShowReferralCTA: false,
    referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND,
    safeAreaPaddingBottomStyle: {},
    contentContainerStyles: [],
    listContainerStyles: undefined,
    listStyles: [],
    ...optionsSelectorDefaultProps,
};

<<<<<<< HEAD
const BaseOptionsSelector = (props) => {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
=======
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
        this.incrementPage = this.incrementPage.bind(this);
        this.sliceSections = this.sliceSections.bind(this);
        this.calculateAllVisibleOptionsCount = this.calculateAllVisibleOptionsCount.bind(this);
        this.relatedTarget = null;

        const allOptions = this.flattenSections();
        const sections = this.sliceSections();
        const focusedIndex = this.getInitiallyFocusedIndex(allOptions);

        this.state = {
            sections,
            allOptions,
            focusedIndex,
            shouldDisableRowSelection: false,
            shouldShowReferralModal: false,
            errorMessage: '',
            paginationPage: 1,
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

    componentDidUpdate(prevProps, prevState) {
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

        if (prevState.paginationPage !== this.state.paginationPage) {
            const newSections = this.sliceSections();

            this.setState({
                sections: newSections,
            });
        }

        if (_.isEqual(this.props.sections, prevProps.sections)) {
            return;
        }

        const newSections = this.sliceSections();
        const newOptions = this.flattenSections();

        if (prevProps.preferredLocale !== this.props.preferredLocale) {
            this.setState({
                sections: newSections,
                allOptions: newOptions,
            });
            return;
        }
        const newFocusedIndex = this.props.selectedOptions.length;
        const isNewFocusedIndex = newFocusedIndex !== this.state.focusedIndex;

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(
            {
                sections: newSections,
                allOptions: newOptions,
                focusedIndex: _.isNumber(this.props.focusedIndex) ? this.props.focusedIndex : newFocusedIndex,
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
        let defaultIndex;
        if (this.props.shouldTextInputAppearBelowOptions) {
            defaultIndex = allOptions.length;
        } else if (this.props.focusedIndex >= 0) {
            defaultIndex = this.props.focusedIndex;
        } else {
            defaultIndex = this.props.selectedOptions.length;
        }
        if (_.isUndefined(this.props.initiallyFocusedOptionKey)) {
            return defaultIndex;
        }

        const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === this.props.initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    }

    /**
     * Maps sections to render only allowed count of them per section.
     *
     * @returns {Objects[]}
     */
    sliceSections() {
        return _.map(this.props.sections, (section) => {
            if (_.isEmpty(section.data)) {
                return section;
            }

            return {
                ...section,
                data: section.data.slice(0, CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * lodashGet(this.state, 'paginationPage', 1)),
            };
        });
    }

    /**
     * Calculates all currently visible options based on the sections that are currently being shown
     * and the number of items of those sections.
     *
     * @returns {Number}
     */
    calculateAllVisibleOptionsCount() {
        let count = 0;

        _.forEach(this.state.sections, (section) => {
            count += lodashGet(section, 'data.length', 0);
        });

        return count;
    }

    updateSearchValue(value) {
        this.setState({
            paginationPage: 1,
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
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7

    /**
     * Flattens the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     *
     * @returns {Array<Object>}
     */
    const flattenSections = () => {
        const allOptions = [];
        const calcDisabledOptionsIndexes = [];
        let index = 0;
        _.each(props.sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                allOptions.push({
                    ...option,
                    sectionIndex,
                    index: optionIndex,
                });
                if (section.isDisabled || option.isDisabled) {
                    calcDisabledOptionsIndexes.push(index);
                }
                index += 1;
            });
        });

        props.setDisabledOptionsIndexes(calcDisabledOptionsIndexes);
        return allOptions;
    };

    /**
     * @param {Array<Object>} allOptions
     * @returns {Number}
     */
    const getInitiallyFocusedIndex = (allOptions) => {
        if (_.isNumber(props.initialFocusedIndex)) {
            return initialFocusedIndex;
        }

        if (props.selectedOptions.length > 0) {
            return props.selectedOptions.length;
        }
        const defaultIndex = props.shouldTextInputAppearBelowOptions ? allOptions.length : 0;
        if (_.isUndefined(props.initiallyFocusedOptionKey)) {
            return defaultIndex;
        }

        const indexOfInitiallyFocusedOption = _.findIndex(allOptions, (option) => option.keyForList === initiallyFocusedOptionKey);

        if (indexOfInitiallyFocusedOption >= 0) {
            return indexOfInitiallyFocusedOption;
        }

        return defaultIndex;
    };

    const relatedTarget = useRef(null);
    const listRef = useRef();
    const textInputRef = useRef();
    const enterSubscription = useRef();
    const CTRLEnterSubscription = useRef();

    const prevLocale = useRef(props.preferredLocale);
    const prevSelectedOptions = useRef(props.selectedOptions);

    const [disabledOptionsIndexes, props.setDisabledOptionsIndexes] = useState([]);

    const initialAllOptions = useMemo(() => {
        return flattenSections();
    }, []);

    const [allOptions, setAllOptions] = useState(initialAllOptions);
    const [focusedIndex, setFocusedIndex] = useState(getInitiallyFocusedIndex(initialAllOptions));
    const [shouldDisableRowSelection, setShouldDisableRowSelection] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const focusTimeout = useRef();

    useEffect(() => {
        subscribeToKeyboardShortcut();

        if (isFocused && autoFocus && textInputRef.current) {
            focusTimeout.current = setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        scrollToIndex(selectedOptions.length ? 0 : focusedIndex, false);

        return () => {
            if (focusTimeout.current) {
                clearTimeout(focusTimeout.current);
            }

            unSubscribeFromKeyboardShortcut();
        };
    }, []);

    useEffect(() => {
        if (isFocused) {
            subscribeToKeyboardShortcut();
        } else {
            unSubscribeFromKeyboardShortcut();
        }

        // Screen coming back into focus, for example
        // when doing Cmd+Shift+K, then Cmd+K, then Cmd+Shift+K.
        // Only applies to platforms that support keyboard shortcuts
        if ([CONST.PLATFORM.DESKTOP, CONST.PLATFORM.WEB].includes(getPlatform()) && isFocused && autoFocus && textInputRef.current) {
            setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }
    }, [isFocused]);

    useEffect(() => {
        const newOptions = flattenSections();

        if (prevLocale.current !== props.preferredLocale) {
            prevLocale.current = props.preferredLocale;
            setAllOptions(newOptions);

            return;
        }

        const newFocusedIndex = selectedOptions.length;

        setAllOptions(newOptions);
        setFocusedIndex(_.isNumber(initialFocusedIndex) ? initialFocusedIndex : newFocusedIndex);
    }, [sections]);

    useEffect(() => {
        const isNewFocusedIndex = props.selectedOptions.length !== focusedIndex;

        // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
        if (props.selectedOptions.length !== prevSelectedOptions.current.length || !props.value) {
            prevSelectedOptions.current = props.selectedOptions;
            scrollToIndex(0);
            return;
        }

        // Otherwise, scroll to the focused index (as long as it's in range)
        if (allOptions.length <= focusedIndex || !isNewFocusedIndex) {
            return;
        }
        scrollToIndex(focusedIndex);
    }, [focusedIndex]);

    const updateSearchValue = (value) => {
        setErrorMessage(value.length > props.maxLength ? translate('common.error.characterLimitExceedCounter', {length: value.length, limit: props.maxLength}) : '');
        props.onChangeText(value);
    };

    const subscribeToKeyboardShortcut = () => {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        enterSubscription.current = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            selectFocusedOption,
            enterConfig.descriptionKey,
            enterConfig.modifiers,
            true,
            () => !allOptions[focusedIndex],
        );

        const CTRLEnterConfig = CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER;
        CTRLEnterSubscription.current = KeyboardShortcut.subscribe(
            CTRLEnterConfig.shortcutKey,
            () => {
                if (canSelectMultipleOptions) {
                    onConfirmSelection();
                    return;
                }

                const focusedOption = allOptions[focusedIndex];
                if (!focusedOption) {
                    return;
                }

                selectRow(focusedOption);
            },
            CTRLEnterConfig.descriptionKey,
            CTRLEnterConfig.modifiers,
            true,
        );
    };

    const unSubscribeFromKeyboardShortcut = () => {
        if (enterSubscription.current) {
            enterSubscription.current();
        }

        if (CTRLEnterSubscription.current) {
            CTRLEnterSubscription.current();
        }
    };

    const selectFocusedOption = () => {
        const focusedOption = allOptions[focusedIndex];

        if (!focusedOption || !isFocused) {
            return;
        }

        if (props.canSelectMultipleOptions) {
            selectRow(focusedOption);
        } else if (!shouldDisableRowSelection) {
            setShouldDisableRowSelection(true);

            let result = selectRow(focusedOption);
            if (!(result instanceof Promise)) {
                result = Promise.resolve();
            }

            setTimeout(() => {
                result.finally(() => {
                    setShouldDisableRowSelection(false);
                });
            }, 500);
        }
    };

    const focus = () => {
        if (!textInputRef.current) {
            return;
        }

        textInputRef.current.focus();
    };

    /**
     * @param {Number} index
     */
    const updateFocusedIndex = (index) => {
        setFocusedIndex(index);
    };

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = (index, animated = true) => {
        const option = allOptions[index];
        if (!listRef.current || !option) {
            return;
        }

        const itemIndex = option.index;
        const sectionIndex = option.sectionIndex;

        if (!lodashGet(this.state.sections, `[${sectionIndex}].data[${itemIndex}]`, null)) {
            return;
        }

        // Note: react-native's SectionList automatically strips out any empty sections.
        // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
        // Otherwise, it will cause an index-out-of-bounds error and crash the app.
        let adjustedSectionIndex = sectionIndex;
        for (let i = 0; i < sectionIndex; i++) {
<<<<<<< HEAD
            if (_.isEmpty(lodashGet(sections, `[${i}].data`))) {
=======
            if (_.isEmpty(lodashGet(this.state.sections, `[${i}].data`))) {
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7
                adjustedSectionIndex--;
            }
        }

        listRef.current.scrollToLocation({sectionIndex: adjustedSectionIndex, itemIndex, animated});
    };

    /**
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     * @returns {Promise}
     */
    const selectRow = (option, ref) => {
        return new Promise((resolve) => {
            if (props.shouldShowTextInput && props.shouldPreventDefaultFocusOnSelectRow) {
                if (relatedTarget.current && ref === relatedTarget.current) {
                    textInputRef.current.focus();
                    relatedTarget.current = null;
                }
                if (textInputRef.current.isFocused()) {
                    setSelection(textInputRef.current, 0, value.length);
                }
            }
            const selectedOption = props.onSelectRow(option);
            resolve(selectedOption);

            if (!props.canSelectMultipleOptions) {
                return;
            }

            // Focus the first unselected item from the list (i.e: the best result according to the current search term)
            setFocusedIndex(props.selectedOptions.length);
        });
    };

    /**
     * Completes the follow-up action after clicking on multiple select button
     * @param {Object} option
     */
    const addToSelection = (option) => {
        if (props.shouldShowTextInput && props.shouldPreventDefaultFocusOnSelectRow) {
            textInputRef.current.focus();
            if (textInputRef.current.isFocused()) {
                setSelection(textInputRef.current, 0, value.length);
            }
        }
        props.onAddToSelection(option);
    };

<<<<<<< HEAD
    const shouldShowFooter = !props.isReadOnly && (props.shouldShowConfirmButton || props.footerContent) && !(props.canSelectMultipleOptions && _.isEmpty(props.selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(props.confirmButtonText) ? translate('common.confirm') : props.confirmButtonText;
    const shouldShowDefaultConfirmButton = !props.footerContent && defaultConfirmButtonText;
    const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : safeAreaPaddingBottomStyle;
    const textInput = (
        <TextInput
            ref={textInputRef}
            value={props.value}
            label={props.textInputLabel}
            accessibilityLabel={props.textInputLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            onChangeText={updateSearchValue}
            errorText={errorMessage}
            onSubmitEditing={selectFocusedOption}
            placeholder={props.placeholderText}
            maxLength={props.maxLength + CONST.ADDITIONAL_ALLOWED_CHARACTERS}
            keyboardType={props.keyboardType}
            onBlur={(e) => {
                if (!props.shouldPreventDefaultFocusOnSelectRow) {
                    return;
                }
                relatedTarget.current = e.relatedTarget;
            }}
            selectTextOnFocus
            blurOnSubmit={Boolean(allOptions.length)}
            spellCheck={false}
            shouldInterceptSwipe={props.shouldTextInputInterceptSwipe}
            isLoading={props.isLoadingNewOptions}
        />
    );
    const optionsList = (
        <OptionsList
            ref={listRef}
            optionHoveredStyle={props.optionHoveredStyle}
            onSelectRow={props.onSelectRow ? selectRow : undefined}
            sections={props.sections}
            focusedIndex={focusedIndex}
            selectedOptions={props.selectedOptions}
            canSelectMultipleOptions={props.canSelectMultipleOptions}
            shouldShowMultipleOptionSelectorAsButton={props.shouldShowMultipleOptionSelectorAsButton}
            multipleOptionSelectorButtonText={props.multipleOptionSelectorButtonText}
            onAddToSelection={addToSelection}
            hideSectionHeaders={props.hideSectionHeaders}
            headerMessage={errorMessage ? '' : props.headerMessage}
            boldStyle={props.boldStyle}
            showTitleTooltip={props.showTitleTooltip}
            isDisabled={props.isDisabled}
            shouldHaveOptionSeparator={props.shouldHaveOptionSeparator}
            highlightSelectedOptions={props.highlightSelectedOptions}
            onLayout={() => {
                if (props.selectedOptions.length === 0) {
                    scrollToIndex(focusedIndex, false);
                }

                if (props.onLayout) {
                    props.onLayout();
                }
            }}
            contentContainerStyles={[safeAreaPaddingBottomStyle, ...props.contentContainerStyles]}
            sectionHeaderStyle={props.sectionHeaderStyle}
            listContainerStyles={props.listContainerStyles}
            listStyles={props.listStyles}
            isLoading={!props.shouldShowOptions}
            showScrollIndicator={props.showScrollIndicator}
            isRowMultilineSupported={props.isRowMultilineSupported}
            isLoadingNewOptions={props.isLoadingNewOptions}
            shouldPreventDefaultFocusOnSelectRow={props.shouldPreventDefaultFocusOnSelectRow}
            nestedScrollEnabled={props.nestedScrollEnabled}
            bounces={!props.shouldTextInputAppearBelowOptions || !props.shouldAllowScrollingChildren}
        />
    );

    const optionsAndInputsBelowThem = (
        <>
            <View style={[styles.flexGrow0, styles.flexShrink1, styles.flexBasisAuto, styles.w100, styles.flexRow]}>{optionsList}</View>
            <View style={shouldUseStyleForChildren ? [styles.ph5, styles.pv5, styles.flexGrow1, styles.flexShrink0] : []}>
                {props.children}
                {props.shouldShowTextInput && textInput}
            </View>
        </>
    );

    return (
        <ArrowKeyFocusManager
            disabledIndexes={disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={allOptions.length - 1}
            onFocusedIndexChanged={props.disableArrowKeysActions ? () => {} : updateFocusedIndex}
            shouldResetIndexOnEndReached={false}
        >
            <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto]}>
                {/*
                 * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                 * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                 * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                 */}
                {props.shouldTextInputAppearBelowOptions && props.shouldAllowScrollingChildren && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                        <ScrollView
                            horizontal
                            bounces={false}
                            contentContainerStyle={[styles.flex1, styles.flexColumn]}
                        >
                            {optionsAndInputsBelowThem}
                        </ScrollView>
                    </ScrollView>
=======
    /**
     * Increments a pagination page to show more items
     */
    incrementPage() {
        this.setState((prev) => ({
            paginationPage: prev.paginationPage + 1,
        }));
    }

    render() {
        const shouldShowShowMoreButton = this.state.allOptions.length > CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * this.state.paginationPage;
        const shouldShowFooter =
            !this.props.isReadOnly && (this.props.shouldShowConfirmButton || this.props.footerContent) && !(this.props.canSelectMultipleOptions && _.isEmpty(this.props.selectedOptions));
        const defaultConfirmButtonText = _.isUndefined(this.props.confirmButtonText) ? this.props.translate('common.confirm') : this.props.confirmButtonText;
        const shouldShowDefaultConfirmButton = !this.props.footerContent && defaultConfirmButtonText;
        const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : this.props.safeAreaPaddingBottomStyle;
        const listContainerStyles = this.props.listContainerStyles || [this.props.themeStyles.flex1];

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
                optionHoveredStyle={this.props.optionHoveredStyle || this.props.themeStyles.hoveredComponentBG}
                onSelectRow={this.props.onSelectRow ? this.selectRow : undefined}
                sections={this.state.sections}
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
                listContainerStyles={listContainerStyles}
                listStyles={this.props.listStyles}
                isLoading={!this.props.shouldShowOptions}
                showScrollIndicator={this.props.showScrollIndicator}
                isRowMultilineSupported={this.props.isRowMultilineSupported}
                isLoadingNewOptions={this.props.isLoadingNewOptions}
                shouldPreventDefaultFocusOnSelectRow={this.props.shouldPreventDefaultFocusOnSelectRow}
                nestedScrollEnabled={this.props.nestedScrollEnabled}
                bounces={!this.props.shouldTextInputAppearBelowOptions || !this.props.shouldAllowScrollingChildren}
                renderFooterContent={() =>
                    shouldShowShowMoreButton && (
                        <ShowMoreButton
                            containerStyle={{...this.props.themeStyles.mt2, ...this.props.themeStyles.mb5}}
                            currentCount={CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * this.state.paginationPage}
                            totalCount={this.state.allOptions.length}
                            onPress={this.incrementPage}
                        />
                    )
                }
            />
        );

        const optionsAndInputsBelowThem = (
            <>
                <View
                    style={[
                        this.props.themeStyles.flexGrow0,
                        this.props.themeStyles.flexShrink1,
                        this.props.themeStyles.flexBasisAuto,
                        this.props.themeStyles.w100,
                        this.props.themeStyles.flexRow,
                    ]}
                >
                    {optionsList}
                </View>
                <View
                    style={
                        this.props.shouldUseStyleForChildren
                            ? [this.props.themeStyles.ph5, this.props.themeStyles.pv5, this.props.themeStyles.flexGrow1, this.props.themeStyles.flexShrink0]
                            : []
                    }
                >
                    {this.props.children}
                    {this.props.shouldShowTextInput && textInput}
                </View>
            </>
        );

        return (
            <ArrowKeyFocusManager
                disabledIndexes={this.disabledOptionsIndexes}
                focusedIndex={this.state.focusedIndex}
                maxIndex={this.calculateAllVisibleOptionsCount() - 1}
                onFocusedIndexChanged={this.props.disableArrowKeysActions ? () => {} : this.updateFocusedIndex}
                shouldResetIndexOnEndReached={false}
            >
                <View style={[this.props.themeStyles.flexGrow1, this.props.themeStyles.flexShrink1, this.props.themeStyles.flexBasisAuto]}>
                    {/*
                     * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                     * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                     * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                     */}
                    {this.props.shouldTextInputAppearBelowOptions && this.props.shouldAllowScrollingChildren && (
                        <ScrollView contentContainerStyle={[this.props.themeStyles.flexGrow1]}>
                            <ScrollView
                                horizontal
                                bounces={false}
                                contentContainerStyle={[this.props.themeStyles.flex1, this.props.themeStyles.flexColumn]}
                            >
                                {optionsAndInputsBelowThem}
                            </ScrollView>
                        </ScrollView>
                    )}

                    {this.props.shouldTextInputAppearBelowOptions && !this.props.shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                    {!this.props.shouldTextInputAppearBelowOptions && (
                        <>
                            <View style={this.props.shouldUseStyleForChildren ? [this.props.themeStyles.ph5, this.props.themeStyles.pb3] : []}>
                                {this.props.children}
                                {this.props.shouldShowTextInput && textInput}
                                {Boolean(this.props.textInputAlert) && (
                                    <FormHelpMessage
                                        message={this.props.textInputAlert}
                                        style={[this.props.themeStyles.mb3]}
                                        isError={false}
                                    />
                                )}
                            </View>
                            {optionsList}
                        </>
                    )}
                </View>
                {this.props.shouldShowReferralCTA && (
                    <View style={[this.props.themeStyles.ph5, this.props.themeStyles.pb5, this.props.themeStyles.flexShrink0]}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(this.props.referralContentType));
                            }}
                            style={[
                                this.props.themeStyles.p5,
                                this.props.themeStyles.w100,
                                this.props.themeStyles.br2,
                                this.props.themeStyles.highlightBG,
                                this.props.themeStyles.flexRow,
                                this.props.themeStyles.justifyContentBetween,
                                this.props.themeStyles.alignItemsCenter,
                                {gap: 10},
                            ]}
                            accessibilityLabel="referral"
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            <Text>
                                {this.props.translate(`referralProgram.${this.props.referralContentType}.buttonText1`)}
                                <Text
                                    color={this.props.theme.success}
                                    style={this.props.themeStyles.textStrong}
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
                                style={[this.props.themeStyles.w100]}
                                text={defaultConfirmButtonText}
                                onPress={this.props.onConfirmSelection}
                                pressOnEnter
                                enterKeyEventListenerPriority={1}
                            />
                        )}
                        {this.props.footerContent}
                    </FixedFooter>
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7
                )}

                {props.shouldTextInputAppearBelowOptions && !props.shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                {!props.shouldTextInputAppearBelowOptions && (
                    <>
                        <View style={props.shouldUseStyleForChildren ? [styles.ph5, styles.pb3] : []}>
                            {props.children}
                            {props.shouldShowTextInput && textInput}
                            {Boolean(props.textInputAlert) && (
                                <FormHelpMessage
                                    message={props.textInputAlert}
                                    style={[styles.mb3]}
                                    isError={false}
                                />
                            )}
                        </View>
                        {optionsList}
                    </>
                )}
            </View>
            {shouldShowFooter && (
                <FixedFooter>
                    {shouldShowDefaultConfirmButton && (
                        <Button
                            success
                            style={[styles.w100]}
                            text={defaultConfirmButtonText}
                            onPress={props.onConfirmSelection}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                        />
                    )}
                    {props.footerContent}
                </FixedFooter>
            )}
        </ArrowKeyFocusManager>
    );
};

BaseOptionsSelector.defaultProps = defaultProps;
BaseOptionsSelector.propTypes = propTypes;

<<<<<<< HEAD
export default BaseOptionsSelector;
=======
export default compose(withLocalize, withNavigationFocus, withThemeStyles, withTheme)(BaseOptionsSelector);
>>>>>>> d2056af696902ad6b1befc6f802bccda728039d7
