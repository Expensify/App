/**
 * The inner part of the date field, rendering one input per date segment instead of one input for the whole date. It is
 * registered as a `BaseTextInput` input type, so it sits inside the same label, border and error chrome as any other
 * text field.
 *
 * One input per segment is what makes the caret a non issue: moving between segments is an ordinary focus change, so
 * nothing here has to reason about where a caret sits inside a longer string.
 */
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateMaskParts} from '@libs/DateInputMaskUtils';
import type {DateSegmentName} from '@libs/DateInputMaskUtils';
import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {AnimatedTextInputRef} from './RNTextInput';
import type {BaseTextInputProps} from './TextInput/BaseTextInput/types';

import {PressableWithoutFeedback} from './Pressable';
import RNTextInput from './RNTextInput';
import Text from './Text';

/** Leaves the caret somewhere to sit, since a segment sized to its text exactly would clip it at the end */
const CARET_ALLOWANCE = 1;

/** Used until the real text has been measured, so the first paint is close rather than collapsed */
const ESTIMATED_CHARACTER_WIDTH = CONST.CHARACTER_WIDTH;

/** Reads back the padding the field hands its text, which is what a selection has to leave alone to cover the line */
function getVerticalPadding(inputStyle: BaseTextInputProps['style']): ViewStyle {
    const {paddingTop, paddingBottom, paddingVertical} = StyleSheet.flatten(inputStyle) ?? {};

    return {paddingTop, paddingBottom, paddingVertical};
}

