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
import {StyleSheet, View} from 'react-native';

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

/** The padding and border a style puts on each side of the label row's content. */
function getHorizontalInsets(style: StyleProp<ViewStyle>): {left: number; right: number} {
    const {padding, paddingHorizontal, paddingLeft, paddingRight, paddingStart, paddingEnd, borderWidth, borderLeftWidth, borderRightWidth, borderStartWidth, borderEndWidth} =
        StyleSheet.flatten(style) ?? {};
    const toNumber = (value: unknown) => (typeof value === 'number' ? value : 0);
    return {
        left: toNumber(paddingLeft ?? paddingStart ?? paddingHorizontal ?? padding) + toNumber(borderLeftWidth ?? borderStartWidth ?? borderWidth),
        right: toNumber(paddingRight ?? paddingEnd ?? paddingHorizontal ?? padding) + toNumber(borderRightWidth ?? borderEndWidth ?? borderWidth),
    };
}

function ColumnHeaderMenuTrigger({columnLabel, alignment, hasResizeHandle, labelRowStyle, sentryLabel, children}: ColumnHeaderMenuTriggerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const isMenuVisible = PopoverMenu.useIsPopoverVisible();

    const [headingWidth, setHeadingWidth] = useState<number | null>(null);
    const [restingLabel, setRestingLabel] = useState<{start: number; width: number} | null>(null);

    const isEndAligned = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END;
    // Reserves the sort arrow, so sorting never flips the layout. `null` on native, which can't measure text.
    const labelWidth = isEndAligned ? measureSearchHeaderLabelWidth(columnLabel, styles.gap1.gap) : null;
    const labelRowInsets = getHorizontalInsets(labelRowStyle);
    const updateHeadingWidth = labelWidth === null ? undefined : (event: LayoutChangeEvent) => setHeadingWidth(event.nativeEvent.layout.width);
    const labelRowContentWidth = headingWidth === null ? null : headingWidth - labelRowInsets.left - labelRowInsets.right;
    const caretBeforeLabelWidth = variables.iconSizeExtraSmall + styles.mr1.marginRight;
    const hasRoomForCaretBeforeLabel = labelWidth === null || labelRowContentWidth === null || labelRowContentWidth >= labelWidth + caretBeforeLabelWidth;
    // The caret goes on the side away from the edge the label is pinned to when it fits, so revealing it on hover doesn't move the label.
    // An end-aligned label with no room for it there gets it after its sort arrow instead, staying end-aligned.
    const isCaretBeforeLabel = isEndAligned && hasRoomForCaretBeforeLabel;
    // An end-aligned label with the caret after it keeps the start it rests at, so the caret truncates it instead of sliding it left.
    const shouldKeepLabelStart = isEndAligned && !isCaretBeforeLabel;
    // A label that filled its row at rest still fills it. Otherwise its natural width is known, which keeps the start right if the heading resizes during hover.
    const restingLabelStart = labelRowContentWidth === null || restingLabel === null || restingLabel.start <= 0 ? 0 : Math.max(labelRowContentWidth - restingLabel.width, 0);
    const updateRestingLabel = (event: LayoutChangeEvent) => {
        const {x, width} = event.nativeEvent.layout;
        setRestingLabel({start: x - labelRowInsets.left, width});
    };

    return (
        <PopoverMenu.Trigger sentryLabel={sentryLabel}>
            <PressableWithFeedback
                accessibilityLabel={translate('search.columnMenu.openMenu', {columnName: columnLabel})}
                role={CONST.ROLE.BUTTON}
                wrapperStyle={[styles.flex1, styles.alignSelfStretch]}
                onWrapperLayout={updateHeadingWidth}
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
                        <View style={isCaretVisible && hasResizeHandle && !isCaretBeforeLabel && StyleUtils.getPaddingRight(RESIZE_HANDLE_COLUMN_OVERLAP)}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, isEndAligned && styles.justifyContentEnd, labelRowStyle]}>
                                {isCaretBeforeLabel && caret}
                                <View
                                    style={[styles.flexShrink1, shouldKeepLabelStart && isCaretVisible && StyleUtils.getPaddingLeft(restingLabelStart)]}
                                    // Web only observes layout for a view that has `onLayout` when it mounts, so this can't wait for `shouldKeepLabelStart`.
                                    onLayout={labelWidth !== null && !isCaretVisible ? updateRestingLabel : undefined}
                                >
                                    {children}
                                </View>
                                {!isCaretBeforeLabel && caret}
                            </View>
                        </View>
                    );

                    if (alignment !== CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.CENTER) {
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
