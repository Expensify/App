import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import AutoEmailLink from '@components/AutoEmailLink';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

function BlockingViewSubtitle({
    subtitle,
    subtitleStyle,
    onLinkPress = () => {},
    linkTranslationKey,
}: {
    /** Subtitle message below the title */
    subtitle: string;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Translation key for the link text displayed below the subtitle */
    linkTranslationKey?: TranslationPaths;
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
            {!!linkTranslationKey && (
                <TextLink
                    onPress={onLinkPress}
                    style={[styles.link, styles.mt2]}
                >
                    {translate(linkTranslationKey)}
                </TextLink>
            )}
        </>
    );
}

export default BlockingViewSubtitle;
