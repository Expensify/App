import React from 'react';
import PropTypes from 'prop-types';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import Icon from '../Icon';
import CONST from '../../CONST';
import Hoverable from '../Hoverable';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    src: PropTypes.any.isRequired,

    onPress: PropTypes.func,

    fill: PropTypes.string,

    accessibilityLabel: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types,
    style: PropTypes.object,
};

const defaultProps = {
    fill: 'white',
    onPress: () => {},
    style: {},
};

function IconButton({src, fill, onPress, style, accessibilityLabel}) {
    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithoutFeedback
                    accessibilityLabel={accessibilityLabel}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    onPress={onPress}
                    style={[{padding: 5, borderRadius: 4, backgroundColor: isHovered ? '#085239' : 'transparent'}, style]}
                >
                    <Icon
                        src={src}
                        fill={fill}
                    />
                </PressableWithoutFeedback>
            )}
        </Hoverable>
    );
}

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;
IconButton.displayName = 'IconButton';

export default IconButton;
