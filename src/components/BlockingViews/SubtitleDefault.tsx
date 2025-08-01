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
    shouldShowLink,
    onLinkPress,
    linkKey,
}: {
    subtitle?: string;
    subtitleStyle?: StyleProp<TextStyle>;
    shouldShowLink: boolean;
    onLinkPress: () => void;
    linkKey: TranslationPaths;
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
            {shouldShowLink ? (
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
