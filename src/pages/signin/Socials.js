import React from 'react';
import _ from 'underscore';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import * as Expensicons from '../../components/Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import CONST from '../../CONST';
import Hoverable from '../../components/Hoverable';
import TextLink from '../../components/TextLink';

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
        {_.map(socialsList, (social) => (
            <Hoverable key={social.link}>
                {(hovered) => (
                    <TextLink
                        style={styles.pr1}
                        href={social.link}
                    >
                        <Icon
                            src={social.iconURL}
                            height={variables.iconSizeLarge}
                            width={variables.iconSizeLarge}
                            fill={hovered ? themeColors.link : themeColors.textLight}
                        />
                    </TextLink>
                )}
            </Hoverable>
        ))}
    </Text>
);

Socials.displayName = 'Socials';

export default Socials;
