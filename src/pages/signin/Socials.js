import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

const socialsList = [
    {
        iconURL: Expensicons.Podcast,
        link: CONST.SOCIALS.PODCAST,
        iconName: 'SocialPodcast',
    },
    {
        iconURL: Expensicons.Twitter,
        link: CONST.SOCIALS.TWITTER,
        iconName: 'SocialTwitter',
    },
    {
        iconURL: Expensicons.Instagram,
        link: CONST.SOCIALS.INSTAGRAM,
        iconName: 'SocialInstagram',
    },
    {
        iconURL: Expensicons.Facebook,
        link: CONST.SOCIALS.FACEBOOK,
        iconName: 'SocialFacebook',
    },
    {
        iconURL: Expensicons.Linkedin,
        link: CONST.SOCIALS.LINKEDIN,
        iconName: 'SocialLinkedin',
    },
];

function Socials() {
    return (
        <View style={[styles.flexRow, styles.flexWrap]}>
            {_.map(socialsList, (social) => (
                <PressableWithoutFeedback
                    key={social.link}
                    href={social.link}
                    onPress={(e) => {
                        e.preventDefault();
                        Link.openExternalLink(social.link);
                    }}
                    accessible={false}
                    style={[styles.mr1, styles.mt1]}
                    shouldUseAutoHitSlop={false}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            name={social.iconName}
                            src={social.iconURL}
                            height={variables.iconSizeLarge}
                            width={variables.iconSizeLarge}
                            fill={hovered || pressed ? themeColors.link : themeColors.textLight}
                        />
                    )}
                </PressableWithoutFeedback>
            ))}
        </View>
    );
}

Socials.displayName = 'Socials';

export default Socials;
