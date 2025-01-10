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
    const isHoveredRef = useRef(false);
    const isVisibilityHidden = useRef(false);

    const updateIsHovered = useCallback(
        (hovered: boolean) => {
            if (shouldFreezeCapture) {
                return;
            }

            isHoveredRef.current = hovered;
            isVisibilityHidden.current = false;

            if (shouldHandleScroll && isScrollingRef.current) {
                return;
            }

            setIsHovered(hovered);

            if (hovered) {
                onHoverIn?.();
            } else {
                onHoverOut?.();
            }
        },
        [shouldHandleScroll, shouldFreezeCapture, onHoverIn, onHoverOut],
    );

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling: boolean) => {
            isScrollingRef.current = scrolling;
            if (scrolling && isHovered) {
                setIsHovered(false);
                onHoverOut?.();
            } else if (!scrolling && elementRef.current?.matches(':hover')) {
                setIsHovered(true);
                onHoverIn?.();
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll, isHovered, onHoverIn, onHoverOut]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                isVisibilityHidden.current = true;
                setIsHovered(false);
            } else {
                isVisibilityHidden.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleMouseEvents = useCallback(
        (type: 'enter' | 'leave' | 'blur') => (e: MouseEvent) => {
            if (shouldFreezeCapture) {
                return;
            }

            const newHoverState = type === 'enter';
            isHoveredRef.current = newHoverState;
            isVisibilityHidden.current = false;

            updateIsHovered(newHoverState);
        },
        [shouldFreezeCapture, updateIsHovered],
    );

    const child = useMemo(() => getReturnValue(children, isHovered), [children, isHovered]);

    const {onMouseEnter, onMouseLeave, onBlur} = child.props as OnMouseEvents;

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
        onBlur: (e: MouseEvent) => {
            handleMouseEvents('blur')(e);
            onBlur?.(e);
        },
    });
}

export default forwardRef(ActiveHoverable);
