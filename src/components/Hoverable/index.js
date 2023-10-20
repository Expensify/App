import _ from 'underscore';
import React, {useEffect, useCallback, useState, useRef, useMemo, useImperativeHandle} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {propTypes, defaultProps} from './hoverablePropTypes';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';

/**
 * Maps the children of a Hoverable component to
 * - a function that is called with the parameter
 * - the child itself if it is the only child
 * @param {Array|Function|ReactNode} children - The children to map.
 * @param {Object} callbackParam - The parameter to pass to the children function.
 * @returns {ReactNode} The mapped children.
 */
function mapChildren(children, callbackParam) {
    if (_.isArray(children) && children.length === 1) {
        return children[0];
    }

    if (_.isFunction(children)) {
        return children(callbackParam);
    }

    return children;
}

/**
 * Assigns a ref to an element, either by setting the current property of the ref object or by calling the ref function
 * @param {Object|Function} ref - The ref object or function.
 * @param {HTMLElement} el - The element to assign the ref to.
 */
function assignRef(ref, el) {
    if (!ref) {
        return;
    }

    if (_.has(ref, 'current')) {
        // eslint-disable-next-line no-param-reassign
        ref.current = el;
    }

    if (_.isFunction(ref)) {
        ref(el);
    }
}

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */

const Hoverable = React.forwardRef(({disabled, onHoverIn, onHoverOut, onMouseEnter, onMouseLeave, children, shouldHandleScroll}, outerRef) => {
    const [isHovered, setIsHovered] = useState(false);

    const isScrolling = useRef(false);
    const isHoveredRef = useRef(false);
    const ref = useRef(null);

    const updateIsHoveredOnScrolling = useCallback(
        (hovered) => {
            if (disabled) {
                return;
            }

            isHoveredRef.current = hovered;

            if (shouldHandleScroll && isScrolling.current) {
                return;
            }
            setIsHovered(hovered);
        },
        [disabled, shouldHandleScroll],
    );

    useEffect(() => {
        const unsetHoveredWhenDocumentIsHidden = () => document.visibilityState === 'hidden' && setIsHovered(false);

        document.addEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);

        return () => document.removeEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);
    }, []);

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling) => {
            isScrolling.current = scrolling;
            if (!scrolling) {
                setIsHovered(isHoveredRef.current);
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll]);

    useEffect(() => {
        if (!DeviceCapabilities.hasHoverSupport()) {
            return;
        }

        /**
         * Checks the hover state of a component and updates it based on the event target.
         * This is necessary to handle cases where the hover state might get stuck due to an unreliable mouseleave trigger,
         * such as when an element is removed before the mouseleave event is triggered.
         * @param {Event} e - The hover event object.
         */
        const unsetHoveredIfOutside = (e) => {
            if (!ref.current || !isHovered) {
                return;
            }

            if (ref.current.contains(e.target)) {
                return;
            }

            setIsHovered(false);
        };

        document.addEventListener('mouseover', unsetHoveredIfOutside);

        return () => document.removeEventListener('mouseover', unsetHoveredIfOutside);
    }, [isHovered]);

    useEffect(() => {
        if (!disabled || !isHovered) {
            return;
        }
        setIsHovered(false);
    }, [disabled, isHovered]);

    useEffect(() => {
        if (disabled) {
            return;
        }
        if (onHoverIn && isHovered) {
            return onHoverIn();
        }
        if (onHoverOut && !isHovered) {
            return onHoverOut();
        }
    }, [disabled, isHovered, onHoverIn, onHoverOut]);

    // Expose inner ref to parent through outerRef. This enable us to use ref both in parent and child.
    useImperativeHandle(outerRef, () => ref.current, []);

    const child = useMemo(() => React.Children.only(mapChildren(children, isHovered)), [children, isHovered]);

    const enableHoveredOnMouseEnter = useCallback(
        (el) => {
            updateIsHoveredOnScrolling(true);

            if (_.isFunction(onMouseEnter)) {
                onMouseEnter(el);
            }

            if (_.isFunction(child.props.onMouseEnter)) {
                child.props.onMouseEnter(el);
            }
        },
        [child.props, onMouseEnter, updateIsHoveredOnScrolling],
    );

    const disableHoveredOnMouseLeave = useCallback(
        (el) => {
            updateIsHoveredOnScrolling(false);

            if (_.isFunction(onMouseLeave)) {
                onMouseLeave(el);
            }

            if (_.isFunction(child.props.onMouseLeave)) {
                child.props.onMouseLeave(el);
            }
        },
        [child.props, onMouseLeave, updateIsHoveredOnScrolling],
    );

    const disableHoveredOnBlur = useCallback(
        (el) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!ref.current.contains(el.target) && !ref.current.contains(el.relatedTarget)) {
                setIsHovered(false);
            }

            if (_.isFunction(child.props.onBlur)) {
                child.props.onBlur(el);
            }
        },
        [child.props],
    );

    if (!DeviceCapabilities.hasHoverSupport()) {
        return child;
    }

    return React.cloneElement(child, {
        ref: (el) => {
            ref.current = el;
            assignRef(child.ref, el);
        },
        onMouseEnter: enableHoveredOnMouseEnter,
        onMouseLeave: disableHoveredOnMouseLeave,
        onBlur: disableHoveredOnBlur,
    });
});

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;
Hoverable.displayName = 'Hoverable';

export default Hoverable;
