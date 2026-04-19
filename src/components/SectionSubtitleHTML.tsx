import type {ComponentProps} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import RenderHTML from './RenderHTML';

type SectionSubtitleHTMLProps = {
    /** Subtitle HTML content */
    html: string;

    /** Whether the subtitle text should be muted */
    subtitleMuted?: boolean;

    /** Optional link press handler */
    onLinkPress?: ComponentProps<typeof RenderHTML>['onLinkPress'];

    /** Optional wrapper style */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function SectionSubtitleHTML({html, subtitleMuted = false, onLinkPress, wrapperStyle}: SectionSubtitleHTMLProps) {
    const styles = useThemeStyles();
    const shouldWrapWithMutedText = subtitleMuted && !/<\s*muted-text(?:-[a-z]+)?(?:\s|>)/.test(html);
    const subtitleHTML = shouldWrapWithMutedText ? `<muted-text>${html}</muted-text>` : html;

    return (
        <View style={[styles.flexRow, styles.w100, styles.mt2, styles.renderHTML, wrapperStyle]}>
            <RenderHTML
                html={subtitleHTML}
                onLinkPress={onLinkPress}
            />
        </View>
    );
}

export default SectionSubtitleHTML;
