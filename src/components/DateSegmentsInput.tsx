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

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {AnimatedTextInputRef} from './RNTextInput';
import type {BaseTextInputProps} from './TextInput/BaseTextInput/types';

import RNTextInput from './RNTextInput';
import Text from './Text';

/** The mask letters are wider than the digits that replace them, so a segment is sized to hold its placeholder */
const SEGMENT_PADDING = CONST.CHARACTER_WIDTH / 2;

/**
 * The style the field hands down stretches its input to fill the row, which would spread three of them evenly across
 * it. Each segment is sized to its own digits instead, so the date reads as one run of text.
 */
const SIZED_TO_CONTENT = {flexGrow: 0, flexShrink: 0, flexBasis: 'auto'} as const;

function DateSegmentsInput({dateSegmentsConfig, style, placeholderTextColor, disabled, onPressOut, forwardedFSClass, ref}: BaseTextInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const segmentRefs = useRef<Partial<Record<DateSegmentName, AnimatedTextInputRef | null>>>({});
    // Focus moves between segments as one blur followed by one focus, so leaving the field can only be told apart from
    // moving within it once the next focus has had its chance to arrive.
    const blurTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const appliedFocusVersionRef = useRef(0);

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

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
            {getDateMaskParts(mask).map((part) => {
                const segmentProps = getSegmentProps(part.name);

                return (
                    <React.Fragment key={part.name}>
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
                            style={[style, styles.p0, SIZED_TO_CONTENT, {width: part.placeholder.length * CONST.CHARACTER_WIDTH + SEGMENT_PADDING}]}
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
                        {!!part.separator && <Text style={[style, styles.p0, styles.pointerEventsNone, SIZED_TO_CONTENT]}>{part.separator}</Text>}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

DateSegmentsInput.displayName = 'DateSegmentsInput';

export default DateSegmentsInput;
