import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SocialTranslationKey = 'podcast' | 'twitter' | 'instagram' | 'facebook' | 'linkedin';

type Social = {
    iconURL: Extract<ExpensifyIconName, 'Podcast' | 'Twitter' | 'Instagram' | 'Facebook' | 'Linkedin'>;
    link: string;
    translationKey: SocialTranslationKey;
};

const socialList: Social[] = [
    {
        iconURL: 'Podcast',
        link: CONST.SOCIALS.PODCAST,
        translationKey: 'podcast',
    },
    {
        iconURL: 'Twitter',
        link: CONST.SOCIALS.TWITTER,
        translationKey: 'twitter',
    },
    {
        iconURL: 'Instagram',
        link: CONST.SOCIALS.INSTAGRAM,
        translationKey: 'instagram',
    },
    {
        iconURL: 'Facebook',
        link: CONST.SOCIALS.FACEBOOK,
        translationKey: 'facebook',
    },
    {
        iconURL: 'Linkedin',
        link: CONST.SOCIALS.LINKEDIN,
        translationKey: 'linkedin',
    },
];

function Socials() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Podcast', 'Twitter', 'Instagram', 'Facebook', 'Linkedin']);

    return (
        <View style={[styles.flexRow, styles.flexWrap]}>
            {socialList.map((social: Social) => (
                <PressableWithoutFeedback
                    key={social.link}
                    href={social.link}
                    onPress={(e) => {
                        e?.preventDefault();
                        openExternalLink(social.link);
                    }}
                    accessibilityRole={CONST.ROLE.LINK}
                    accessibilityLabel={translate(`socials.${social.translationKey}`)}
                    style={[styles.mr1, styles.mt1]}
                    shouldUseAutoHitSlop={false}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            src={icons[social.iconURL]}
                            height={variables.iconSizeLarge}
                            width={variables.iconSizeLarge}
                            fill={hovered || pressed ? theme.link : theme.textLight}
                        />
                    )}
                </PressableWithoutFeedback>
            ))}
        </View>
    );
}

export default Socials;
