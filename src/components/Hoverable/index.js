import _ from 'underscore';
import React, {useEffect, useCallback, useState, useRef, useMemo} from 'react';
import {propTypes, defaultProps} from './hoverablePropTypes';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

function mapChildren(children, callbackParam) {
    if (_.isArray(children) && children.length === 1) return children[0];

    if (_.isFunction(children)) return children(callbackParam);

    return children;
}

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */

function Hoverable({disabled, onHoverIn, onHoverOut, children}) {
    const [isHovered, setIsHovered] = useState(false);
    const wrapperView = useRef(null);

    useEffect(() => {
        // For now, listener is quite simple so we don't need to extract its declaration from effect
        const onVisibilityChange = () => document.visibilityState === 'hidden' && setIsHovered(false);

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        if (disabled) return setIsHovered(false);
    }, [disabled]);

    useEffect(() => {
        if (isHovered) return onHoverIn();
        onHoverOut();
    }, [isHovered, onHoverIn, onHoverOut]);

    const child = useMemo(() => React.Children.only(mapChildren(children, isHovered)), [children, isHovered]);

    const refCallback = useCallback(
        (el) => {
            if (!el) return;

            wrapperView.current = el;

            const {ref} = child;

            if (_.isFunction(ref)) return ref(el);

            if (_.isObject(ref)) return (ref.current = el);
        },
        [child],
    );

    const onMouseEnter = useCallback(
        (el) => {
            setIsHovered(true);

            if (_.isFunction(child.props.onMouseEnter)) child.props.onMouseEnter(el);
        },
        [child],
    );

    const onMouseLeave = useCallback(
        (el) => {
            setIsHovered(false);

            if (_.isFunction(child.props.onMouseLeave)) child.props.onMouseLeave(el);
        },
        [child],
    );

    const onBlur = useCallback(
        (el) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!wrapperView.current.contains(el.target) && !wrapperView.current.contains(el.relatedTarget)) {
                setIsHovered(false);
            }

            if (_.isFunction(child.props.onBlur)) child.props.onBlur(el);
        },
        [child],
    );

    if (!DeviceCapabilities.hasHoverSupport()) return child;

    return React.cloneElement(child, {
        ref: refCallback,
        onMouseEnter,
        onMouseLeave,
        onBlur,
    });
}

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
