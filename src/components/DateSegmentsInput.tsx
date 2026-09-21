/**
 * The inner part of the date field, rendering one input per date segment instead of one input for the whole date. It is
 * registered as a `BaseTextInput` input type, so it sits inside the same label, border and error chrome as any other
 * text field.
 *
 * One input per segment is what makes the caret a non issue: moving between segments is an ordinary focus change, so
 * nothing here has to reason about where a caret sits inside a longer string.
 */
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateMaskParts} from '@libs/DateInputMaskUtils';
import type {DateSegmentName} from '@libs/DateInputMaskUtils';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {AnimatedTextInputRef} from './RNTextInput';
import type {BaseTextInputProps} from './TextInput/BaseTextInput/types';

import {PressableWithoutFeedback} from './Pressable';
import RNTextInput from './RNTextInput';
import Text from './Text';

/** Leaves the caret somewhere to sit, since a segment sized to its text exactly would clip it at the end */
const CARET_ALLOWANCE = 1;

/**
 * Only the horizontal padding is dropped. The vertical padding that the field hands down is what sits the text below
 * the floating label, so the segments keep it and stay in line with any other text field.
 */
const NO_HORIZONTAL_PADDING = {paddingHorizontal: 0} as const;

/** Used until the real text has been measured, so the first paint is close rather than collapsed */
const ESTIMATED_CHARACTER_WIDTH = CONST.CHARACTER_WIDTH;

/**
 * The style the field hands down stretches its input across the whole row, which would spread the segments evenly and
 * make each separator as wide as the field. Everything here is sized to its own text instead, so the date reads as one
 * run of text.
 */
const SIZED_TO_CONTENT = {flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: 'auto'} as const;

/** Holds a copy of a segment's text purely to be measured, so it must not take part in the layout it is measuring */
const MEASURED_OFF_LAYOUT = {position: 'absolute', opacity: 0} as const;

/** Sits over the segment's own input, which is why the input can show the typed digits alone */
const REMAINDER_OVERLAY = {position: 'absolute', left: 0, top: 0} as const;

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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const segmentRefs = useRef<Partial<Record<DateSegmentName, AnimatedTextInputRef | null>>>({});
    // Focus moves between segments as one blur followed by one focus, so leaving the field can only be told apart from
    // moving within it once the next focus has had its chance to arrive.
    const blurTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const appliedFocusVersionRef = useRef(0);
    // The mask letters are wider than the digits that replace them, so a fixed width would either clip the placeholder
    // or leave a gap once the segment is filled in. Each one is measured from the text it is currently showing.
    const [measuredWidths, setMeasuredWidths] = useState<Partial<Record<DateSegmentName, number>>>({});

    const focusRequest = dateSegmentsConfig?.focusRequest;

    /**
     * Arriving at a segment rests the caret after the digits already in it, rather than wherever the browser last left
     * the caret there, so a half typed month reads as 02 and not 0 followed by a caret and a 2.
     */
    const focusSegment = (name: DateSegmentName) => {
        const element = segmentRefs.current[name];
        element?.focus();

        const caretPosition = element?.value?.length ?? 0;
        element?.setSelectionRange?.(caretPosition, caretPosition);
    };

    useEffect(() => {
        if (!focusRequest || focusRequest.version === appliedFocusVersionRef.current) {
            return;
        }

        appliedFocusVersionRef.current = focusRequest.version;
        focusSegment(focusRequest.name);
    }, [focusRequest]);

    useEffect(() => () => clearTimeout(blurTimeoutRef.current), []);

    if (!dateSegmentsConfig) {
        return null;
    }

    const {mask, getSegmentProps, onFieldBlur} = dateSegmentsConfig;

    /**
     * Where a press on the field itself lands. The segments are read from the inputs rather than from this render, so
     * a press arriving as the field is being cleared aims at what the field holds by then and not a moment earlier.
     */
    const focusFirstUnfilledSegment = () => {
        const parts = getDateMaskParts(mask);
        const target = parts.find((part) => (segmentRefs.current[part.name]?.value?.length ?? 0) < part.placeholder.length) ?? parts.at(-1);

        if (!target) {
            return;
        }

        focusSegment(target.name);
    };

    /**
     * The field's own blur handler is what a form hangs its validation on, so it has to wait for the whole field to be
     * left rather than run on every hop between segments.
     */
    const handleSegmentBlur: NonNullable<BaseTextInputProps['onBlur']> = (event) => {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = setTimeout(() => {
            onFieldBlur();
            onBlur?.(event);
        }, 0);
    };

    // The segments stretch down the row as a single input would, so the padding they inherit lands their text in the
    // same place as any other text field's
    return (
        <View
            style={[styles.flexRow, styles.flex1]}
            role="group"
            accessibilityLabel={accessibilityLabel}
        >
            {getDateMaskParts(mask).map((part) => {
                const segmentProps = getSegmentProps(part.name);
                // The mask letters a half typed segment has not reached yet, which stay on screen in the placeholder
                // color so the shape of the date is still readable while it is being filled in.
                const remainder = part.placeholder.slice(segmentProps.value.length);
                const measuredText = `${segmentProps.value}${remainder}`;
                const width = (measuredWidths[part.name] ?? measuredText.length * ESTIMATED_CHARACTER_WIDTH) + CARET_ALLOWANCE;

                return (
                    <React.Fragment key={part.name}>
                        <Text
                            style={[style, NO_HORIZONTAL_PADDING, SIZED_TO_CONTENT, MEASURED_OFF_LAYOUT]}
                            onLayout={(event) => {
                                const layoutWidth = event.nativeEvent.layout.width;

                                setMeasuredWidths((previous) => (previous[part.name] === layoutWidth ? previous : {...previous, [part.name]: layoutWidth}));
                            }}
                        >
                            {measuredText}
                        </Text>
                        <View style={[SIZED_TO_CONTENT, {width}]}>
                            <RNTextInput
                                ref={(element: AnimatedTextInputRef | null) => {
                                    segmentRefs.current[part.name] = element;

                                    // The field's own ref has to lead somewhere, and the year is where typing starts
                                    if (part.name !== 'year') {
                                        return;
                                    }
                                    if (typeof ref === 'function') {
                                        ref(element);
                                    } else if (ref && 'current' in ref) {
                                        // eslint-disable-next-line no-param-reassign
                                        ref.current = element;
                                    }
                                }}
                                style={[style, NO_HORIZONTAL_PADDING, styles.w100]}
                                value={segmentProps.value}
                                onKeyPress={segmentProps.onKeyPress}
                                onChangeText={segmentProps.onChangeText}
                                onFocus={(event) => {
                                    clearTimeout(blurTimeoutRef.current);
                                    segmentProps.onFocus();
                                    onFocus?.(event);
                                }}
                                onBlur={handleSegmentBlur}
                                onPressOut={onPressOut}
                                accessibilityLabel={translate(`common.dateSegments.${part.name}`)}
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
                                <Text style={[style, NO_HORIZONTAL_PADDING, REMAINDER_OVERLAY, styles.pointerEventsNone]}>
                                    <Text style={styles.opacity0}>{segmentProps.value}</Text>
                                    <Text style={{color: placeholderTextColor}}>{remainder}</Text>
                                </Text>
                            )}
                        </View>
                        {!!part.separator && <Text style={[style, NO_HORIZONTAL_PADDING, styles.pointerEventsNone, SIZED_TO_CONTENT]}>{part.separator}</Text>}
                    </React.Fragment>
                );
            })}
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
