import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import AutoEmailLink from '@components/AutoEmailLink';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

function SubtitleDefault({
    subtitle,
    subtitleStyle,
    onLinkPress = () => {},
    linkKey,
}: {
    /** Subtitle message below the title */
    subtitle?: string;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Link message below the subtitle */
    linkKey?: TranslationPaths;
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            {!!subtitle && (
                <AutoEmailLink
                    style={[styles.textAlignCenter, subtitleStyle]}
                    text={subtitle}
                />
            )}
            {linkKey ? (
                <TextLink
                    onPress={onLinkPress}
                    style={[styles.link, styles.mt2]}
                >
                    {translate(linkKey)}
                </TextLink>
            ) : null}
        </>
    );
}

SubtitleDefault.displayName = 'SubtitleDefault';

export default SubtitleDefault;
