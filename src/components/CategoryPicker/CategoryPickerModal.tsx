import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {ListItem} from '@components/SelectionList/types';

import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';

import React, {useRef} from 'react';
import {View} from 'react-native';

import CategoryPicker from '.';

/** Height the search input takes when the list is long enough to show one, mirroring `getSelectionListPopoverHeight` */
const SEARCH_INPUT_HEIGHT = 64;

/** Vertical padding the pop-over draws around the list */
const CONTENT_VERTICAL_PADDING = 32;

/** Shortest the list area may be: one full row, so a one-option list is exactly as tall as its one option */
const MIN_LIST_HEIGHT = variables.optionRowHeight;

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

    /** Width of the pop-over. Defaults to the standard dropdown width; a field row passes its own width instead */
    popoverWidth?: number;

    /** Height of the pop-over. Defaults to the standard dropdown height; a caller short on room passes a smaller one */
    popoverHeight?: number;

    /**
     * Whether the pop-over shrinks to the height its list actually needs, treating `popoverHeight` as a ceiling
     * rather than a fixed height. Opted into by the expense form's field rows, where a fixed height leaves a
     * short list floating in an empty box that runs past the panel the row was opened from.
     */
    shouldFitContentHeight?: boolean;
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
}: CategoryPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive} = useKeyboardState();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});

    // Estimated the same way `getSelectionListPopoverHeight` estimates the Spend filters' pop-overs: off the
    // option count rather than off a measurement, so the pop-over opens at its final size instead of resizing
    // once the list has laid out. Under-estimating only means the list scrolls, which it is built to do.
    const categoriesCount = policyCategories ?? 0;
    const isSearchable = categoriesCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const estimatedContentHeight = Math.max(categoriesCount * variables.optionRowHeight, MIN_LIST_HEIGHT) + (isSearchable ? SEARCH_INPUT_HEIGHT : 0) + CONTENT_VERTICAL_PADDING;

    // A bottom sheet is sized by the screen, so the content estimate only applies to the pop-over.
    const resolvedHeight = shouldFitContentHeight && !isSmallScreenWidth ? Math.min(popoverHeight, estimatedContentHeight) : popoverHeight;
    const popoverDimensions = {width: popoverWidth, height: resolvedHeight};

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
            // A bottom sheet spans the screen, so only the pop-over is held to the width it was given.
            innerContainerStyle={isSmallScreenWidth ? undefined : StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}>
                <CategoryPicker
                    selectedCategory={selectedCategory}
                    policyID={policyID}
                    onSubmit={handleCategorySelect}
                    addBottomSafeAreaPadding={isSmallScreenWidth && !isKeyboardActive}
                    shouldAutoFocusSearchInput
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
