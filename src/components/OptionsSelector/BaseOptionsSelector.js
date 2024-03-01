import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import OptionsList from '@components/OptionsList';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ShowMoreButton from '@components/ShowMoreButton';
import TextInput from '@components/TextInput';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import setSelection from '@libs/setSelection';
import CONST from '@src/CONST';
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
    shouldShowReferralCTA: false,
    referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND,
    safeAreaPaddingBottomStyle: {},
    contentContainerStyles: [],
    listContainerStyles: undefined,
    listStyles: [],
    ...optionsSelectorDefaultProps,
};

function BaseOptionsSelector(props) {
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const themeStyles = useThemeStyles();

    const [disabledOptionsIndexes, setDisabledOptionsIndexes] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [value, setValue] = useState('');
    const [paginationPage, setPaginationPage] = useState(1);

    const shouldDisableRowSelection = useRef(false);
    const relatedTarget = useRef(null);
    const listRef = useRef(null);
    const textInputRef = useRef(null);

    const prevSelectedOptions = usePrevious(props.selectedOptions);
    const prevValue = usePrevious(value);

    useImperativeHandle(props.forwardedRef, () => textInputRef.current);
    const {inputCallbackRef} = useAutoFocusInput();

    /**
     * Paginate props.sections to only allow a certain number of items per section.
     */
    const sections = useMemo(
        () =>
            _.map(props.sections, (section) => {
                if (_.isEmpty(section.data)) {
                    return section;
                }

                // eslint-disable-next-line no-param-reassign
                section.data = section.data.slice(0, CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * (paginationPage || 1));
                return section;
            }),
        [paginationPage, props.sections],
    );

    /**
     * Flatten the sections into a single array of options.
     * Each object in this array is enhanced to have:
     *
     *   1. A `sectionIndex`, which represents the index of the section it came from
     *   2. An `index`, which represents the index of the option within the section it came from.
     */
    const allOptions = useMemo(() => {
        const options = [];
        const calcDisabledOptionIndexes = [];
        let index = 0;
        _.each(sections, (section, sectionIndex) => {
            _.each(section.data, (option, optionIndex) => {
                // eslint-disable-next-line no-param-reassign
                option.sectionIndex = sectionIndex;
                // eslint-disable-next-line no-param-reassign
                option.index = optionIndex;
                options.push(option);

                if (section.isDisabled || option.isDisabled) {
                    calcDisabledOptionIndexes.push(index);
                }

                index++;
            });
        });
        setDisabledOptionsIndexes(calcDisabledOptionIndexes);
        return options;
    }, [sections]);
    const prevOptions = usePrevious(allOptions);

    const initialFocusedIndex = useMemo(() => {
        if (!_.isUndefined(props.initiallyFocusedOptionKey)) {
            return _.findIndex(allOptions, (option) => option.keyForList === props.initiallyFocusedOptionKey);
        }

        let defaultIndex;
        if (props.shouldTextInputAppearBelowOptions) {
            defaultIndex = allOptions.length;
        } else if (props.focusedIndex >= 0) {
            defaultIndex = props.focusedIndex;
        } else {
            defaultIndex = props.selectedOptions.length;
        }
        return defaultIndex;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this value is only used to initialize state so only ever needs to be computed on the first render
    }, []);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex,
        disabledIndexes: disabledOptionsIndexes,
        maxIndex: allOptions.length - 1,
        isActive: !props.disableArrowKeysActions,
        disableHorizontalKeys: true,
    });

    /**
     * Completes the follow-up actions after a row is selected
     *
     * @param {Object} option
     * @param {Object} ref
     * @returns {Promise}
     */
    const selectRow = useCallback(
        (option, ref) =>
            new Promise((resolve) => {
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
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.shouldShowTextInput, props.shouldPreventDefaultFocusOnSelectRow, value.length, props.canSelectMultipleOptions, props.selectedOptions.length],
    );

    const selectFocusedOption = useCallback(
        (e) => {
            const focusedItemKey = lodashGet(e, ['target', 'attributes', 'id', 'value'], null);
            const localFocusedOption = focusedItemKey ? _.find(allOptions, (option) => option.keyForList === focusedItemKey) : allOptions[focusedIndex];

            if (!localFocusedOption || !isFocused) {
                return;
            }

            if (props.canSelectMultipleOptions) {
                selectRow(localFocusedOption);
            } else if (!shouldDisableRowSelection.current) {
                shouldDisableRowSelection.current = true;

                let result = selectRow(localFocusedOption);
                if (!(result instanceof Promise)) {
                    result = Promise.resolve();
                }

                setTimeout(() => {
                    result.finally(() => {
                        shouldDisableRowSelection.current = false;
                    });
                }, 500);
            }
        },
        [props.canSelectMultipleOptions, focusedIndex, allOptions, isFocused, selectRow],
    );

    const selectOptions = useCallback(() => {
        if (props.canSelectMultipleOptions) {
            props.onConfirmSelection();
            return;
        }

        const localFocusedOption = allOptions[focusedIndex];
        if (!localFocusedOption) {
            return;
        }

        selectRow(localFocusedOption);
        // we don't need to include the whole props object as the dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allOptions, focusedIndex, props.canSelectMultipleOptions, props.onConfirmSelection, selectRow]);

    const activeElementRole = useActiveElementRole();
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        shouldBubble: !allOptions[focusedIndex],
        captureOnInputs: true,
        isActive: isFocused && (!activeElementRole || activeElementRole === CONST.ROLE.PRESENTATION),
    });
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, selectOptions, {
        captureOnInputs: true,
        isActive: isFocused,
    });

    /**
     * Scrolls to the focused index within the SectionList
     *
     * @param {Number} index
     * @param {Boolean} animated
     */
    const scrollToIndex = useCallback(
        (index, animated = true) => {
            const option = allOptions[index];
            if (!listRef.current || !option) {
                return;
            }

            const itemIndex = option.index;
            const sectionIndex = option.sectionIndex;

            if (!lodashGet(sections, `[${sectionIndex}].data[${itemIndex}]`, null)) {
                return;
            }

            listRef.current.scrollToLocation({sectionIndex, itemIndex, animated});
        },
        [allOptions, sections],
    );

    useEffect(() => {
        if (_.isEqual(allOptions, prevOptions)) {
            return;
        }

        const newFocusedIndex = props.selectedOptions.length;
        const prevFocusedOption = prevOptions[focusedIndex];
        const indexOfPrevFocusedOptionInCurrentList = _.findIndex(allOptions, (option) => prevFocusedOption && option.keyForList === prevFocusedOption.keyForList);
        setFocusedIndex(indexOfPrevFocusedOptionInCurrentList || (_.isNumber(props.focusedIndex) ? props.focusedIndex : newFocusedIndex));
        // we want to run this effect only when the sections change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allOptions]);

    useEffect(() => {
        // If we just toggled an option on a multi-selection page or cleared the search input, scroll to top
        if (props.selectedOptions.length !== prevSelectedOptions.length || (!!prevValue && !value)) {
            scrollToIndex(0);
            return;
        }

        // Otherwise, scroll to the focused index (as long as it's in range)
        if (allOptions.length <= focusedIndex) {
            return;
        }
        scrollToIndex(focusedIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allOptions.length, focusedIndex, props.focusedIndex, props.selectedOptions, value]);

    const updateSearchValue = useCallback(
        (searchValue) => {
            setValue(searchValue);
            setErrorMessage(
                searchValue.length > props.maxLength
                    ? translate('common.error.characterLimitExceedCounter', {
                          length: searchValue.length,
                          limit: props.maxLength,
                      })
                    : '',
            );
            props.onChangeText(searchValue);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.onChangeText, props.maxLength, translate],
    );

    const debouncedUpdateSearchValue = _.debounce(updateSearchValue, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    /**
     * Completes the follow-up action after clicking on multiple select button
     * @param {Object} option
     */
    const addToSelection = useCallback(
        (option) => {
            if (props.shouldShowTextInput && props.shouldPreventDefaultFocusOnSelectRow) {
                textInputRef.current.focus();
                if (textInputRef.current.isFocused()) {
                    setSelection(textInputRef.current, 0, value.length);
                }
            }
            props.onAddToSelection(option);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.onAddToSelection, props.shouldShowTextInput, props.shouldPreventDefaultFocusOnSelectRow, value.length],
    );

    /**
     * Increments a pagination page to show more items
     */
    const incrementPage = useCallback(() => {
        setPaginationPage((prev) => prev + 1);
    }, []);

    const shouldShowShowMoreButton = allOptions.length > CONST.MAX_OPTIONS_SELECTOR_PAGE_LENGTH * paginationPage;
    const shouldShowFooter = !props.isReadOnly && (props.shouldShowConfirmButton || props.footerContent) && !(props.canSelectMultipleOptions && _.isEmpty(props.selectedOptions));
    const defaultConfirmButtonText = _.isUndefined(props.confirmButtonText) ? translate('common.confirm') : props.confirmButtonText;
    const shouldShowDefaultConfirmButton = !props.footerContent && defaultConfirmButtonText;
    const safeAreaPaddingBottomStyle = shouldShowFooter ? undefined : props.safeAreaPaddingBottomStyle;
    const listContainerStyles = props.listContainerStyles || [themeStyles.flex1];
    const optionHoveredStyle = props.optionHoveredStyle || themeStyles.hoveredComponentBG;

    const textInput = (
        <TextInput
            ref={(el) => {
                textInputRef.current = el;
                inputCallbackRef(el);
            }}
            label={props.textInputLabel}
            accessibilityLabel={props.textInputLabel}
            role={CONST.ROLE.PRESENTATION}
            onChangeText={debouncedUpdateSearchValue}
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
            iconLeft={props.textIconLeft}
            testID="options-selector-input"
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
            disableFocusOptions={props.disableFocusOptions}
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
        <>
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
                    <ReferralProgramCTA referralContentType={props.referralContentType} />
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
        </>
    );
}

BaseOptionsSelector.defaultProps = defaultProps;
BaseOptionsSelector.propTypes = propTypes;

const BaseOptionsSelectorWithRef = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseOptionsSelectorWithRef.displayName = 'BaseOptionsSelectorWithRef';

export default BaseOptionsSelectorWithRef;
