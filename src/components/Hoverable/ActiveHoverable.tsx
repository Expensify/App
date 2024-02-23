import type {Ref} from 'react';
import {cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import {getReturnValue} from '@libs/ValueUtils';
import CONST from '@src/CONST';
import type HoverableProps from './types';

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;

function ActiveHoverable({onHoverIn, onHoverOut, shouldHandleScroll, children}: ActiveHoverableProps, outerRef: Ref<HTMLElement>) {
    const [isHovered, setIsHovered] = useState(false);

    const elementRef = useRef<HTMLElement | null>(null);
    const isScrollingRef = useRef(false);
    const isHoveredRef = useRef(false);
    const isVisibiltyHidden = useRef(false);

    const updateIsHovered = useCallback(
        (hovered: boolean) => {
            isHoveredRef.current = hovered;
            if (shouldHandleScroll && isScrollingRef.current) {
                return;
            }
            setIsHovered(hovered);
        },
        [shouldHandleScroll],
    );

    useEffect(() => {
        if (isHovered) {
            onHoverIn?.();
        } else {
            onHoverOut?.();
        }
    }, [isHovered, onHoverIn, onHoverOut]);

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling) => {
            isScrollingRef.current = scrolling;
            if (!isScrollingRef.current) {
                setIsHovered(isHoveredRef.current);
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll]);

    useEffect(() => {
        // Do not mount a listener if the component is not hovered
        if (!isHovered) {
            return;
        }

        /**
         * Checks the hover state of a component and updates it based on the event target.
         * This is necessary to handle cases where the hover state might get stuck due to an unreliable mouseleave trigger,
         * such as when an element is removed before the mouseleave event is triggered.
         * @param event The hover event object.
         */
        const unsetHoveredIfOutside = (event: MouseEvent) => {
            if (!elementRef.current || elementRef.current.contains(event.target as Node)) {
                return;
            }

            setIsHovered(false);
        };

        document.addEventListener('mouseover', unsetHoveredIfOutside);

        return () => document.removeEventListener('mouseover', unsetHoveredIfOutside);
    }, [isHovered, elementRef]);

    useEffect(() => {
        const unsetHoveredWhenDocumentIsHidden = () => {
            if (document.visibilityState !== 'hidden') {
                return;
            }

            isVisibiltyHidden.current = true;
            setIsHovered(false);
        };

        document.addEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);

        return () => document.removeEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);
    }, []);

    const child = useMemo(() => getReturnValue(children, !isScrollingRef.current && isHovered), [children, isHovered]);

    const childOnMouseEnter = child.props.onMouseEnter;
    const childOnMouseLeave = child.props.onMouseLeave;
    const childOnMouseMove = child.props.onMouseMove;

    const hoverAndForwardOnMouseEnter = useCallback(
        (e: MouseEvent) => {
            isVisibiltyHidden.current = false;
            updateIsHovered(true);
            childOnMouseEnter?.(e);
        },
        [updateIsHovered, childOnMouseEnter],
    );

    const unhoverAndForwardOnMouseLeave = useCallback(
        (e: MouseEvent) => {
            updateIsHovered(false);
            childOnMouseLeave?.(e);
        },
        [updateIsHovered, childOnMouseLeave],
    );

    const unhoverAndForwardOnBlur = useCallback(
        (event: MouseEvent) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!elementRef.current?.contains(event.target as Node) && !elementRef.current?.contains(event.relatedTarget as Node)) {
                setIsHovered(false);
            }

            child.props.onBlur?.(event);
        },
        [child.props],
    );

    const handleAndForwardOnMouseMove = useCallback(
        (e: MouseEvent) => {
            isVisibiltyHidden.current = false;
            updateIsHovered(true);
            childOnMouseMove?.(e);
        },
        [updateIsHovered, childOnMouseMove],
    );

    return cloneElement(child, {
        ref: mergeRefs(elementRef, outerRef, child.ref),
        onMouseEnter: hoverAndForwardOnMouseEnter,
        onMouseLeave: unhoverAndForwardOnMouseLeave,
        onBlur: unhoverAndForwardOnBlur,
        ...(isVisibiltyHidden.current ? {onMouseMove: handleAndForwardOnMouseMove} : {}),
    });
}

export default forwardRef(ActiveHoverable);
