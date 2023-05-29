import _ from 'underscore';
import React, {Component} from 'react';
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

    componentDidUpdate(prevProps) {
        if (prevProps.disabled === this.props.disabled) {
            return;
        }

        if (this.props.disabled && this.state.isHovered) {
            this.setState({isHovered: false});
        }
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
        if (this.props.disabled) {
            return;
        }

        if (isHovered !== this.state.isHovered && !(isHovered && this.hoverDisabled)) {
            this.setState({isHovered}, isHovered ? this.props.onHoverIn : this.props.onHoverOut);
        }

        // we reset the Hover block in case touchmove was not first after touctstart
        if (!isHovered) {
            this.hoverDisabled = false;
        }
    }

    render() {
        const child = _.isFunction(this.props.children) ? this.props.children(this.state.isHovered) : this.props.children;

        if (!React.isValidElement(child)) {
            throw Error('Children is not a valid element.');
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
                if (!this.wrapperView.contains(el.relatedTarget)) {
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
