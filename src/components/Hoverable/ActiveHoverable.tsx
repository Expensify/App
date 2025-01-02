/* eslint-disable react-compiler/react-compiler */
import type {Ref} from 'react';
import {cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import {getReturnValue} from '@libs/ValueUtils';
import CONST from '@src/CONST';
import type HoverableProps from './types';

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;

type MouseEvents = 'onMouseEnter' | 'onMouseLeave' | 'onMouseMove' | 'onBlur';

type OnMouseEvents = Record<MouseEvents, (e: MouseEvent) => void>;

function ActiveHoverable({onHoverIn, onHoverOut, shouldHandleScroll, shouldFreezeCapture, children}: ActiveHoverableProps, outerRef: Ref<HTMLElement>) {
    const [isHovered, setIsHovered] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);
    const isScrollingRef = useRef(false);
    const lastKnownHoverState = useRef(false);

    const updateHoverState = useCallback(
        (value: boolean) => {
            if (lastKnownHoverState.current === value) {
                return;
            }
            lastKnownHoverState.current = value;
            setIsHovered(value);
            if (value) {
                onHoverIn?.();
            } else {
                onHoverOut?.();
            }
        },
        [onHoverIn, onHoverOut],
    );

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling: boolean) => {
            const wasScrolling = isScrollingRef.current;
            isScrollingRef.current = scrolling;

            if (scrolling) {
                // Store current hover state before clearing it
                if (isHovered) {
                    lastKnownHoverState.current = true;
                }
                updateHoverState(false);
            } else if (wasScrolling) {
                // Only check hover state when scroll actually ends
                const isMouseOver = elementRef.current?.matches(':hover');
                if (isMouseOver && !shouldFreezeCapture && lastKnownHoverState.current) {
                    updateHoverState(true);
                }
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll, shouldFreezeCapture, updateHoverState, isHovered]);

    // Handle visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (isHovered) {
                    lastKnownHoverState.current = true;
                }
                updateHoverState(false);
            } else if (lastKnownHoverState.current) {
                // When becoming visible, check if we should restore hover
                const isMouseOver = elementRef.current?.matches(':hover');
                if (isMouseOver && !shouldFreezeCapture) {
                    requestAnimationFrame(() => {
                        updateHoverState(true);
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [updateHoverState, isHovered, shouldFreezeCapture]);

    const handleMouseEvents = useCallback(
        (type: 'enter' | 'leave' | 'blur' | 'move') => (e: MouseEvent) => {
            if (shouldFreezeCapture ?? (shouldHandleScroll && isScrollingRef.current)) {
                return;
            }

            if (type === 'blur') {
                if (!elementRef.current?.contains(e.relatedTarget as Node)) {
                    updateHoverState(false);
                }
                return;
            }

            // Handle quick mouse movements with move event
            if (type === 'move' && !isHovered && lastKnownHoverState.current) {
                updateHoverState(true);
                return;
            }

            updateHoverState(type === 'enter');
        },
        [shouldFreezeCapture, shouldHandleScroll, updateHoverState, isHovered],
    );

    const child = useMemo(() => getReturnValue(children, !isScrollingRef.current && isHovered), [children, isHovered]);

    const {onMouseEnter, onMouseLeave, onMouseMove, onBlur} = child.props as OnMouseEvents;

    return cloneElement(child, {
        ref: mergeRefs(elementRef, outerRef, child.ref),
        onMouseEnter: (e: MouseEvent) => {
            handleMouseEvents('enter')(e);
            onMouseEnter?.(e);
        },
        onMouseLeave: (e: MouseEvent) => {
            handleMouseEvents('leave')(e);
            onMouseLeave?.(e);
        },
        onMouseMove: (e: MouseEvent) => {
            handleMouseEvents('move')(e);
            onMouseMove?.(e);
        },
        onBlur: (e: MouseEvent) => {
            handleMouseEvents('blur')(e);
            onBlur?.(e);
        },
    });
}
export default forwardRef(ActiveHoverable);
