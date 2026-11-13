/** A column's heading that opens the column's menu when pressed, and reveals a caret on hover without moving its label. */
import Icon from '@components/Icon';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RESIZE_HANDLE_COLUMN_OVERLAP from '@components/Table/columnResize/resizeHandleColumnOverlap';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {measureSearchHeaderLabelWidth} from '@libs/getSearchColumnContentToMeasure';

import type {SearchColumnAlignment} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type ColumnHeaderMenuTriggerProps = WithRequiredSentryLabel & {
    /** The column's name, which names the trigger for assistive tech even when the heading shows only an icon. */
    columnLabel: string;

    /** Where the column's cells place their content, which the heading follows. */
    alignment: SearchColumnAlignment;

    /** Whether a resize handle sits over the heading's right edge. */
    hasResizeHandle: boolean;

    /** Insets the label and the caret together, so the caret sits as close to the label in an inset heading as in any other. */
    labelRowStyle?: StyleProp<ViewStyle>;

    /** The heading's label. A centered column renders it twice, once hidden to size the label's slot. */
    children: React.ReactNode;
};

function ColumnHeaderMenuTrigger({columnLabel, alignment, hasResizeHandle, labelRowStyle, sentryLabel, children}: ColumnHeaderMenuTriggerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();

    // An end-aligned label with no room for the caret before it is laid out as start-aligned, so hovering never moves it.
    const [hasRoomForCaretBeforeLabel, setHasRoomForCaretBeforeLabel] = useState(true);
    // Reserves the sort arrow, so sorting never flips the layout. `null` on native, which can't measure text.
    const labelWidth = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END ? measureSearchHeaderLabelWidth(columnLabel, styles.gap1.gap) : null;
    const updateCaretRoom =
        labelWidth === null
            ? undefined
            : (event: LayoutChangeEvent) => {
                  const caretWidth = variables.iconSizeExtraSmall + styles.mr1.marginRight;
                  setHasRoomForCaretBeforeLabel(event.nativeEvent.layout.width >= labelWidth + caretWidth);
              };
    const layoutAlignment = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END && !hasRoomForCaretBeforeLabel ? CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.START : alignment;
    // The caret goes on the side away from the edge the label is pinned to, so revealing it on hover doesn't move the label.
    const isCaretBeforeLabel = layoutAlignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END;

    return (
        <PopoverMenu.Trigger>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: columnLabel})}
                role={CONST.ROLE.BUTTON}
                sentryLabel={sentryLabel}
                wrapperStyle={[styles.flex1, styles.alignSelfStretch]}
                onWrapperLayout={updateCaretRoom}
                // Fills the cell, so the whole heading opens the menu.
                style={[styles.flex1, styles.alignSelfStretch, styles.justifyContentCenter]}
            >
                {({hovered}) => {
                    const isCaretVisible = hovered && !isMenuVisible;
                    const caret = isCaretVisible && (
                        <View style={isCaretBeforeLabel ? styles.mr1 : styles.ml1}>
                            <Icon
                                src={icons.DownArrow}
                                fill={theme.icon}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </View>
                    );
                    const labelRow = (
                        // Keeps the caret out of the resize handle's hit area.
                        <View style={isCaretVisible && hasResizeHandle && StyleUtils.getPaddingRight(RESIZE_HANDLE_COLUMN_OVERLAP)}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, isCaretBeforeLabel && styles.justifyContentEnd, labelRowStyle]}>
                                {isCaretBeforeLabel && caret}
                                <View style={styles.flexShrink1}>{children}</View>
                                {!isCaretBeforeLabel && caret}
                            </View>
                        </View>
                    );

                    if (layoutAlignment !== CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.CENTER) {
                        return labelRow;
                    }

                    // A caret taking room would shift a centered label. The spacer and the slot split the spare room, so the label
                    // rests centered and the caret takes the room after it. The slot never shrinks below the label, so a label
                    // wider than its cell spills past both edges.
                    return (
                        <View style={[styles.flexRow, styles.justifyContentCenter]}>
                            <View style={[styles.flexGrow1, styles.flexBasis0]} />
                            <View style={[styles.flexGrow1, styles.flexShrink0]}>
                                {/* Sizes the slot to the label. */}
                                <View
                                    aria-hidden
                                    style={[styles.opacity0, styles.pointerEventsNone, labelRowStyle]}
                                >
                                    {children}
                                </View>
                                <View style={styles.searchColumnMenuLabelOverlay}>{labelRow}</View>
                            </View>
                        </View>
                    );
                }}
            </PressableWithFeedback>
        </PopoverMenu.Trigger>
    );
}

export default ColumnHeaderMenuTrigger;
