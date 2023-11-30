import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import compose from '@libs/compose';
import stylePropTypes from '@styles/stylePropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Optional styles for container element that will override the default styling for the offline indicator */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Optional styles for the container */
    style: stylePropTypes,

    /** Is the window width narrow, like on a mobile device */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
    style: [],
};

function OfflineIndicator(props) {
    const styles = useThemeStyles();

    const computedStyles = useMemo(() => {
        if (props.containerStyles.length) {
            return props.containerStyles;
        }
        return props.isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
    }, [props.containerStyles, props.isSmallScreenWidth, styles.offlineIndicatorMobile, styles.offlineIndicator]);

    if (!props.network.isOffline) {
        return null;
    }

    return (
        <View style={[computedStyles, styles.flexRow, styles.alignItemsCenter, ...StyleUtils.parseStyleAsArray(props.style)]}>
            <Icon
                src={Expensicons.OfflineCloud}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>{props.translate('common.youAppearToBeOffline')}</Text>
        </View>
    );
}

OfflineIndicator.propTypes = propTypes;
OfflineIndicator.defaultProps = defaultProps;
OfflineIndicator.displayName = 'OfflineIndicator';

export default compose(withWindowDimensions, withLocalize, withNetwork())(OfflineIndicator);
