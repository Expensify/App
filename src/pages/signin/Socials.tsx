import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type Social = {
    iconURL: Extract<ExpensifyIconName, 'Podcast' | 'Twitter' | 'Instagram' | 'Facebook' | 'Linkedin'>;
    link: string;
    accessibilityLabel: string;
};

const socialList: Social[] = [
    {
        iconURL: 'Podcast',
        link: CONST.SOCIALS.PODCAST,
        accessibilityLabel: CONST.ACCESSIBILITY_LABELS.PODCAST,
    },
    {
        iconURL: 'Twitter',
        link: CONST.SOCIALS.TWITTER,
        accessibilityLabel: CONST.ACCESSIBILITY_LABELS.TWITTER,
    },
    {
        iconURL: 'Instagram',
        link: CONST.SOCIALS.INSTAGRAM,
        accessibilityLabel: CONST.ACCESSIBILITY_LABELS.INSTAGRAM,
    },
    {
        iconURL: 'Facebook',
        link: CONST.SOCIALS.FACEBOOK,
        accessibilityLabel: CONST.ACCESSIBILITY_LABELS.FACEBOOK,
    },
    {
        iconURL: 'Linkedin',
        link: CONST.SOCIALS.LINKEDIN,
        accessibilityLabel: CONST.ACCESSIBILITY_LABELS.LINKEDIN,
    },
];

function Socials() {
    const theme = useTheme();
    const styles = useThemeStyles();
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
                    style={[styles.mr1, styles.mt1]}
                    shouldUseAutoHitSlop={false}
                    accessibilityRole={CONST.ROLE.LINK}
                    accessibilityLabel={social.accessibilityLabel}
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
