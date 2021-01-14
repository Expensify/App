/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues. https://github.com/necolas/react-native-web/issues/1875
 */
import React, {Component} from 'react';
import {propTypes, defaultProps} from './HoverablePropTypes';

class Hoverable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false,
        };
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        if (!this.state.isHovered) {
            this.props.onHoverIn();
            this.setState({isHovered: true});
        }
    }

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
        return React.cloneElement(React.Children.only(child), {
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave,
        });
    }
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
