import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './hoverablePropTypes';

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

        this.wrapperView = null;
    }

    componentDidMount() {
        // we like to Block the hover on touch devices but we keep it for Hybrid devices so
        // following logic blocks hover on touch devices.
        this.disableHover = () => {
            this.hoverDisabled = true;
        };
        this.enableHover = () => {
            this.hoverDisabled = false;
        };
        document.addEventListener('touchstart', this.disableHover);

        // Remember Touchend fires before `mouse` events so we have to use alternative.
        document.addEventListener('touchmove', this.enableHover);
    }

    componentWillUnmount() {
        document.removeEventListener('touchstart', this.disableHover);
        document.removeEventListener('touchmove', this.enableHover);
    }

    /**
     * Sets the hover state of this component to true and execute the onHoverIn callback.
     *
     * @param {Boolean} isHovered - Whether or not this component is hovered.
     */
    setIsHovered(isHovered) {
        if (isHovered !== this.state.isHovered && !(isHovered && this.hoverDisabled)) {
            this.setState({isHovered}, isHovered ? this.props.onHoverIn : this.props.onHoverOut);
        }

        // we reset the Hover block in case touchmove was not first after touctstart
        if (!isHovered) {
            this.hoverDisabled = false;
        }
    }

    render() {
        if (this.props.absolute && React.isValidElement(this.props.children)) {
            return React.cloneElement(React.Children.only(this.props.children), {
                ref: (el) => {
                    this.wrapperView = el;

                    // Call the original ref, if any
                    const {ref} = this.props.children;
                    if (_.isFunction(ref)) {
                        ref(el);
                    }
                },
                onMouseEnter: (el) => {
                    this.setIsHovered(true);

                    // Call the original onMouseEnter, if any
                    const {onMouseEnter} = this.props.children;
                    if (_.isFunction(onMouseEnter)) {
                        onMouseEnter(el);
                    }
                },
                onMouseLeave: (el) => {
                    this.setIsHovered(false);

                    // Call the original onMouseLeave, if any
                    const {onMouseLeave} = this.props.children;
                    if (_.isFunction(onMouseLeave)) {
                        onMouseLeave(el);
                    }
                },
                onBlur: (el) => {
                    if (!this.wrapperView.contains(el.relatedTarget)) {
                        this.setIsHovered(false);
                    }

                    // Call the original onBlur, if any
                    const {onBlur} = this.props.children;
                    if (_.isFunction(onBlur)) {
                        onBlur(el);
                    }
                },
            });
        }
        return (
            <View
                style={this.props.containerStyles}
                ref={el => this.wrapperView = el}
                onMouseEnter={() => this.setIsHovered(true)}
                onMouseLeave={() => this.setIsHovered(false)}
                onBlur={(el) => {
                    if (this.wrapperView.contains(el.relatedTarget)) {
                        return;
                    }
                    this.setIsHovered(false);
                }}
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
