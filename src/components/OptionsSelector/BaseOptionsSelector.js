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
import useLocalize from '@hooks/useLocalize';
import getPlatform from '@libs/getPlatform';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import setSelection from '@libs/setSelection';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
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

    /** Whether referral CTA should be displayed */
    shouldShowReferralCTA: PropTypes.bool,

    /** Referral content type */
    referralContentType: PropTypes.string,

    ...optionsSelectorPropTypes,
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

const BaseOptionsSelector = (props) => {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const themeStyles = useThemeStyles();
    const theme = useTheme();

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

        setDisabledOptionsIndexes(calcDisabledOptionsIndexes);
        return allOptions;
    };

    /**
     * Maps sections to render only allowed count of them per section.
     *
     * @returns {Objects[]}
     */
    const sliceSections = () => {
        return _.map(props.sections, (section) => {
            if (_.isEmpty(section.data)) {
                return section;
            }

            return {
                ...section,
                data: section.data.slice(0, CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * lodashGet(paginationPage, 1)),
            };
        });
    };
    /**
     * @param {Array<Object>} allOptions
     * @returns {Number}
     */
    const getInitiallyFocusedIndex = (allOptions) => {
        if (_.isNumber(props.initialFocusedIndex)) {
            return props.initialFocusedIndex;
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

    const [disabledOptionsIndexes, setDisabledOptionsIndexes] = useState([]);

    const initialAllOptions = useMemo(() => {
        return flattenSections();
    }, []);

    const [sections, setSections] = useState();
    const [allOptions, setAllOptions] = useState(initialAllOptions);
    const [focusedIndex, setFocusedIndex] = useState(getInitiallyFocusedIndex(initialAllOptions));
    const [shouldDisableRowSelection, setShouldDisableRowSelection] = useState(false);
    //Not used?
    const [shouldShowReferralModal, setShouldShowReferralModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paginationPage, setPaginationPage] = useState(1);

    const relatedTarget = useRef(null);
    const listRef = useRef();
    const textInputRef = useRef();
    const enterSubscription = useRef();
    const CTRLEnterSubscription = useRef();
    const focusTimeout = useRef();
    const prevLocale = useRef(props.preferredLocale);
    const prevPaginationPage = useRef(paginationPage);
    const prevSelectedOptions = useRef(props.selectedOptions);

    useEffect(() => {
        subscribeToKeyboardShortcut();

        if (isFocused && props.autoFocus && textInputRef.current) {
            focusTimeout.current = setTimeout(() => {
                textInputRef.current.focus();
            }, CONST.ANIMATED_TRANSITION);
        }

        scrollToIndex(props.selectedOptions.length ? 0 : focusedIndex, false);

        const newSections = sliceSections();

        if (prevPaginationPage.current !== paginationPage) {
            prevPaginationPage.current = paginationPage;
            setSections(newSections);
        }

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
        const newSections = sliceSections();
        const newOptions = flattenSections();

        if (prevLocale.current !== props.preferredLocale) {
            prevLocale.current = props.preferredLocale;
            setAllOptions(newOptions);
            setSections(newSections);
            return;
        }

        const newFocusedIndex = props.selectedOptions.length;

        setSections(newSections);
        setAllOptions(newOptions);
        setFocusedIndex(_.isNumber(props.focusedIndex) ? props.focusedIndex : newFocusedIndex);
    }, [props.sections]);

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
        scrollToIndex(props.focusedIndex);
    }, [focusedIndex]);

    const updateSearchValue = (value) => {
        setErrorMessage(value.length > props.maxLength ? translate('common.error.characterLimitExceedCounter', {length: value.length, limit: props.maxLength}) : '');
        props.onChangeText(value);
    };

    //What is it for? its not being used anywhere?
    const handleReferralModal = () => {
        setShouldShowReferralModal((prev) => !prev);
    };

    /**
     * Calculates all currently visible options based on the sections that are currently being shown
     * and the number of items of those sections.
     *
     * @returns {Number}
     */
    const calculateAllVisibleOptionsCount = () => {
        let count = 0;

        _.forEach(sections, (section) => {
            count += lodashGet(section, 'data.length', 0);
        });

        return count;
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

    //Not used?
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

        if (!lodashGet(sections, `[${sectionIndex}].data[${itemIndex}]`, null)) {
            return;
        }

        // Note: react-native's SectionList automatically strips out any empty sections.
        // So we need to reduce the sectionIndex to remove any empty sections in front of the one we're trying to scroll to.
        // Otherwise, it will cause an index-out-of-bounds error and crash the app.
        let adjustedSectionIndex = sectionIndex;
        for (let i = 0; i < sectionIndex; i++) {
            if (_.isEmpty(lodashGet(sections, `[${i}].data`))) {
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

    /**
     * Increments a pagination page to show more items
     */
    const incrementPage = () => {
        setPaginationPage((prev) => prev + 1);
    };

    const shouldShowShowMoreButton = allOptions.length > CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * paginationPage;
    const shouldShowFooter = !props.isReadOnly && (props.shouldShowConfirmButton || props.footerContent) && !(props.canSelectMultipleOptions && _.isEmpty(props.selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(props.confirmButtonText) ? translate('common.confirm') : props.confirmButtonText;
    const shouldShowDefaultConfirmButton = !props.footerContent && defaultConfirmButtonText;
    const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : props.safeAreaPaddingBottomStyle;
    const listContainerStyles = props.listContainerStyles || [themeStyles.flex1];
    const optionHoveredStyle = props.optionHoveredStyle || themeStyles.hoveredComponentBG;

    const textInput = (
        <TextInput
            ref={textInputRef}
            value={props.value}
            label={props.textInputLabel}
            accessibilityLabel={props.textInputLabel}
            role={CONST.ACCESSIBILITY_ROLE.TEXT}
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
            optionHoveredStyle={optionHoveredStyle}
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
            listContainerStyles={listContainerStyles}
            listStyles={props.listStyles}
            isLoading={!props.shouldShowOptions}
            showScrollIndicator={props.showScrollIndicator}
            isRowMultilineSupported={props.isRowMultilineSupported}
            isLoadingNewOptions={props.isLoadingNewOptions}
            shouldPreventDefaultFocusOnSelectRow={props.shouldPreventDefaultFocusOnSelectRow}
            nestedScrollEnabled={props.nestedScrollEnabled}
            bounces={!props.shouldTextInputAppearBelowOptions || !props.shouldAllowScrollingChildren}
            renderFooterContent={() =>
                shouldShowShowMoreButton && (
                    <ShowMoreButton
                        containerStyle={{...themeStyles.mt2, ...themeStyles.mb5}}
                        currentCount={CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * paginationPage}
                        totalCount={allOptions.length}
                        onPress={incrementPage}
                    />
                )
            }
        />
    );

    const optionsAndInputsBelowThem = (
        <>
            <View style={[themeStyles.flexGrow0, themeStyles.flexShrink1, themeStyles.flexBasisAuto, themeStyles.w100, themeStyles.flexRow]}>{optionsList}</View>
            <View style={props.shouldUseStyleForChildren ? [themeStyles.ph5, themeStyles.pv5, themeStyles.flexGrow1, themeStyles.flexShrink0] : []}>
                {props.children}
                {props.shouldShowTextInput && textInput}
            </View>
        </>
    );

    return (
        <ArrowKeyFocusManager
            disabledIndexes={disabledOptionsIndexes}
            focusedIndex={focusedIndex}
            maxIndex={calculateAllVisibleOptionsCount() - 1}
            onFocusedIndexChanged={props.disableArrowKeysActions ? () => {} : updateFocusedIndex}
            shouldResetIndexOnEndReached={false}
        >
            <View style={[themeStyles.flexGrow1, themeStyles.flexShrink1, themeStyles.flexBasisAuto]}>
                {/*
                 * The OptionsList component uses a SectionList which uses a VirtualizedList internally.
                 * VirtualizedList cannot be directly nested within ScrollViews of the same orientation.
                 * To work around this, we wrap the OptionsList component with a horizontal ScrollView.
                 */}
                {props.shouldTextInputAppearBelowOptions && props.shouldAllowScrollingChildren && (
                    <ScrollView contentContainerStyle={[themeStyles.flexGrow1]}>
                        <ScrollView
                            horizontal
                            bounces={false}
                            contentContainerStyle={[themeStyles.flex1, themeStyles.flexColumn]}
                        >
                            {optionsAndInputsBelowThem}
                        </ScrollView>
                    </ScrollView>
                )}

                {props.shouldTextInputAppearBelowOptions && !props.shouldAllowScrollingChildren && optionsAndInputsBelowThem}

                {!props.shouldTextInputAppearBelowOptions && (
                    <>
                        <View style={props.shouldUseStyleForChildren ? [themeStyles.ph5, themeStyles.pb3] : []}>
                            {props.children}
                            {props.shouldShowTextInput && textInput}
                            {Boolean(props.textInputAlert) && (
                                <FormHelpMessage
                                    message={props.textInputAlert}
                                    style={[themeStyles.mb3]}
                                    isError={false}
                                />
                            )}
                        </View>
                        {optionsList}
                    </>
                )}
            </View>
            {props.shouldShowReferralCTA && (
                <View style={[themeStyles.ph5, themeStyles.pb5, themeStyles.flexShrink0]}>
                    <PressableWithoutFeedback
                        onPress={() => {
                            Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(props.referralContentType));
                        }}
                        style={[
                            themeStyles.p5,
                            themeStyles.w100,
                            themeStyles.br2,
                            themeStyles.highlightBG,
                            themeStyles.flexRow,
                            themeStyles.justifyContentBetween,
                            themeStyles.alignItemsCenter,
                            {gap: 10},
                        ]}
                        accessibilityLabel="referral"
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        <Text>
                            {translate(`referralProgram.${props.referralContentType}.buttonText1`)}
                            <Text
                                color={theme.success}
                                style={themeStyles.textStrong}
                            >
                                {translate(`referralProgram.${props.referralContentType}.buttonText2`)}
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
                            style={[themeStyles.w100]}
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

export default BaseOptionsSelector;
