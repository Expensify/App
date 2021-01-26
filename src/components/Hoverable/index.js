import _ from 'underscore';
import React, {Component} from 'react';
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
        const child = _.isFunction(this.props.children)
            ? this.props.children(this.state.isHovered)
            : this.props.children;

        // Clone the child element, providing the callbacks to the react element to handle hover state changes.
        // Using `React.Children.only` enforces that this component has only one child,
        // which gives the `Hoverable` a more predictable UX.
        return React.cloneElement(React.Children.only(child), {
            onMouseEnter: this.toggleHoverState,
            onMouseLeave: this.toggleHoverState,
        });
    }
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
