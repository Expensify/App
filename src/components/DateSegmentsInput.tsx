/**
 * The inner part of the date field, rendering one input per date segment. It is registered as a `BaseTextInput` input
 * type, so it sits inside the same label, border and error chrome as any other text field.
 */
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
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

/** Safari clips the caret of an input sized to its text exactly, the same allowance TextInputMeasurement makes */
const SAFARI_CARET_ALLOWANCE = 2;

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
    // Mask letters are wider than the digits that replace them, so each segment is measured from the text it shows
    const [measuredWidths, setMeasuredWidths] = useState<Partial<Record<DateSegmentName, number>>>({});

    if (!dateSegmentsConfig) {
        return null;
    }

    const {mask, getSegmentProps, setSegmentRef, focusFirstUnfilledSegment, isSegmentElement, isAllSelected, onFieldBlur} = dateSegmentsConfig;

    const parts = getDateMaskParts(mask).map((part) => ({...part, segmentProps: getSegmentProps(part.name)}));
    const caretAllowance = isSafari() ? SAFARI_CARET_ALLOWANCE : 0;

    // A form hangs its validation on the field's blur, so it only runs once focus leaves the whole field
    const handleSegmentBlur: NonNullable<BaseTextInputProps['onBlur']> = (event) => {
        if ('relatedTarget' in event.nativeEvent && isSegmentElement(event.nativeEvent.relatedTarget)) {
            return;
        }

        onFieldBlur();
        onBlur?.(event);
    };

    // The separators belong to the mask, so they read as placeholder text while any of it is on screen
    const isAnyMaskShowing = parts.some((part) => part.segmentProps.value.length < part.placeholder.length);

    // The field's input style stretches across the row, which would spread the segments apart
    const sizedToContent = [styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.wAuto];

    return (
        <View
            style={[styles.flexRow, styles.flex1]}
            role="group"
            accessibilityLabel={accessibilityLabel}
        >
            {/* Sized to the date rather than to the row, so selecting it covers the digits and not the space after them */}
            <View style={styles.flexRow}>
                {/* Taking the field's vertical padding leaves exactly the line of text to fill */}
                {isAllSelected && (
                    <View style={[styles.pAbsolute, styles.l0, styles.t0, styles.r0, styles.b0, getVerticalPadding(style), styles.pointerEventsNone]}>
                        <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.textSelectionBackground)]} />
                    </View>
                )}
                {parts.map((part) => {
                    const segmentProps = part.segmentProps;
                    // The mask letters a half typed segment has not reached yet stay on screen, so the date keeps its shape
                    const remainder = part.placeholder.slice(segmentProps.value.length);
                    const measuredText = `${segmentProps.value}${remainder}`;
                    const width = (measuredWidths[part.name] ?? measuredText.length * CONST.CHARACTER_WIDTH) + caretAllowance;

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
                            {/* A row, since the input's `flex: 1` would take a column's height away */}
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
                                    // The next digit replaces the whole selected date, so a caret would mislead
                                    caretHidden={isAllSelected}
                                    inputMode="numeric"
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    forwardedFSClass={forwardedFSClass}
                                    aria-describedby={ariaDescribedBy}
                                    aria-invalid={ariaInvalid}
                                />
                                {/* The typed digits repeat invisibly so the mask letters start where the input's text ends */}
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
