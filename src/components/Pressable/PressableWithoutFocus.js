import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import GenericPressable from './GenericPressable';
import genericPressablePropTypes from './GenericPressable/PropTypes';
import StylePropType from '../../styles/stylePropTypes';

const propTypes = {
    /** Element that should be clickable  */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,

    /** Callback for onPress event */
    onPress: PropTypes.func.isRequired,

    /** Callback for onLongPress event */
    onLongPress: PropTypes.func,

    /** Styles that should be passed to touchable container */
    style: StylePropType,

    /** Proptypes of pressable component used for implementation */
    ...genericPressablePropTypes.pressablePropTypes,
};

const defaultProps = {
    style: [],
    onLongPress: undefined,
};

/**
 * This component prevents the tapped element from capturing focus.
 * We need to blur this element when clicked as it opens modal that implements focus-trapping.
 * When the modal is closed it focuses back to the last active element.
 * Therefore it shifts the element to bring it back to focus.
 * https://github.com/Expensify/App/issues/6806
 */
class PressableWithoutFocus extends React.Component {
    constructor(props) {
        super(props);
        this.pressAndBlur = this.pressAndBlur.bind(this);
    }

    pressAndBlur() {
        this.pressableRef.blur();
        this.props.onPress();
    }

    render() {
        const restProps = _.omit(this.props, ['children', 'onPress', 'onLongPress', 'style']);
        return (
            <GenericPressable
                onPress={this.pressAndBlur}
                onLongPress={this.props.onLongPress}
                ref={(el) => (this.pressableRef = el)}
                style={this.props.style}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restProps}
            >
                {this.props.children}
            </GenericPressable>
        );
    }
}

PressableWithoutFocus.propTypes = propTypes;
PressableWithoutFocus.defaultProps = defaultProps;

export default PressableWithoutFocus;
