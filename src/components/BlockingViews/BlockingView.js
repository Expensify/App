import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import Icon from '../Icon';
import Text from '../Text';
import themeColors from '../../styles/themes/default';
import TextLink from '../TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import AutoEmailLink from '../AutoEmailLink';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Expensicon for the page */
    icon: PropTypes.func.isRequired,

    /** Color for the icon (should be from theme) */
    iconColor: PropTypes.string,

    /** Title message below the icon */
    title: PropTypes.string.isRequired,

    /** Subtitle message below the title */
    subtitle: PropTypes.string,

    /** Link message below the subtitle */
    linkKey: PropTypes.string,

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink: PropTypes.bool,

    /** The custom icon width */
    iconWidth: PropTypes.number,

    /** The custom icon height */
    iconHeight: PropTypes.number,

    /** Function to call when pressing the navigation link */
    onLinkPress: PropTypes.func,
};

const defaultProps = {
    iconColor: themeColors.offline,
    subtitle: '',
    shouldShowLink: false,
    linkKey: 'notFound.goBackHome',
    iconWidth: variables.iconSizeSuperLarge,
    iconHeight: variables.iconSizeSuperLarge,
    onLinkPress: () => Navigation.dismissModal(),
};

function BlockingView(props) {
    const {translate} = useLocalize();
    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
            <Icon
                src={props.icon}
                fill={props.iconColor}
                width={props.iconWidth}
                height={props.iconHeight}
            />
            <Text style={[styles.notFoundTextHeader]}>{props.title}</Text>
            <AutoEmailLink
                style={[styles.textAlignCenter]}
                text={props.subtitle}
            />
            {props.shouldShowLink ? (
                <TextLink
                    onPress={props.onLinkPress}
                    style={[styles.link, styles.mt2]}
                >
                    {translate(props.linkKey)}
                </TextLink>
            ) : null}
        </View>
    );
}

BlockingView.propTypes = propTypes;
BlockingView.defaultProps = defaultProps;
BlockingView.displayName = 'BlockingView';

export default BlockingView;
