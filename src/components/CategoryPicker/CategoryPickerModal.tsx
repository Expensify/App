import Icon from '@components/Icon';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getBottomSheetHeight, {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';
import isTablet from '@libs/isTablet';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import CategoryPicker from '.';

/**
 * Height of the add-category header the list shows above its options: its 20px row, 4px above it (20px from the edge
 * with the 16px top padding of the list, or of the sheet) and 20px below. Shared with the row sizing the container, so
 * the two never disagree.
 */
const CATEGORY_PICKER_HEADER_HEIGHT = variables.iconSizeNormal + 24;

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type CategoryPickerModalProps = {
    onClose: () => void;

    /** The policy whose categories should be shown */
    policyID: string | undefined;

    selectedCategory?: string;

    /** Whether to show GL codes under each category regardless of the workspace setting */
    shouldAlwaysShowGLCode?: boolean;

    /** Number of enabled categories at which the search input appears. The content height estimate uses the same value. */
    searchInputThreshold?: number;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Shows a header with a back button and an add button, for users who can add a category to the workspace */
    onAddCategory?: () => void;

    /** Sentry label for the add button, so each caller's presses are attributed to it */
    addCategorySentryLabel?: string;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function CategoryPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedCategory,
    shouldAlwaysShowGLCode = false,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
    onAddCategory,
    addCategorySentryLabel,
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow', 'Plus']);
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {isKeyboardActive, keyboardActiveHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    const {paddingTop: safeAreaTop, paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    const categoriesCount = policyCategories ?? 0;
    const isSearchable = categoriesCount >= searchInputThreshold;
    const headerHeight = onAddCategory ? CATEGORY_PICKER_HEADER_HEIGHT : 0;
    // The bottom sheet already pads its own top, so under a header it skips the list's top padding to keep the header 20px from the edge.
    const shouldSkipListTopPadding = isSmallScreenWidth && !!onAddCategory;
    const estimatedContentHeight =
        getSelectionListPopoverContentHeight({optionCount: Math.max(renderedRowCount ?? categoriesCount, 1), isSearchable}) +
        headerHeight -
        (shouldSkipListTopPadding ? styles.pt4.paddingTop : 0);

    // The sheet pads itself above the home indicator, except while the keyboard already covers it. The offline indicator
    // is drawn on the page behind the sheet, so no room is kept for it.
    const bottomSafeAreaPadding = isSmallScreenWidth && !isKeyboardActive ? safeAreaPaddingBottom : 0;
    // A phone in landscape is too short for a sheet over the form, so there the sheet fills the screen.
    const shouldFillWindow = isInLandscapeMode;
    // A list with a search input makes room for the keyboard inside the sheet, frame by frame with it, in both orientations:
    // flipping `avoidKeyboard` on rotation would swap the modal's wrapper and remount the sheet, replaying its entry animation
    // and dropping the input's focus. On mobile web the keyboard shrinks the window instead, which the sheet's height follows.
    const shouldPadForKeyboard = isSmallScreenWidth && isSearchable && !isTablet();
    // In portrait that list opens as tall as a sheet may be and its top edge stays put when the keyboard comes up, so the gap
    // above it is sized off the screen, which the keyboard leaves alone.
    const shouldKeepTopEdge = shouldPadForKeyboard && !isInLandscapeMode;
    const minSheetHeight = getSelectionListPopoverContentHeight({optionCount: 1, isSearchable});
    const keptTopEdgeSheetHeight = windowHeight - Dimensions.get('screen').height * (1 - CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO) - BOTTOM_SHEET_TOP_PADDING;
    const bottomSheetHeight = shouldKeepTopEdge
        ? Math.max(minSheetHeight, keptTopEdgeSheetHeight)
        : getBottomSheetHeight({
              preferredHeight: popoverHeight,
              windowHeight,
              keyboardHeight: isKeyboardActive && !shouldPadForKeyboard ? keyboardActiveHeight : 0,
              topSafeAreaInset: safeAreaTop,
              minHeight: minSheetHeight,
              shouldFillWindow,
          });
    // A short list gets a sheet only as tall as its rows, still within the room the window and keyboard leave.
    const fittedSheetHeight =
        shouldFitContentHeight && !shouldFillWindow && !shouldKeepTopEdge ? Math.min(bottomSheetHeight, estimatedContentHeight + bottomSafeAreaPadding) : bottomSheetHeight;
    const popoverContentHeight = shouldFitContentHeight ? Math.min(popoverHeight, estimatedContentHeight) : popoverHeight;
    const resolvedHeight = isSmallScreenWidth ? fittedSheetHeight : popoverContentHeight;
    const popoverDimensions = {width: popoverWidth, height: resolvedHeight};
    // Mobile Safari ignores `interactive-widget=resizes-content` and leaves the sheet docked behind the keyboard, so on mobile browsers
    // the sheet is sized and offset to the visual viewport, which the keyboard does shrink.
    const outerStyle = isSmallScreenWidth ? {...styles.w100, ...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)} : undefined;

    // The keyboard's offset is negative while it is open. It covers the home indicator, so the sheet pads for whichever is taller.
    const {height: keyboardOffset} = useReanimatedKeyboardAnimation();
    const keyboardRoomStyle = useAnimatedStyle(() => ({paddingBottom: Math.max(safeAreaPaddingBottom, -keyboardOffset.get())}));

    const handleCategorySelect = (item: ListItem) => {
        // If clicking the same category that's already selected, treat it as deselection
        if (item.keyForList === selectedCategory) {
            onSelected?.({keyForList: '', searchText: ''});
        } else {
            onSelected?.(item);
        }
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={isSmallScreenWidth ? undefined : StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
            avoidKeyboard={isSmallScreenWidth && !shouldPadForKeyboard}
            outerStyle={outerStyle}
            // The sheet sizes itself to the window and its list scrolls on its own, so the modal must not cap or wrap it in landscape.
            shouldLimitHeightIfBottomDockedInLandscapeMode={false}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <Animated.View
                style={[
                    StyleUtils.getHeight(popoverDimensions.height),
                    styles.flexColumn,
                    !shouldSkipListTopPadding && styles.pt4,
                    shouldPadForKeyboard ? keyboardRoomStyle : StyleUtils.getPaddingBottom(bottomSafeAreaPadding),
                ]}
            >
                {!!onAddCategory && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pt1, styles.pb5, StyleUtils.getHeight(headerHeight)]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            {isSmallScreenWidth && (
                                <Tooltip text={translate('common.back')}>
                                    <PressableWithFeedback
                                        accessibilityLabel={translate('common.back')}
                                        role={CONST.ROLE.BUTTON}
                                        onPress={onClose}
                                        shouldUseAutoHitSlop
                                        sentryLabel={CONST.SENTRY_LABEL.CATEGORY_PICKER_MODAL.BACK_BUTTON}
                                    >
                                        <Icon
                                            src={icons.BackArrow}
                                            fill={theme.icon}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                        />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            <Text style={styles.textLabelSupporting}>{translate('common.category')}</Text>
                        </View>
                        <Tooltip text={translate('workspace.categories.addCategory')}>
                            <PressableWithFeedback
                                accessibilityLabel={translate('workspace.categories.addCategory')}
                                role={CONST.ROLE.BUTTON}
                                onPress={onAddCategory}
                                shouldUseAutoHitSlop
                                sentryLabel={addCategorySentryLabel}
                            >
                                <Icon
                                    src={icons.Plus}
                                    fill={theme.icon}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                )}
                <CategoryPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    shouldAutoFocusSearchInput
                    shouldAlwaysShowGLCode={shouldAlwaysShowGLCode}
                    searchInputThreshold={searchInputThreshold}
                />
            </Animated.View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
export {CATEGORY_PICKER_HEADER_HEIGHT};