function DateSegmentsInput({
    dateSegmentsConfig,
    style,
    placeholderTextColor,
    disabled,
    onPressOut,
    onFocus,
    onBlur,
    readOnly,
    forwardedFSClass,
    accessibilityLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ref,
}: BaseTextInputProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    // The mask letters are wider than the digits that replace them, so a fixed width would either clip the placeholder
    // or leave a gap once the segment is filled in. Each one is measured from the text it is currently showing.
    const [measuredWidths, setMeasuredWidths] = useState<Partial<Record<DateSegmentName, number>>>({});

    if (!dateSegmentsConfig) {
        return null;
    }

    const {mask, getSegmentProps, setSegmentRef, focusSegment, isSegmentElement, isAllSelected, onFieldBlur} = dateSegmentsConfig;

    const parts = getDateMaskParts(mask).map((part) => ({...part, segmentProps: getSegmentProps(part.name)}));

    const focusFirstUnfilledSegment = () => {
        const target = parts.find((part) => part.segmentProps.value.length < part.placeholder.length) ?? parts.at(-1);

        if (!target) {
            return;
        }

        focusSegment(target.name);
    };

    /**
     * The field's own blur handler is what a form hangs its validation on, so it only runs once focus leaves the whole
     * field rather than on every hop between segments.
     */
    const handleSegmentBlur: NonNullable<BaseTextInputProps['onBlur']> = (event) => {
        if ('relatedTarget' in event.nativeEvent && isSegmentElement(event.nativeEvent.relatedTarget)) {
            return;
        }

        onFieldBlur();
        onBlur?.(event);
    };

    // The separators belong to the mask rather than to the date, so they read as placeholder text for as long as any
    // of the mask is still on screen
    const isAnyMaskShowing = parts.some((part) => part.segmentProps.value.length < part.placeholder.length);

    // The style the field hands down stretches its input across the whole row, which would spread the segments evenly.
    // Everything here is sized to its own text instead, so the date reads as one run of text.
    const sizedToContent = [styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.wAuto];

    // The segments stretch down the row as a single input would, so the padding they inherit lands their text in the
    // same place as any other text field's
    return (
        <View
            style={[styles.flexRow, styles.flex1]}
            role="group"
            accessibilityLabel={accessibilityLabel}
        >
            {/* Sized to the date rather than to the row, so selecting it covers the digits and not the space after them */}
            <View style={styles.flexRow}>
                {/* Drawn behind the segments so it cannot move them. Taking the field's vertical padding leaves exactly
                the line of text to fill, so the selection needs no measuring to line up with it. */}
                {isAllSelected && (
                    <View style={[styles.pAbsolute, styles.l0, styles.t0, styles.r0, styles.b0, getVerticalPadding(style), styles.pointerEventsNone]}>
                        <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.textSelectionBackground)]} />
                    </View>
                )}
                {parts.map((part) => {
                    const segmentProps = part.segmentProps;
                    // The mask letters a half typed segment has not reached yet, which stay on screen in the placeholder
                    // color so the shape of the date is still readable while it is being filled in.
                    const remainder = part.placeholder.slice(segmentProps.value.length);
                    const measuredText = `${segmentProps.value}${remainder}`;
                    const width = (measuredWidths[part.name] ?? measuredText.length * ESTIMATED_CHARACTER_WIDTH) + CARET_ALLOWANCE;

                    return (
                        <React.Fragment key={part.name}>
                            <Text
                                style={[style, styles.ph0, sizedToContent, styles.hiddenElementOutsideOfWindow, styles.visibilityHidden]}
                                accessible={false}
                                accessibilityElementsHidden
                                importantForAccessibility="no"
                                aria-hidden
                                onLayout={(event) => {
                                    const layoutWidth = event.nativeEvent.layout.width;
                                    if (!layoutWidth) {
                                        return;
                                    }

                                    setMeasuredWidths((previous) => (previous[part.name] === layoutWidth ? previous : {...previous, [part.name]: layoutWidth}));
                                }}
                            >
                                {measuredText}
                            </Text>
                            {/* A row, because the `flex: 1` the field hands its input takes its zero basis down the main
                            axis, and a column would leave the segment with no height of its own */}
                            <View style={[sizedToContent, styles.flexRow, StyleUtils.getWidthStyle(width)]}>
                                <RNTextInput
                                    // The field's own ref has to lead somewhere, and the year is where typing starts
                                    ref={mergeRefs(part.name === 'year' ? ref : undefined, (element: AnimatedTextInputRef | null) => setSegmentRef(part.name, element))}
                                    style={[style, styles.ph0, styles.w100]}
                                    value={segmentProps.value}
                                    onKeyPress={segmentProps.onKeyPress}
                                    onChangeText={segmentProps.onChangeText}
                                    onFocus={(event) => {
                                        segmentProps.onFocus();
                                        onFocus?.(event);
                                    }}
                                    onBlur={handleSegmentBlur}
                                    onPressOut={(event) => {
                                        segmentProps.onPressOut();
                                        onPressOut?.(event);
                                    }}
                                    accessibilityLabel={translate(`common.dateSegments.${part.name}`)}
                                    // A caret blinking inside a selected date would read as a place the next digit
                                    // goes, when it is the whole date that is about to be replaced
                                    caretHidden={isAllSelected}
                                    inputMode="numeric"
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    forwardedFSClass={forwardedFSClass}
                                    aria-describedby={ariaDescribedBy}
                                    aria-invalid={ariaInvalid}
                                />
                                {/* The digits already typed are repeated invisibly so the text flow puts the remaining mask
                            letters exactly where the input's own text ends, without measuring anything. */}
                                {!!remainder && (
                                    <Text
                                        style={[style, styles.ph0, styles.pAbsolute, styles.l0, styles.t0, styles.pointerEventsNone]}
                                        accessible={false}
                                        accessibilityElementsHidden
                                        importantForAccessibility="no"
                                        aria-hidden
                                    >
                                        <Text style={styles.opacity0}>{segmentProps.value}</Text>
                                        <Text style={{color: placeholderTextColor}}>{remainder}</Text>
                                    </Text>
                                )}
                            </View>
                            {!!part.separator && (
                                <Text
                                    style={[style, styles.ph0, styles.pointerEventsNone, sizedToContent, isAnyMaskShowing && {color: placeholderTextColor}]}
                                    accessible={false}
                                    accessibilityElementsHidden
                                    importantForAccessibility="no"
                                    aria-hidden
                                >
                                    {part.separator}
                                </Text>
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
            {/* A single input filled the row, so clicking anywhere in the field focused it. This takes the space left
            over after the day, so pressing it still lands somewhere useful rather than doing nothing. */}
            <PressableWithoutFeedback
                accessible={false}
                accessibilityLabel={translate('common.date')}
                onMouseDown={(event) => event.preventDefault()}
                onPress={focusFirstUnfilledSegment}
                sentryLabel="DateSegmentsInput-EmptySpace"
                style={[styles.flex1, styles.cursorText]}
            />
        </View>
    );
}

DateSegmentsInput.displayName = 'DateSegmentsInput';

export default DateSegmentsInput;
