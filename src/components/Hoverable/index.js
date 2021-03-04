import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './HoverablePropTypes';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
class Hoverable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false,
        };
        this.toggleHoverState = this.toggleHoverState.bind(this);
    }

    /**
     * Toggles the hover state of this component and executes the callback provided in props for that state transition.
     */
    toggleHoverState() {
        if (this.state.isHovered) {
            this.props.onHoverOut();
            this.setState({isHovered: false});
        } else {
            this.props.onHoverIn();
            this.setState({isHovered: true});
        }
    }

    render() {
        return (
            <View
                style={this.props.containerStyle}
                onMouseEnter={this.toggleHoverState}
                onMouseLeave={this.toggleHoverState}
            >
                { // If this.props.children is a function, call it to provide the hover state to the children.
                    _.isFunction(this.props.children)
                        ? this.props.children(this.state.isHovered)
                        : this.props.children
                }
            </View>
        );
    }
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
