import PropTypes from 'prop-types';
import React from 'react';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    src: PropTypes.any.isRequired,

    onPress: PropTypes.func,

    fill: PropTypes.string,

    tooltipText: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types,
    style: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    small: PropTypes.bool,

    forceRenderingTooltipBelow: PropTypes.bool,
};

const defaultProps = {
    fill: 'white',
    onPress: () => {},
    style: {},
    hoverStyle: {},
    small: false,
    tooltipText: '',
    forceRenderingTooltipBelow: false,
};

function IconButton({src, fill, onPress, style, hoverStyle, tooltipText, small, forceRenderingTooltipBelow}) {
    const styles = useThemeStyles();
    return (
        <Tooltip
            text={tooltipText}
            forceRenderingBelow={forceRenderingTooltipBelow}
        >
            <Hoverable>
                {(isHovered) => (
                    <PressableWithoutFeedback
                        accessibilityLabel={tooltipText}
                        onPress={onPress}
                        style={[styles.videoIconButton, isHovered && [styles.videoIconButtonHovered, hoverStyle], style]}
                    >
                        <Icon
                            src={src}
                            fill={fill}
                            small={small}
                        />
                    </PressableWithoutFeedback>
                )}
            </Hoverable>
        </Tooltip>
    );
}

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;
IconButton.displayName = 'IconButton';

export default IconButton;
