import React, {Component} from 'react';
import {propTypes, defaultProps} from './HoverablePropTypes';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues. https://github.com/necolas/react-native-web/issues/1875
 */
class Hoverable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false,
        };
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    /**
     * Sets the `hovered` state of this `Hoverable` to true and executes the `onHoverIn` callback.
     */
    handleMouseEnter() {
        if (!this.state.isHovered) {
            this.props.onHoverIn();
            this.setState({isHovered: true});
        }
    }

    /**
     * Sets the `hovered` state of this `Hoverable` to false and executes the `onHoverOut` callback.
     */
    handleMouseLeave() {
        if (this.state.isHovered) {
            this.props.onHoverOut();
            this.setState({isHovered: false});
        }
    }

    render() {
        const child = typeof this.props.children === 'function'
            ? this.props.children(this.state.isHovered)
            : this.props.children;

        // Clone the child element, providing the callbacks to the react element to handle hover state changes.
        // Using `React.Children.only` enforces that this component has only one child,
        // which gives the `Hoverable` a more predictable UX.
        return React.cloneElement(React.Children.only(child), {
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave,
        });
    }
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
