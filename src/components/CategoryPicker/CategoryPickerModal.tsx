import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getBottomSheetHeight from '@libs/getBottomSheetHeight';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import CategoryPicker from '.';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type CategoryPickerModalProps = {
    onClose: () => void;

    /** The policy whose categories should be shown */
    policyID: string | undefined;

    selectedCategory?: string;

    /** Called when the user confirms a category selection */
    onSelected?: (item: ListItem) => void;

    /** Width of the pop-over. Defaults to the standard dropdown width, a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height, a caller short on room passes a smaller one */
    popoverHeight?: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling. */
    shouldFitContentHeight?: boolean;

    /** Whether the pop-over may flip to the other side of the anchor when it overflows. It shifts by a whole pop-over height, so a caller that already picked the side turns this off. */
    shouldSwitchPositionIfOverflow?: boolean;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function CategoryPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policyID,
    selectedCategory,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    popoverWidth = CONST.POPOVER_DROPDOWN_WIDTH,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    shouldFitContentHeight = false,
    shouldSwitchPositionIfOverflow = true,
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive, keyboardActiveHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    const {top: safeAreaTop} = useSafeAreaInsets();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: isSmallScreenWidth && !isKeyboardActive,
        addOfflineIndicatorBottomSafeAreaPadding: false,
    });
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    const categoriesCount = policyCategories ?? 0;
    const isSearchable = categoriesCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const estimatedContentHeight = getSelectionListPopoverContentHeight({optionCount: Math.max(renderedRowCount ?? categoriesCount, 1), isSearchable});

    const bottomSheetHeight = getBottomSheetHeight({
        preferredHeight: popoverHeight,
        windowHeight,
        keyboardHeight: isKeyboardActive ? keyboardActiveHeight : 0,
        topSafeAreaInset: safeAreaTop,
        minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable}),
    });
    const popoverContentHeight = shouldFitContentHeight ? Math.min(popoverHeight, estimatedContentHeight) : popoverHeight;
    const resolvedHeight = isSmallScreenWidth ? bottomSheetHeight : popoverContentHeight;
    const popoverDimensions = {width: popoverWidth, height: resolvedHeight};
    // Mobile Safari ignores `interactive-widget=resizes-content` and leaves the sheet docked behind the keyboard, so on mobile browsers
    // the sheet is sized and offset to the visual viewport, which the keyboard does shrink.
    const outerStyle = isSmallScreenWidth ? {...styles.w100, ...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)} : undefined;

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
            avoidKeyboard={isSmallScreenWidth}
            outerStyle={outerStyle}
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4, bottomSafeAreaPaddingStyle]}>
                <CategoryPicker
                    onRenderedRowCountChange={setRenderedRowCount}
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    shouldAutoFocusSearchInput
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
