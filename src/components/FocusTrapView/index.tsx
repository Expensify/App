/*
 * The FocusTrap is only used on web and desktop
 */
import FocusTrap from 'focus-trap-react';
import React, {useRef} from 'react';
import {View} from 'react-native';
import FocusTrapViewProps from './types';

function FocusTrapView({isEnabled = true, isActive = true, shouldEnableAutoFocus = false, ...props}: FocusTrapViewProps) {
    /**
     * Focus trap always needs a focusable element.
     * In case that we don't have any focusable elements in the modal,
     * the FocusTrap will use fallback View element using this ref.
     */
    const ref = useRef<HTMLElement>();

    return isEnabled ? (
        <FocusTrap
            active={isActive}
            focusTrapOptions={{
                initialFocus: () => (shouldEnableAutoFocus && ref.current) ?? false,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                fallbackFocus: () => ref.current!,
                clickOutsideDeactivates: true,
            }}
        >
            <View
                ref={ref as unknown as React.RefObject<View>}
                tabIndex={0}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FocusTrap>
    ) : (
        props.children
    );
}

FocusTrapView.displayName = 'FocusTrapView';

export default FocusTrapView;
