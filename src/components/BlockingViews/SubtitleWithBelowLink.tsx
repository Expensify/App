import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import AutoEmailLink from '@components/AutoEmailLink';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

function SubtitleWithBelowLink({
    subtitle,
    subtitleStyle,
    subtitleKeyBelowLink,
    onLinkPress,
    linkKey,
}: {
    /** Subtitle message below the title */
    subtitle?: string;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Message below the link message */
    subtitleKeyBelowLink?: TranslationPaths | '';

    /** Function to call when pressing the navigation link */
    onLinkPress?: () => void;

    /** Link message below the subtitle */
    linkKey?: TranslationPaths;
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            <Text style={[styles.textAlignCenter]}>
                {!!subtitle && (
                    <AutoEmailLink
                        style={[styles.textAlignCenter, subtitleStyle]}
                        text={subtitle}
                    />
                )}
                <TextLink
                    onPress={onLinkPress}
                    style={[styles.link, styles.mt2, styles.textAlignCenter]}
                >
                    {` ${translate(linkKey)}`}
                </TextLink>
            </Text>
            <AutoEmailLink
                style={[styles.textAlignCenter, subtitleStyle, styles.mt4]}
                text={translate(subtitleKeyBelowLink)}
            />
        </>
    );
}

SubtitleWithBelowLink.displayName = 'SubtitleWithBelowLink';

export default SubtitleWithBelowLink;
