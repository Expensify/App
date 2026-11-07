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

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type Social = {
    iconURL: Extract<ExpensifyIconName, 'Podcast' | 'Twitter' | 'Instagram' | 'Facebook' | 'Linkedin'>;
    link: string;
    label: TranslationPaths;
    sentryLabel: ValueOf<typeof CONST.SENTRY_LABEL.SOCIALS>;
};

const socialList: Social[] = [
    {
        iconURL: 'Podcast',
        link: CONST.SOCIALS.PODCAST,
        label: 'socials.podcast',
        sentryLabel: CONST.SENTRY_LABEL.SOCIALS.PODCAST,
    },
    {
        iconURL: 'Twitter',
        link: CONST.SOCIALS.TWITTER,
        label: 'socials.twitter',
        sentryLabel: CONST.SENTRY_LABEL.SOCIALS.TWITTER,
    },
    {
        iconURL: 'Instagram',
        link: CONST.SOCIALS.INSTAGRAM,
        label: 'socials.instagram',
        sentryLabel: CONST.SENTRY_LABEL.SOCIALS.INSTAGRAM,
    },
    {
        iconURL: 'Facebook',
        link: CONST.SOCIALS.FACEBOOK,
        label: 'socials.facebook',
        sentryLabel: CONST.SENTRY_LABEL.SOCIALS.FACEBOOK,
    },
    {
        iconURL: 'Linkedin',
        link: CONST.SOCIALS.LINKEDIN,
        label: 'socials.linkedin',
        sentryLabel: CONST.SENTRY_LABEL.SOCIALS.LINKEDIN,
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
                    sentryLabel={social.sentryLabel}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            src={icons[social.iconURL]}
                            height={variables.iconSizeLarge}
                            width={variables.iconSizeLarge}
                            fill={hovered || pressed ? theme.link : theme.text}
                        />
                    )}
                </PressableWithoutFeedback>
            ))}
        </View>
    );
}

export default Socials;
