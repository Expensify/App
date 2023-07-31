import _ from 'underscore';
import React, {Component} from 'react';
import {propTypes, defaultProps} from './hoverablePropTypes';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
class Hoverable extends Component {
    constructor(props) {
        super(props);

        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

        this.state = {
            isHovered: false,
        };

        this.wrapperView = null;
    }

    componentDidMount() {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.disabled === this.props.disabled) {
            return;
        }

        if (this.props.disabled && this.state.isHovered) {
            this.setState({isHovered: false});
        }
    }

    componentWillUnmount() {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    /**
     * Sets the hover state of this component to true and execute the onHoverIn callback.
     *
     * @param {Boolean} isHovered - Whether or not this component is hovered.
     */
    setIsHovered(isHovered) {
        if (this.props.disabled) {
            return;
        }

        if (isHovered !== this.state.isHovered) {
            this.setState({isHovered}, isHovered ? this.props.onHoverIn : this.props.onHoverOut);
        }
    }

    handleVisibilityChange() {
        if (document.visibilityState !== 'hidden') {
            return;
        }

        this.setIsHovered(false);
    }

    render() {
        let child = this.props.children;
        if (_.isArray(this.props.children) && this.props.children.length === 1) {
            child = this.props.children[0];
        }

        if (_.isFunction(child)) {
            child = child(this.state.isHovered);
        }

        if (!DeviceCapabilities.hasHoverSupport()) {
            return child;
        }

        return React.cloneElement(React.Children.only(child), {
            ref: (el) => {
                this.wrapperView = el;

                // Call the original ref, if any
                const {ref} = child;
                if (_.isFunction(ref)) {
                    ref(el);
                    return;
                }

                if (_.isObject(ref)) {
                    ref.current = el;
                }
            },
            onMouseEnter: (el) => {
                this.setIsHovered(true);

                if (_.isFunction(child.props.onMouseEnter)) {
                    child.props.onMouseEnter(el);
                }
            },
            onMouseLeave: (el) => {
                this.setIsHovered(false);

                if (_.isFunction(child.props.onMouseLeave)) {
                    child.props.onMouseLeave(el);
                }
            },
            onBlur: (el) => {
                // Check if the blur event occurred due to clicking outside the element
                // and the wrapperView contains the element that caused the blur and reset isHovered
                if (!this.wrapperView.contains(el.target) && !this.wrapperView.contains(el.relatedTarget)) {
                    this.setIsHovered(false);
                }

                if (_.isFunction(child.props.onBlur)) {
                    child.props.onBlur(el);
                }
            },
        });
    }
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
