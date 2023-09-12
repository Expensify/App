import _ from 'underscore';
import React, {useEffect, useCallback, useState, useRef, useMemo, useImperativeHandle} from 'react';
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

function InnerHoverable({disabled, onHoverIn, onHoverOut, children}, outerRef) {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onVisibilityChange = () => document.visibilityState === 'hidden' && setIsHovered(false);

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        if (disabled) return setIsHovered(false);
    }, [disabled]);

    useEffect(() => {
        if (disabled) return;
        if (onHoverIn && isHovered) return onHoverIn();
        if (onHoverOut && !isHovered) return onHoverOut();
    }, [disabled, isHovered, onHoverIn, onHoverOut]);

    useImperativeHandle(outerRef, () => ref.current, []);

    const child = useMemo(() => React.Children.only(mapChildren(children, isHovered)), [children, isHovered]);

    const onMouseEnter = useCallback(
        (el) => {
            setIsHovered(true);

            if (_.isFunction(child.props.onMouseEnter)) child.props.onMouseEnter(el);
        },
        [child.props],
    );

    const onMouseLeave = useCallback(
        (el) => {
            setIsHovered(false);

            if (_.isFunction(child.props.onMouseLeave)) child.props.onMouseLeave(el);
        },
        [child.props],
    );

    const onBlur = useCallback(
        (el) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!ref.current.contains(el.target) && !ref.current.contains(el.relatedTarget)) {
                setIsHovered(false);
            }

            if (_.isFunction(child.props.onBlur)) child.props.onBlur(el);
        },
        [child.props],
    );

    if (!DeviceCapabilities.hasHoverSupport()) return child;

    return React.cloneElement(child, {
        ref,
        onMouseEnter,
        onMouseLeave,
        onBlur,
    });
}

const Hoverable = React.forwardRef(InnerHoverable);

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;
Hoverable.displayName = 'Hoverable';

export default Hoverable;
