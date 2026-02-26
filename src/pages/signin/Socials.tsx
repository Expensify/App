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
import type {TranslationPaths} from '@src/languages/types';

type Social = {
    iconURL: Extract<ExpensifyIconName, 'Podcast' | 'Twitter' | 'Instagram' | 'Facebook' | 'Linkedin'>;
    link: string;
    label: TranslationPaths;
};

const socialList: Social[] = [
    {
        iconURL: 'Podcast',
        link: CONST.SOCIALS.PODCAST,
        label: 'socials.podcast',
    },
    {
        iconURL: 'Twitter',
        link: CONST.SOCIALS.TWITTER,
        label: 'socials.twitter',
    },
    {
        iconURL: 'Instagram',
        link: CONST.SOCIALS.INSTAGRAM,
        label: 'socials.instagram',
    },
    {
        iconURL: 'Facebook',
        link: CONST.SOCIALS.FACEBOOK,
        label: 'socials.facebook',
    },
    {
        iconURL: 'Linkedin',
        link: CONST.SOCIALS.LINKEDIN,
        label: 'socials.linkedin',
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
                    accessible
                    accessibilityRole={CONST.ROLE.LINK}
                    accessibilityLabel={translate(social.label)}
                    style={[styles.mr1, styles.mt1]}
                    shouldUseAutoHitSlop={false}
                    sentryLabel={`${CONST.SENTRY_LABEL.SOCIALS.LINK}-${social.iconURL}`}
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
