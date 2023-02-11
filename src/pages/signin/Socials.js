import React from 'react';
import _ from 'underscore';
import {Pressable, Linking} from 'react-native';

import Icon from '../../components/Icon';
import Text from '../../components/Text';

import * as Expensicons from '../../components/Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';

const socialsList = [
    {
        iconURL: Expensicons.Pencil,
        link: 'https://we.are.expensify.com/podcast',
    },
    {
        iconURL: Expensicons.Apple,
        link: 'https://www.twitter.com/expensify',
    },
    {
        iconURL: Expensicons.Android,
        link: 'http://www.instagram.com/expensify',
    },
    {
        iconURL: Expensicons.Chair,
        link: 'https://www.facebook.com/expensify',
    },
    {
        iconURL: Expensicons.CreditCard,
        link: 'http://www.linkedin.com/company/expensify',
    },
];

const Socials = () => (
    <>
        <Text>
            {_.map(socialsList, social => (
                <Pressable
                    onPress={() => {
                        Linking.openURL(social.link);
                    }}
                    style={styles.pr2}
                    key={social.link}
                >
                    {({hovered}) => (
                        <Icon src={social.iconURL} height={18} width={18} fill={hovered ? themeColors.link : themeColors.textLight} />
                    )}
                </Pressable>
            ))}
        </Text>

    </>
);

Socials.displayName = 'Socials';

export default Socials;
