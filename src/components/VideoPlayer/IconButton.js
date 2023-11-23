import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import styles from '@styles/styles';
import CONST from '@src/CONST';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    src: PropTypes.any.isRequired,

    onPress: PropTypes.func,

    fill: PropTypes.string,

    tooltipText: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types,
    style: PropTypes.object,

    small: PropTypes.bool,

    forceRenderingTooltipBelow: PropTypes.bool,
};

const defaultProps = {
    fill: 'white',
    onPress: () => {},
    style: {},
    small: false,
    tooltipText: '',
    forceRenderingTooltipBelow: false,
};

function IconButton({src, fill, onPress, style, tooltipText, small, forceRenderingTooltipBelow}) {
    return (
        <Tooltip
            text={tooltipText}
            forceRenderingBelow={forceRenderingTooltipBelow}
        >
            <PressableWithoutFeedback
                accessibilityLabel={tooltipText}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                onPress={onPress}
                style={[styles.videoIconButton, style]}
            >
                <Icon
                    src={src}
                    fill={fill}
                    small={small}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;
IconButton.displayName = 'IconButton';

export default IconButton;
