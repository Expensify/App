/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import Keyboard from '@libs/NativeWebKeyboard';

/**
 * A Higher Order Component (HOC) that wraps a given React component and blocks viewport scroll when the keyboard is visible.
 * It does this by capturing the current scrollY position when the keyboard is shown, then scrolls back to this position smoothly on 'touchend' event.
 * This scroll blocking is removed when the keyboard hides.
 * This HOC is doing nothing on native platforms.
 *
 * The HOC also passes through a `forwardedRef` prop to the wrapped component, which can be used to assign a ref to the wrapped component.
 *
 * @export
 * @param {React.Component} WrappedComponent - The component to be wrapped by the HOC.
 * @returns {React.Component} A component that includes the scroll-blocking behaviour.
 *
 * @example
 * export default withBlockViewportScroll(MyComponent);
 *
 * // Inside MyComponent definition
 * // You can access the ref passed from HOC as follows:
 * const MyComponent = React.forwardRef((props, ref) => (
 *  // use ref here
 * ));
 */
export default function WithBlockViewportScrollHOC(WrappedComponent) {
    function WithBlockViewportScroll(props, ref) {
        const optimalScrollY = useRef(0);
        const keyboardShowListenerRef = useRef(() => {});
        const keyboardHideListenerRef = useRef(() => {});

        useEffect(() => {
            const handleTouchEnd = () => {
                window.scrollTo({top: optimalScrollY.current, behavior: 'smooth'});
            };

            const handleKeybShow = () => {
                optimalScrollY.current = window.scrollY;
                window.addEventListener('touchend', handleTouchEnd);
            };

            const handleKeybHide = () => {
                window.removeEventListener('touchend', handleTouchEnd);
            };

            keyboardShowListenerRef.current = Keyboard.addListener('keyboardDidShow', handleKeybShow);
            keyboardHideListenerRef.current = Keyboard.addListener('keyboardDidHide', handleKeybHide);

            return () => {
                keyboardShowListenerRef.current();
                keyboardHideListenerRef.current();
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }, []);

        return (
            <WrappedComponent
                {...props}
                ref={ref}
            />
        );
    }

    WithBlockViewportScroll.displayName = `WithBlockViewportScroll(${getComponentDisplayName(WrappedComponent)})`;
    WithBlockViewportScroll.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithBlockViewportScroll.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef(WithBlockViewportScroll);
}
