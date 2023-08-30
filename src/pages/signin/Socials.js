import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Link from '../../libs/actions/Link';
import Icon from '../../components/Icon';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';
import * as Expensicons from '../../components/Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import CONST from '../../CONST';

const socialsList = [
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
