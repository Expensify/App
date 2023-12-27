import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import sourcePropTypes from '@components/Image/sourcePropTypes';
import useThemeStyles from '@hooks/useThemeStyles';

const iconSectionPropTypes = {
    icon: sourcePropTypes,
    IconComponent: PropTypes.IconComponent,
    iconContainerStyles: PropTypes.iconContainerStyles,
};

const defaultIconSectionPropTypes = {
    icon: null,
    IconComponent: null,
    iconContainerStyles: [],
};

function IconSection({icon, IconComponent, iconContainerStyles}) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd, ...iconContainerStyles]}>
            {Boolean(icon) && (
                <Icon
                    src={icon}
                    height={68}
                    width={68}
                />
            )}
            {Boolean(IconComponent) && <IconComponent />}
        </View>
    );
}

IconSection.displayName = 'IconSection';
IconSection.propTypes = iconSectionPropTypes;
IconSection.defaultProps = defaultIconSectionPropTypes;

export default IconSection;
