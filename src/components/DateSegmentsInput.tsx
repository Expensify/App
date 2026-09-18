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

function DateSegmentsInput({dateSegmentsConfig, style, placeholderTextColor, disabled, onPressOut, forwardedFSClass, ref}: BaseTextInputProps) {
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

    useEffect(() => {
        if (!focusRequest || focusRequest.version === appliedFocusVersionRef.current) {
            return;
        }

        appliedFocusVersionRef.current = focusRequest.version;
        segmentRefs.current[focusRequest.name]?.focus();
    }, [focusRequest]);

    useEffect(() => () => clearTimeout(blurTimeoutRef.current), []);

    if (!dateSegmentsConfig) {
        return null;
    }

    const {mask, getSegmentProps, onFieldBlur} = dateSegmentsConfig;

    const handleSegmentBlur = () => {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = setTimeout(onFieldBlur, 0);
    };

    // The segments stretch down the row as a single input would, so the padding they inherit lands their text in the
    // same place as any other text field's
    return (
        <View style={[styles.flexRow, styles.flex1]}>
            {getDateMaskParts(mask).map((part) => {
                const segmentProps = getSegmentProps(part.name);
                const measuredText = segmentProps.value || part.placeholder;
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
                            style={[style, NO_HORIZONTAL_PADDING, SIZED_TO_CONTENT, {width}]}
                            value={segmentProps.value}
                            placeholder={part.placeholder}
                            placeholderTextColor={placeholderTextColor}
                            onKeyPress={segmentProps.onKeyPress}
                            onChangeText={segmentProps.onChangeText}
                            onFocus={() => {
                                clearTimeout(blurTimeoutRef.current);
                                segmentProps.onFocus();
                            }}
                            onBlur={handleSegmentBlur}
                            onPressOut={onPressOut}
                            accessibilityLabel={translate(`common.dateSegments.${part.name}`)}
                            inputMode="numeric"
                            disabled={disabled}
                            forwardedFSClass={forwardedFSClass}
                        />
                        {!!part.separator && <Text style={[style, NO_HORIZONTAL_PADDING, styles.pointerEventsNone, SIZED_TO_CONTENT]}>{part.separator}</Text>}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

DateSegmentsInput.displayName = 'DateSegmentsInput';

export default DateSegmentsInput;
