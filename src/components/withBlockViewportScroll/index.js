/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import Keyboard from '../../libs/NativeWebKeyboard';
import getComponentDisplayName from '../../libs/getComponentDisplayName';

export default function (WrappedComponent) {
    const WithBlockViewportScroll = (props) => {
        const optimalScrollY = useRef(0);
        const keybShowOff = useRef(() => {});
        const keybHideOff = useRef(() => {});

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

            keybShowOff.current = Keyboard.addListener('keyboardDidShow', handleKeybShow);
            keybHideOff.current = Keyboard.addListener('keyboardDidHide', handleKeybHide);

            return () => {
                keybShowOff.current();
                keybHideOff.current();
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }, []);

        return (
            <WrappedComponent
                {...props}
                ref={props.forwardedRef}
            />
        );
    };

    WithBlockViewportScroll.displayName = `WithBlockViewportScroll(${getComponentDisplayName(WrappedComponent)})`;
    WithBlockViewportScroll.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithBlockViewportScroll.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        <WithBlockViewportScroll
            {...props}
            forwardedRef={ref}
        />
    ));
}
