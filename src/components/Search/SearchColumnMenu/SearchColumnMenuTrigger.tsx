import * as PopoverMenu from '@components/PopoverMenu/v2';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useSortableColumn} from '@components/Search/SortableColumnContext';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import CenteredHeading from './CenteredHeading';
import IconHeading from './IconHeading';
import LabelHeading from './LabelHeading';
import useCaretPlacement, {CARET_PLACEMENT} from './useCaretPlacement';

/** The column's heading. Pressing it opens the column menu, which holds the sort options. */
function SearchColumnMenuTrigger() {
    const {label, alignment, hasResizeHandle, labelProps} = useSortableColumn();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();
    const {placement, isCentered, onLayout} = useCaretPlacement(alignment, label, labelProps);

    return (
        <PopoverMenu.Trigger sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMN_MENU}>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: label})}
                role={CONST.ROLE.BUTTON}
                wrapperStyle={[styles.flex1, styles.alignSelfStretch]}
                onWrapperLayout={onLayout}
                // Fills the cell, so the whole heading opens the menu.
                style={[styles.flex1, styles.alignSelfStretch, styles.justifyContentCenter]}
            >
                {({hovered}) => {
                    const isCaretVisible = hovered && !isMenuVisible;
                    if (placement === CARET_PLACEMENT.REPLACES_ICON) {
                        return (
                            <IconHeading
                                isCaretVisible={isCaretVisible}
                                labelProps={labelProps}
                            />
                        );
                    }

                    const heading = (
                        <LabelHeading
                            isCaretVisible={isCaretVisible}
                            isCaretBeforeLabel={placement === CARET_PLACEMENT.BEFORE_LABEL}
                            hasResizeHandle={hasResizeHandle}
                            labelProps={labelProps}
                        />
                    );
                    return isCentered ? <CenteredHeading labelProps={labelProps}>{heading}</CenteredHeading> : heading;
                }}
            </PressableWithFeedback>
        </PopoverMenu.Trigger>
    );
}

export default SearchColumnMenuTrigger;
