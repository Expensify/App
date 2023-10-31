import _ from 'lodash';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import stylePropTypes from '@styles/stylePropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

const propTypes = {
    /** Optional style for container element that will be merged into the default styling for the offline indicator */
    style: stylePropTypes,

    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles: stylePropTypes,
};

const defaultProps = {
    style: [],
    containerStyles: [],
};

function OfflineIndicator(props) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const containerStyles = useMemo(() => {
        if (!_.isEmpty(props.containerStyles)) {
            return containerStyles;
        }
        return isSmallScreenWidth ? styles.offlineIndicatorMobile : styles.offlineIndicator;
    }, [isSmallScreenWidth, props.containerStyles, styles.offlineIndicator, styles.offlineIndicatorMobile]);

    if (!isOffline) {
        return null;
    }

    return (
        <View style={[containerStyles, styles.flexRow, styles.alignItemsCenter, ...StyleUtils.parseStyleAsArray(props.style)]}>
            <Icon
                src={Expensicons.OfflineCloud}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>{translate('common.youAppearToBeOffline')}</Text>
        </View>
    );
}

OfflineIndicator.propTypes = propTypes;
OfflineIndicator.defaultProps = defaultProps;
OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;
