import {cloneElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import {getReturnValue} from '@libs/ValueUtils';
import CONST from '@src/CONST';
import type HoverableProps from './types';

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;

type MouseEvents = 'onMouseEnter' | 'onMouseLeave' | 'onMouseMove';

type OnMouseEvents = Record<MouseEvents, (e: React.MouseEvent) => void>;

function ActiveHoverable({onHoverIn, onHoverOut, shouldHandleScroll, isFocused = true, shouldFreezeCapture, children, ref}: ActiveHoverableProps) {
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
            if (scrolling && isHoveredRef.current) {
                isHoveredRef.current = false;
                setIsHovered(false);
                onHoverOut?.();
            } else if (!scrolling && elementRef.current?.matches(':hover')) {
                isHoveredRef.current = true;
                setIsHovered(true);
                onHoverIn?.();
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll, onHoverIn, onHoverOut]);

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

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setIsHovered(false);
    }, [isFocused]);

    const handleMouseEvents = useCallback(
        (type: 'enter' | 'leave') => () => {
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

    const {onMouseEnter, onMouseLeave} = child.props as OnMouseEvents;

    return cloneElement(child, {
        ref: mergeRefs(elementRef, ref, child.props.ref),
        onMouseEnter: (e: React.MouseEvent) => {
            handleMouseEvents('enter')();
            onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            handleMouseEvents('leave')();
            onMouseLeave?.(e);
        },
    } as React.HTMLAttributes<HTMLElement>);
}

export default ActiveHoverable;
