import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import stylePropTypes from '@styles/stylePropTypes';

const propTypes = {
    // use IconAsset as soon as it will be migrated to TS
    // eslint-disable-next-line react/forbid-prop-types
    src: PropTypes.any.isRequired,

    onPress: PropTypes.func,

    fill: PropTypes.string,

    tooltipText: PropTypes.string,

    style: stylePropTypes,

    hoverStyle: stylePropTypes,

    small: PropTypes.bool,

    shouldForceRenderingTooltipBelow: PropTypes.bool,
};

const defaultProps = {
    fill: 'white',
    onPress: () => {},
    style: {},
    hoverStyle: {},
    small: false,
    tooltipText: '',
    shouldForceRenderingTooltipBelow: false,
};

function IconButton({src, fill, onPress, style, hoverStyle, tooltipText, small, shouldForceRenderingTooltipBelow}) {
    const styles = useThemeStyles();
    return (
        <Tooltip
            text={tooltipText}
            shouldForceRenderingBelow={shouldForceRenderingTooltipBelow}
        >
            <PressableWithFeedback
                accessibilityLabel={tooltipText}
                onPress={onPress}
                style={[styles.videoIconButton, style]}
                hoverStyle={[styles.videoIconButtonHovered, hoverStyle]}
            >
                <Icon
                    src={src}
                    fill={fill}
                    small={small}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;
IconButton.displayName = 'IconButton';

export default IconButton;
