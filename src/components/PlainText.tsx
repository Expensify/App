import useTheme from '@hooks/useTheme';

import {containsOnlyCustomEmoji} from '@libs/EmojiUtils';

import type {FontUtilsType} from '@styles/utils/FontUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {AccessibilityProps, StyleProp, TextStyle} from 'react-native';
import type {PlainTextProps as PlainTextNativeProps, PlainTextStyle} from 'react-native-plain-text';

import {useContext} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {PlainText as PlainTextNative} from 'react-native-plain-text';

import {CustomStylesForChildrenContext} from './CustomStylesForChildrenProvider';

/**
 * A single-style text label rendered natively by `react-native-plain-text` (direct UILabel/TextView with C++
 * intrinsic-size measurement), bypassing RN's full Text layout pipeline.
 *
 * It intentionally mirrors `@components/Text` defaults (theme color, normal font size + line height, EXP_NEUE family,
 * `allowFontScaling={false}`, custom-emoji font swap) so eligible call sites can be swapped one-for-one.
 *
 * Constraints inherited from the native library:
 * - `children` must be a plain string: no JSX, no nested text, no mixed styles.
 * - No press handlers, no `selectable`, no `adjustsFontSizeToFit`, no `dataDetectorType`, no `onLayout`.
 * - `fsClass`/`fsKey` are not supported here (FullStory only reads them on core RN components like Text/View).
 */
type PlainTextProps = Pick<PlainTextNativeProps, 'numberOfLines' | 'ellipsizeMode' | 'testID' | 'nativeID'> &
    Pick<AccessibilityProps, 'accessibilityLabel' | 'accessibilityRole' | 'importantForAccessibility' | 'accessibilityState'> & {
        /** The text to display. Must be a plain string. */
        children: string;

        /** The color of the text */
        color?: string;

        /** The alignment of the text */
        textAlign?: TextStyle['textAlign'];

        /** The family of the font to use */
        family?: keyof FontUtilsType['fontFamily']['platform'];

        /** Should apply default line height */
        shouldUseDefaultLineHeight?: boolean;

        /** Additional styles */
        style?: StyleProp<TextStyle>;
    };

function PlainText({
    children,
    color,
    textAlign = 'left',
    family = 'EXP_NEUE',
    style,
    shouldUseDefaultLineHeight = true,
    numberOfLines,
    ellipsizeMode,
    testID,
    nativeID,
    accessibilityLabel,
    accessibilityRole,
    importantForAccessibility,
    accessibilityState,
}: PlainTextProps) {
    const theme = useTheme();
    const customStyle = useContext(CustomStylesForChildrenContext);

    const componentStyle: PlainTextStyle = {
        color: color ?? theme.text,
        fontSize: variables.fontSizeNormal,
        textAlign,
        ...FontUtils.fontFamily.platform[family],
        ...StyleSheet.flatten(style),
        ...StyleSheet.flatten(customStyle),
    };

    if (!componentStyle.lineHeight && componentStyle.fontSize === variables.fontSizeNormal && shouldUseDefaultLineHeight) {
        componentStyle.lineHeight = variables.fontSizeNormalHeight;
    }

    // Parity with Text: strings containing only custom emoji render with the custom emoji font.
    if (containsOnlyCustomEmoji(children.replace(CONST.UNICODE.LTR, ''))) {
        componentStyle.fontFamily = FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT?.fontFamily;
    }

    return (
        <PlainTextNative
            allowFontScaling={false}
            numberOfLines={numberOfLines}
            ellipsizeMode={ellipsizeMode}
            testID={testID}
            nativeID={nativeID}
            // On Android, TalkBack reads style metadata (e.g. color codes) along with text content.
            // Setting accessibilityLabel explicitly causes TalkBack to read only the label, skipping style info.
            accessibilityLabel={accessibilityLabel ?? (Platform.OS === 'android' && !!children ? children : undefined)}
            accessibilityRole={accessibilityRole}
            importantForAccessibility={importantForAccessibility}
            accessibilityState={accessibilityState}
            style={componentStyle}
        >
            {children}
        </PlainTextNative>
    );
}

export default PlainText;
export type {PlainTextProps};
