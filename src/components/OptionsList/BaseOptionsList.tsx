import isEqual from 'lodash/isEqual';
import type {ForwardedRef} from 'react';
import React, {forwardRef, memo, useEffect, useMemo, useRef} from 'react';
import type {SectionListRenderItem} from 'react-native';
import {View} from 'react-native';
import OptionRow from '@components/OptionRow';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import {PressableWithFeedback} from '@components/Pressable';
import SectionList from '@components/SectionList';
import Text from '@components/Text';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import getSectionsWithIndexOffset from '@libs/getSectionsWithIndexOffset';
import type {OptionData} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BaseOptionListProps, OptionsList, OptionsListData, OptionsListDataWithIndexOffset, SectionWithIndexOffset} from './types';

function BaseOptionsList(
    {
        keyboardDismissMode = 'none',
        onScrollBeginDrag = () => {},
        onScroll = () => {},
        listStyles,
        focusedIndex = 0,
        selectedOptions = [],
        headerMessage = '',
        isLoading = false,
        sections = [],
        onLayout,
        hideSectionHeaders = false,
        shouldHaveOptionSeparator = false,
        showTitleTooltip = false,
        optionHoveredStyle,
        contentContainerStyles: contentContainerStylesProp,
        sectionHeaderStyle,
        showScrollIndicator = true,
        listContainerStyles: listContainerStylesProp,
        shouldDisableRowInnerPadding = false,
        shouldPreventDefaultFocusOnSelectRow = false,
        disableFocusOptions = false,
        canSelectMultipleOptions = false,
        shouldShowMultipleOptionSelectorAsButton,
        multipleOptionSelectorButtonText,
        onAddToSelection,
        highlightSelectedOptions = false,
        onSelectRow,
        boldStyle = false,
        isDisabled = false,
        isRowMultilineSupported = false,
        isLoadingNewOptions = false,
        nestedScrollEnabled = true,
        bounces = true,
        renderFooterContent,
        safeAreaPaddingBottomStyle,
    }: BaseOptionListProps,
    ref: ForwardedRef<OptionsList>,
) {
    const styles = useThemeStyles();
    const flattenedData = useRef<
        Array<{
            length: number;
            offset: number;
        }>
    >([]);
    const previousSections = usePrevious<OptionsListData[]>(sections);
    const didLayout = useRef(false);

    const listContainerStyles = useMemo(() => listContainerStylesProp ?? [styles.flex1], [listContainerStylesProp, styles.flex1]);
    const contentContainerStyles = useMemo(() => [safeAreaPaddingBottomStyle, contentContainerStylesProp], [contentContainerStylesProp, safeAreaPaddingBottomStyle]);
    const sectionsWithIndexOffset = getSectionsWithIndexOffset(sections);

    /**
     * This helper function is used to memoize the computation needed for getItemLayout. It is run whenever section data changes.
     */
    const buildFlatSectionArray = () => {
        let offset = 0;

        // Start with just an empty list header
        const flatArray = [{length: 0, offset}];

        // Build the flat array
        for (const section of sections) {
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
        if (isEqual(sections, previousSections)) {
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
     * @param data - This is the same as the data we pass into the component
     * @param flatDataArrayIndex - This index is provided by React Native, and refers to a flat array with data from all the sections. This flat array has some quirks:
     *
     *     1. It ALWAYS includes a list header and a list footer, even if we don't provide/render those.
     *     2. Each section includes a header, even if we don't provide/render one.
     *
     *     For example, given a list with two sections, two items in each section, no header, no footer, and no section headers, the flat array might look something like this:
     *
     *     [{header}, {sectionHeader}, {item}, {item}, {sectionHeader}, {item}, {item}, {footer}]
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const getItemLayout = (_data: OptionsListDataWithIndexOffset[] | null, flatDataArrayIndex: number) => {
        if (!flattenedData.current.at(flatDataArrayIndex)) {
            flattenedData.current = buildFlatSectionArray();
        }
        const targetItem = flattenedData.current.at(flatDataArrayIndex);
        return {
            length: targetItem?.length ?? 0,
            offset: targetItem?.offset ?? 0,
            index: flatDataArrayIndex,
        };
    };

    /**
     * Returns the key used by the list
     */
    const extractKey = (option: OptionData) => option.keyForList ?? '';

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

    const renderItem: SectionListRenderItem<OptionData, SectionWithIndexOffset> = ({item, index, section}) => {
        const isItemDisabled = isDisabled || !!section.isDisabled || !!item.isDisabled;
        const isSelected = selectedOptions?.some((option) => {
            if (option.keyForList && option.keyForList === item.keyForList) {
                return true;
            }

            if (!option.name || StringUtils.isEmptyString(option.name)) {
                return false;
            }

            return option.name === item.searchText;
        });

        return (
            <OptionRow
                keyForList={item.keyForList ?? ''}
                option={item}
                showTitleTooltip={showTitleTooltip}
                hoverStyle={optionHoveredStyle}
                optionIsFocused={!disableFocusOptions && !isItemDisabled && focusedIndex === index + (section.indexOffset ?? 0)}
                onSelectRow={onSelectRow}
                isSelected={isSelected}
                showSelectedState={canSelectMultipleOptions}
                shouldShowSelectedStateAsButton={shouldShowMultipleOptionSelectorAsButton}
                selectedStateButtonText={multipleOptionSelectorButtonText}
                onSelectedStatePressed={onAddToSelection}
                highlightSelected={highlightSelectedOptions}
                boldStyle={item.boldStyle ?? boldStyle}
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
     */
    const renderSectionHeader = ({section: {title, shouldShow, shouldShowActionButton, onActionButtonPress, actionButtonTitle}}: {section: OptionsListDataWithIndexOffset}) => {
        if (!title && shouldShow && !hideSectionHeaders && sectionHeaderStyle) {
            return <View style={sectionHeaderStyle} />;
        }

        if (title && shouldShow && !hideSectionHeaders) {
            return (
                // Note: The `optionsListSectionHeader` style provides an explicit height to section headers.
                // We do this so that we can reference the height in `getItemLayout` –
                // we need to know the heights of all list items up-front in order to synchronously compute the layout of any given list item.
                // So be aware that if you adjust the content of the section header (for example, change the font size), you may need to adjust this explicit height as well.
                <View style={[styles.optionsListSectionHeader, styles.flexRow, styles.justifyContentBetween, sectionHeaderStyle]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{title}</Text>
                    {shouldShowActionButton && (
                        <PressableWithFeedback
                            onPress={onActionButtonPress}
                            accessibilityLabel={CONST.ROLE.BUTTON}
                            role={CONST.ROLE.BUTTON}
                            shouldUseAutoHitSlop
                        >
                            <Text style={[styles.pr5, styles.textLabelSupporting, styles.link]}>{actionButtonTitle}</Text>
                        </PressableWithFeedback>
                    )}
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
                    <SectionList<OptionData, SectionWithIndexOffset>
                        ref={ref}
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
                        sections={sectionsWithIndexOffset}
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
                        testID="options-list"
                    />
                </>
            )}
        </View>
    );
}

BaseOptionsList.displayName = 'BaseOptionsList';

// using memo to avoid unnecessary rerenders when parents component rerenders (thus causing this component to rerender because shallow comparison is used for some props).
export default memo(
    forwardRef(BaseOptionsList),
    (prevProps, nextProps) =>
        nextProps.focusedIndex === prevProps.focusedIndex &&
        nextProps?.selectedOptions?.length === prevProps?.selectedOptions?.length &&
        nextProps.headerMessage === prevProps.headerMessage &&
        nextProps.isLoading === prevProps.isLoading &&
        isEqual(nextProps.sections, prevProps.sections),
);
