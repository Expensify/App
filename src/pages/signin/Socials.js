import React from 'react';
import _ from 'underscore';
import {Pressable, Linking} from 'react-native';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
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

const Socials = () => (
    <Text>
        {_.map(socialsList, social => (
            <Pressable
                onPress={() => {
                    Linking.openURL(social.link);
                }}
                style={styles.pr1}
                key={social.link}
            >
                {({hovered}) => (
                    <Icon
                        src={social.iconURL}
                        height={variables.iconSizeLarge}
                        width={variables.iconSizeLarge}
                        fill={hovered ? themeColors.link : themeColors.textLight}
                    />
                )}
            </Pressable>
        ))}
    </Text>
);

Socials.displayName = 'Socials';

export default Socials;
