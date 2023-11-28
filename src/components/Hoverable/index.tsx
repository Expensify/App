import React, {ForwardedRef, forwardRef, MutableRefObject, ReactElement, RefAttributes, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import HoverableProps from './types';

/**
 * Maps the children of a Hoverable component to
 * - a function that is called with the parameter
 * - the child itself if it is the only child
 * @param children The children to map.
 * @param callbackParam The parameter to pass to the children function.
 * @returns The mapped children.
 */
function mapChildren(children: ((isHovered: boolean) => ReactElement) | ReactElement | ReactElement[], callbackParam: boolean): ReactElement & RefAttributes<HTMLElement> {
    if (Array.isArray(children)) {
        return children[0];
    }

    if (typeof children === 'function') {
        return children(callbackParam);
    }

    return children;
}

/**
 * Assigns a ref to an element, either by setting the current property of the ref object or by calling the ref function
 * @param ref The ref object or function.
 * @param element The element to assign the ref to.
 */
function assignRef(ref: ((instance: HTMLElement | null) => void) | MutableRefObject<HTMLElement | null>, element: HTMLElement) {
    if (!ref) {
        return;
    }
    if (typeof ref === 'function') {
        ref(element);
    } else if ('current' in ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = element;
    }
}

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
function Hoverable(
    {disabled = false, onHoverIn = () => {}, onHoverOut = () => {}, onMouseEnter = () => {}, onMouseLeave = () => {}, children, shouldHandleScroll = false}: HoverableProps,
    outerRef: ForwardedRef<HTMLElement>,
) {
    const [isHovered, setIsHovered] = useState(false);

    const isScrolling = useRef(false);
    const isHoveredRef = useRef(false);
    const ref = useRef<HTMLElement | null>(null);

    const updateIsHoveredOnScrolling = useCallback(
        (hovered: boolean) => {
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
         * @param event The hover event object.
         */
        const unsetHoveredIfOutside = (event: MouseEvent) => {
            if (!ref.current || !isHovered) {
                return;
            }

            if (ref.current.contains(event.target as Node)) {
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
    useImperativeHandle<HTMLElement | null, HTMLElement | null>(outerRef, () => ref.current, []);

    const child = useMemo(() => React.Children.only(mapChildren(children, isHovered)), [children, isHovered]);

    const enableHoveredOnMouseEnter = useCallback(
        (event: MouseEvent) => {
            updateIsHoveredOnScrolling(true);
            onMouseEnter(event);

            if (typeof child.props.onMouseEnter === 'function') {
                child.props.onMouseEnter(event);
            }
        },
        [child.props, onMouseEnter, updateIsHoveredOnScrolling],
    );

    const disableHoveredOnMouseLeave = useCallback(
        (event: MouseEvent) => {
            updateIsHoveredOnScrolling(false);
            onMouseLeave(event);

            if (typeof child.props.onMouseLeave === 'function') {
                child.props.onMouseLeave(event);
            }
        },
        [child.props, onMouseLeave, updateIsHoveredOnScrolling],
    );

    const disableHoveredOnBlur = useCallback(
        (event: MouseEvent) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!ref.current?.contains(event.target as Node) && !ref.current?.contains(event.relatedTarget as Node)) {
                setIsHovered(false);
            }

            if (typeof child.props.onBlur === 'function') {
                child.props.onBlur(event);
            }
        },
        [child.props],
    );

    // We need to access the ref of a children from both parent and current component
    // So we pass it to current ref and assign it once again to the child ref prop
    const hijackRef = (el: HTMLElement) => {
        ref.current = el;
        if (child.ref) {
            assignRef(child.ref, el);
        }
    };

    if (!DeviceCapabilities.hasHoverSupport()) {
        return React.cloneElement(child, {
            ref: hijackRef,
        });
    }

    return React.cloneElement(child, {
        ref: hijackRef,
        onMouseEnter: enableHoveredOnMouseEnter,
        onMouseLeave: disableHoveredOnMouseLeave,
        onBlur: disableHoveredOnBlur,
    });
}

export default forwardRef(Hoverable);
