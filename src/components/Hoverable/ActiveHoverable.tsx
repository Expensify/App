import type {Ref} from 'react';
import {cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter, InteractionManager} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import {getReturnValue} from '@libs/ValueUtils';
import CONST from '@src/CONST';
import type HoverableProps from './types';

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;
type UseHoveredReturnType = [boolean, (newValue: boolean) => void];

function useHovered(initialValue: boolean, runHoverAfterInteraction: boolean): UseHoveredReturnType {
    const [state, setState] = useState(initialValue);

    const interceptedSetState = useCallback((newValue: boolean) => {
        if (runHoverAfterInteraction) {
            InteractionManager.runAfterInteractions(() => {
                setState(newValue);
            });
        } else {
            setState(newValue);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [state, interceptedSetState];
}

function ActiveHoverable({onHoverIn, onHoverOut, shouldHandleScroll, children, runHoverAfterInteraction = false}: ActiveHoverableProps, outerRef: Ref<HTMLElement>) {
    const [isHovered, setIsHovered] = useHovered(false, runHoverAfterInteraction);

    const elementRef = useRef<HTMLElement | null>(null);
    const isScrollingRef = useRef(false);
    const isHoveredRef = useRef(false);

    const updateIsHovered = useCallback(
        (hovered: boolean) => {
            isHoveredRef.current = hovered;
            if (shouldHandleScroll && isScrollingRef.current) {
                return;
            }
            setIsHovered(hovered);
        },
        [setIsHovered, shouldHandleScroll],
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
    }, [setIsHovered, shouldHandleScroll]);

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
    }, [setIsHovered, isHovered, elementRef]);

    useEffect(() => {
        const unsetHoveredWhenDocumentIsHidden = () => document.visibilityState === 'hidden' && setIsHovered(false);

        document.addEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);

        return () => document.removeEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);
    }, []);

    const child = useMemo(() => getReturnValue(children, !isScrollingRef.current && isHovered), [children, isHovered]);

    const childOnMouseEnter = child.props.onMouseEnter;
    const childOnMouseLeave = child.props.onMouseLeave;

    const hoverAndForwardOnMouseEnter = useCallback(
        (e: MouseEvent) => {
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
        [setIsHovered, child.props],
    );

    return cloneElement(child, {
        ref: mergeRefs(elementRef, outerRef, child.ref),
        onMouseEnter: hoverAndForwardOnMouseEnter,
        onMouseLeave: unhoverAndForwardOnMouseLeave,
        onBlur: unhoverAndForwardOnBlur,
    });
}

export default forwardRef(ActiveHoverable);
