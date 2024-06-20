import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type Social = {
    iconURL: IconAsset;
    link: string;
};

const socialList: Social[] = [
    {
        iconURL: Expensicons.Podcast,
        link: CONST.SOCIALS.PODCAST,
    },
    {
        iconURL: Expensicons.Twitter,
        link: CONST.SOCIALS.TWITTER,
    },
    {
        iconURL: Expensicons.Instagram,
        link: CONST.SOCIALS.INSTAGRAM,
    },
    {
        iconURL: Expensicons.Facebook,
        link: CONST.SOCIALS.FACEBOOK,
    },
    {
        iconURL: Expensicons.Linkedin,
        link: CONST.SOCIALS.LINKEDIN,
    },
];

function Socials() {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.flexWrap]}>
            {socialList.map((social: Social) => (
                <PressableWithoutFeedback
                    key={social.link}
                    href={social.link}
                    onPress={(e) => {
                        e?.preventDefault();
                        Link.openExternalLink(social.link);
                    }}
                    accessible={false}
                    style={[styles.mr1, styles.mt1]}
                    shouldUseAutoHitSlop={false}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            src={social.iconURL}
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

Socials.displayName = 'Socials';

export default Socials;
