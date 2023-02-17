import React from 'react';
import _ from 'underscore';
import {Pressable, Linking} from 'react-native';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import * as Expensicons from '../../components/Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const socialsList = [
    {
        iconURL: Expensicons.Podcast,
        link: 'https://we.are.expensify.com/podcast',
    },
    {
        iconURL: Expensicons.Twitter,
        link: 'https://www.twitter.com/expensify',
    },
    {
        iconURL: Expensicons.Instagram,
        link: 'http://www.instagram.com/expensify',
    },
    {
        iconURL: Expensicons.Facebook,
        link: 'https://www.facebook.com/expensify',
    },
    {
        iconURL: Expensicons.Linkedin,
        link: 'http://www.linkedin.com/company/expensify',
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
                    <Icon src={social.iconURL} height={variables.iconSizeLarge} width={variables.iconSizeLarge} fill={hovered ? themeColors.link : themeColors.textLight} />
                )}
            </Pressable>
        ))}
    </Text>
);

Socials.displayName = 'Socials';

export default Socials;
