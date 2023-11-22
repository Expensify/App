import {cloneElement, forwardRef, MutableRefObject, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import CONST from '@src/CONST';
import HoverableProps from './types';

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

type ActiveHoverableProps = Omit<HoverableProps, 'disabled'>;

function ActiveHoverable({onHoverIn, onHoverOut, shouldHandleScroll, children}: ActiveHoverableProps, outerRef: Ref<HTMLElement>) {
    const [isHovered, setIsHovered] = useState(false);

    const ref = useRef<HTMLElement | null>(null);
    const isScrolling = useRef(false);
    const isHoveredRef = useRef(false);

    const updateIsHovered = useCallback(
        (hovered: boolean) => {
            isHoveredRef.current = hovered;
            if (shouldHandleScroll && isScrolling.current) {
                return;
            }
            setIsHovered(hovered);
        },
        [shouldHandleScroll],
    );

    // Expose inner ref to parent through outerRef. This enable us to use ref both in parent and child.
    useImperativeHandle<HTMLElement | null, HTMLElement | null>(outerRef, () => ref.current, []);

    useEffect(() => (isHovered ? onHoverIn?.() : onHoverOut?.()), [isHovered, onHoverIn, onHoverOut]);

    useEffect(() => {
        if (!shouldHandleScroll) {
            return;
        }

        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling) => {
            isScrolling.current = scrolling;
            if (!isScrolling.current) {
                setIsHovered(isHoveredRef.current);
            }
        });

        return () => scrollingListener.remove();
    }, [shouldHandleScroll]);

    useEffect(() => {
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
    }, [isHovered, ref]);

    useEffect(() => {
        const unsetHoveredWhenDocumentIsHidden = () => document.visibilityState === 'hidden' && setIsHovered(false);

        document.addEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);

        return () => document.removeEventListener('visibilitychange', unsetHoveredWhenDocumentIsHidden);
    }, []);

    const child = useMemo(() => (typeof children === 'function' ? children(!isScrolling.current && isHovered) : children), [children, isHovered]);

    const onMouseEnter = useCallback(
        (e: MouseEvent) => {
            updateIsHovered(true);
            child.props.onMouseEnter?.(e);
        },
        [updateIsHovered, child.props],
    );

    const onMouseLeave = useCallback(
        (e: MouseEvent) => {
            updateIsHovered(false);
            child.props.onMouseLeave?.(e);
        },
        [updateIsHovered, child.props],
    );

    const disableHoveredOnBlur = useCallback(
        (event: MouseEvent) => {
            // Check if the blur event occurred due to clicking outside the element
            // and the wrapperView contains the element that caused the blur and reset isHovered
            if (!ref.current?.contains(event.target as Node) && !ref.current?.contains(event.relatedTarget as Node)) {
                setIsHovered(false);
            }

            child.props.onBlur?.(event);
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

    return cloneElement(child, {
        ref: hijackRef,
        onMouseEnter,
        onMouseLeave,
        onBlur: disableHoveredOnBlur,
    });
}

export default forwardRef(ActiveHoverable);
