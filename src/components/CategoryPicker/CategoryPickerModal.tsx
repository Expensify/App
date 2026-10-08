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
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEnabledCategoriesCount} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import variables from '@styles/variables';

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

    /** Shows a header with an add button, for users who can add a category to the workspace */
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
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive} = useKeyboardState();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`, {selector: getEnabledCategoriesCount});
    const [renderedRowCount, setRenderedRowCount] = useState<number>();

    const categoriesCount = policyCategories ?? 0;
    const isSearchable = categoriesCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const headerHeight = onAddCategory ? variables.componentSizeNormal : 0;
    const estimatedContentHeight = getSelectionListPopoverContentHeight({optionCount: Math.max(renderedRowCount ?? categoriesCount, 1), isSearchable}) + headerHeight;

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
            innerContainerStyle={isSmallScreenWidth ? undefined : StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}>
                {!!onAddCategory && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, StyleUtils.getHeight(headerHeight)]}>
                        <Text style={styles.textLabelSupporting}>{translate('common.category')}</Text>
                        <Tooltip text={translate('workspace.categories.addCategory')}>
                            <PressableWithFeedback
                                accessibilityLabel={translate('workspace.categories.addCategory')}
                                role={CONST.ROLE.BUTTON}
                                onPress={onAddCategory}
                                style={styles.touchableButtonImage}
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
                    addBottomSafeAreaPadding={isSmallScreenWidth && !isKeyboardActive}
                    shouldAutoFocusSearchInput
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default CategoryPickerModal;
