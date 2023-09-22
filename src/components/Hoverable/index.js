import _ from 'underscore';
import React, {Component} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {propTypes, defaultProps} from './hoverablePropTypes';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
class Hoverable extends Component {
    constructor(props) {
        super(props);

        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.checkHover = this.checkHover.bind(this);

        this.state = {
            isHovered: false,
        };

        this.isHoveredRef = false;
        this.isScrollingRef = false;
        this.wrapperView = null;
    }

    componentDidMount() {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('mouseover', this.checkHover);

        /**
         * Only add the scrolling listener if the shouldHandleScroll prop is true
         * and the scrollingListener is not already set.
         */
        if (!this.scrollingListener && this.props.shouldHandleScroll) {
            this.scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling) => {
                /**
                 * If user has stopped scrolling and the isHoveredRef is true, then we should update the hover state.
                 */
                if (!scrolling && this.isHoveredRef) {
                    this.setState({isHovered: this.isHoveredRef}, this.props.onHoverIn);
                } else if (scrolling && this.isHoveredRef) {
                    /**
                     * If the user has started scrolling and the isHoveredRef is true, then we should set the hover state to false.
                     * This is to hide the existing hover and reaction bar.
                     */
                    this.setState({isHovered: false}, this.props.onHoverOut);
                }
                this.isScrollingRef = scrolling;
            });
        }
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
        document.removeEventListener('mouseover', this.checkHover);
        if (this.scrollingListener) {
            this.scrollingListener.remove();
        }
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

        /**
         * Capture whther or not the user is hovering over the component.
         * We will use this to determine if we should update the hover state when the user has stopped scrolling.
         */
        this.isHoveredRef = isHovered;

        /**
         * If the isScrollingRef is true, then the user is scrolling and we should not update the hover state.
         */
        if (this.isScrollingRef && this.props.shouldHandleScroll && !this.state.isHovered) {
            return;
        }

        if (isHovered !== this.state.isHovered) {
            this.setState({isHovered}, isHovered ? this.props.onHoverIn : this.props.onHoverOut);
        }
    }

    /**
     * Checks the hover state of a component and updates it based on the event target.
     * This is necessary to handle cases where the hover state might get stuck due to an unreliable mouseleave trigger,
     * such as when an element is removed before the mouseleave event is triggered.
     * @param {Event} e - The hover event object.
     */
    checkHover(e) {
        if (!this.wrapperView || !this.state.isHovered) {
            return;
        }

        if (this.wrapperView.contains(e.target)) {
            return;
        }

        this.setIsHovered(false);
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
