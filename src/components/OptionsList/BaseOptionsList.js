import PropTypes from 'prop-types';
import React, {forwardRef, memo, useEffect, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import OptionRow from '@components/OptionRow';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import SectionList from '@components/SectionList';
import Text from '@components/Text';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {defaultProps as optionsListDefaultProps, propTypes as optionsListPropTypes} from './optionsListPropTypes';

const propTypes = {
    /** Determines whether the keyboard gets dismissed in response to a drag */
    keyboardDismissMode: PropTypes.string,

    /** Called when the user begins to drag the scroll view. Only used for the native component */
    onScrollBeginDrag: PropTypes.func,

    /** Callback executed on scroll. Only used for web/desktop component */
    onScroll: PropTypes.func,

    /** List styles for SectionList */
    listStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...optionsListPropTypes,
};

const defaultProps = {
    keyboardDismissMode: 'none',
    onScrollBeginDrag: () => {},
    onScroll: () => {},
    listStyles: [],
    ...optionsListDefaultProps,
};

function BaseOptionsList({
    keyboardDismissMode,
    onScrollBeginDrag,
    onScroll,
    listStyles,
    focusedIndex,
    selectedOptions,
    headerMessage,
    isLoading,
    sections,
    onLayout,
    hideSectionHeaders,
    shouldHaveOptionSeparator,
    showTitleTooltip,
    optionHoveredStyle,
    contentContainerStyles,
    sectionHeaderStyle,
    showScrollIndicator,
    listContainerStyles,
    shouldDisableRowInnerPadding,
    shouldPreventDefaultFocusOnSelectRow,
    disableFocusOptions,
    canSelectMultipleOptions,
    shouldShowMultipleOptionSelectorAsButton,
    multipleOptionSelectorButtonText,
    onAddToSelection,
    highlightSelectedOptions,
    onSelectRow,
    boldStyle,
    isDisabled,
    innerRef,
    isRowMultilineSupported,
    isLoadingNewOptions,
    nestedScrollEnabled,
    bounces,
    renderFooterContent,
}) {
    const styles = useThemeStyles();
    const flattenedData = useRef();
    const previousSections = usePrevious(sections);
    const didLayout = useRef(false);

    /**
     * This helper function is used to memoize the computation needed for getItemLayout. It is run whenever section data changes.
     *
     * @returns {Array<Object>}
     */
    const buildFlatSectionArray = () => {
        let offset = 0;

        // Start with just an empty list header
        const flatArray = [{length: 0, offset}];

        // Build the flat array
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];

            // Add the section header
            const sectionHeaderHeight = section.title && !hideSectionHeaders ? variables.optionsListSectionHeaderHeight : 0;
            flatArray.push({length: sectionHeaderHeight, offset});
            offset += sectionHeaderHeight;

            // Add section items
            for (let i = 0; i < section.data.length; i++) {
                let fullOptionHeight = variables.optionRowHeight;
                if (i > 0 && shouldHaveOptionSeparator) {
                    fullOptionHeight += variables.borderTopWidth;
                }
                flatArray.push({length: fullOptionHeight, offset});
                offset += fullOptionHeight;
            }

            // Add the section footer
            flatArray.push({length: 0, offset});
        }

        // Then add the list footer
        flatArray.push({length: 0, offset});
        return flatArray;
    };

    useEffect(() => {
        if (_.isEqual(sections, previousSections)) {
            return;
        }
        flattenedData.current = buildFlatSectionArray();
    });

    const onViewableItemsChanged = () => {
        if (didLayout.current || !onLayout) {
            return;
        }

        didLayout.current = true;
        onLayout();
    };

    /**
     * This function is used to compute the layout of any given item in our list.
     * We need to implement it so that we can programmatically scroll to items outside the virtual render window of the SectionList.
     *
     * @param {Array} data - This is the same as the data we pass into the component
     * @param {Number} flatDataArrayIndex - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     *
     * @returns {Object}
     */
    const getItemLayout = (data, flatDataArrayIndex) => {
        if (!_.has(flattenedData.current, flatDataArrayIndex)) {
            flattenedData.current = buildFlatSectionArray();
        }

        const targetItem = flattenedData.current[flatDataArrayIndex];
        return {
            length: targetItem.length,
            offset: targetItem.offset,
            index: flatDataArrayIndex,
        };
    };

    /**
     * Returns the key used by the list
     * @param {Object} option
     * @return {String}
     */
    const extractKey = (option) => option.keyForList;

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     * @param {Object} params.section
     *
     * @return {Component}
     */
    const renderItem = ({item, index, section}) => {
        const isItemDisabled = isDisabled || section.isDisabled || !!item.isDisabled;
        const isSelected = _.some(selectedOptions, (option) => {
            if (option.accountID && option.accountID === item.accountID) {
                return true;
            }

            if (option.reportID && option.reportID === item.reportID) {
                return true;
            }

            if (_.isEmpty(option.name)) {
                return false;
            }

            return option.name === item.searchText;
        });

        return (
            <OptionRow
                option={item}
                showTitleTooltip={showTitleTooltip}
                hoverStyle={optionHoveredStyle}
                optionIsFocused={!disableFocusOptions && !isItemDisabled && focusedIndex === index + section.indexOffset}
                onSelectRow={onSelectRow}
                isSelected={isSelected}
                showSelectedState={canSelectMultipleOptions}
                shouldShowSelectedStateAsButton={shouldShowMultipleOptionSelectorAsButton}
                selectedStateButtonText={multipleOptionSelectorButtonText}
                onSelectedStatePressed={onAddToSelection}
                highlightSelected={highlightSelectedOptions}
                boldStyle={boldStyle}
                isDisabled={isItemDisabled}
                shouldHaveOptionSeparator={index > 0 && shouldHaveOptionSeparator}
                shouldDisableRowInnerPadding={shouldDisableRowInnerPadding}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                isMultilineSupported={isRowMultilineSupported}
            />
        );
    };

    /**
     * Function which renders a section header component
     *
     * @param {Object} params
     * @param {Object} params.section
     * @param {String} params.section.title
     * @param {Boolean} params.section.shouldShow
     *
     * @return {Component}
     */
    const renderSectionHeader = ({section: {title, shouldShow}}) => {
        if (!title && shouldShow && !hideSectionHeaders && sectionHeaderStyle) {
            return <View style={sectionHeaderStyle} />;
        }

        if (title && shouldShow && !hideSectionHeaders) {
            return (
                // Note: The `optionsListSectionHeader` style provides an explicit height to section headers.
                // We do this so that we can reference the height in `getItemLayout` –
                // we need to know the heights of all list items up-front in order to synchronously compute the layout of any given list item.
                // So be aware that if you adjust the content of the section header (for example, change the font size), you may need to adjust this explicit height as well.
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, sectionHeaderStyle]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{title}</Text>
                </View>
            );
        }

        return <View />;
    };

    return (
        <View style={listContainerStyles}>
            {isLoading ? (
                <OptionsListSkeletonView shouldAnimate />
            ) : (
                <>
                    {/* If we are loading new options we will avoid showing any header message. This is mostly because one of the header messages says there are no options. */}
                    {/* This is misleading because we might be in the process of loading fresh options from the server. */}
                    {!isLoadingNewOptions && headerMessage ? (
                        <View style={[styles.ph5, styles.pb5]}>
                            <Text style={[styles.textLabel, styles.colorMuted]}>{headerMessage}</Text>
                        </View>
                    ) : null}
                    <SectionList
                        ref={innerRef}
                        style={listStyles}
                        indicatorStyle="white"
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode={keyboardDismissMode}
                        nestedScrollEnabled={nestedScrollEnabled}
                        scrollEnabled={nestedScrollEnabled}
                        onScrollBeginDrag={onScrollBeginDrag}
                        onScroll={onScroll}
                        contentContainerStyle={contentContainerStyles}
                        showsVerticalScrollIndicator={showScrollIndicator}
                        sections={sections}
                        keyExtractor={extractKey}
                        stickySectionHeadersEnabled={false}
                        renderItem={renderItem}
                        getItemLayout={getItemLayout}
                        renderSectionHeader={renderSectionHeader}
                        extraData={focusedIndex}
                        initialNumToRender={12}
                        maxToRenderPerBatch={CONST.MAX_TO_RENDER_PER_BATCH.DEFAULT}
                        windowSize={5}
                        viewabilityConfig={{viewAreaCoveragePercentThreshold: 95}}
                        onViewableItemsChanged={onViewableItemsChanged}
                        bounces={bounces}
                        ListFooterComponent={renderFooterContent}
                    />
                </>
            )}
        </View>
    );
}

BaseOptionsList.propTypes = propTypes;
BaseOptionsList.defaultProps = defaultProps;
BaseOptionsList.displayName = 'BaseOptionsList';

// using memo to avoid unnecessary rerenders when parents component rerenders (thus causing this component to rerender because shallow comparison is used for some props).
export default memo(
    forwardRef((props, ref) => (
        <BaseOptionsList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
    (prevProps, nextProps) =>
        nextProps.focusedIndex === prevProps.focusedIndex &&
        nextProps.selectedOptions.length === prevProps.selectedOptions.length &&
        nextProps.headerMessage === prevProps.headerMessage &&
        nextProps.isLoading === prevProps.isLoading &&
        _.isEqual(nextProps.sections, prevProps.sections),
);
