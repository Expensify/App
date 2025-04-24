import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import type {View} from 'react-native';
import FocusTrapForScreen from '@components/FocusTrap/FocusTrapForScreen';
import type FocusTrapForScreenProps from '@components/FocusTrap/FocusTrapForScreen/FocusTrapProps';
import withNavigationFallback from '@components/withNavigationFallback';
import type {ScreenWrapperContentProps} from './ScreenWrapperContent';
import ScreenWrapperContent from './ScreenWrapperContent';

type ScreenWrapperProps = Omit<ScreenWrapperContentProps, 'forwardedRef'> & {
    /** Whether to enable the navigation fallback context */
    enableNavigationFallbackContext?: boolean;

    /** Whether to enable the focus trap */
    enableFocusTrap?: boolean;

    /** Overrides the focus trap default settings */
    focusTrapSettings?: FocusTrapForScreenProps['focusTrapSettings'];
};

function ScreenWrapperContentWithFocusTrap({enableFocusTrap = true, focusTrapSettings, forwardedRef, ...props}: ScreenWrapperProps & {forwardedRef: ForwardedRef<View>}) {
    return enableFocusTrap ? (
        <FocusTrapForScreen focusTrapSettings={focusTrapSettings}>
            <ScreenWrapperContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                forwardedRef={forwardedRef}
            />
        </FocusTrapForScreen>
    ) : (
        <ScreenWrapperContent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={forwardedRef}
        />
    );
}
ScreenWrapperContentWithFocusTrap.displayName = 'ScreenWrapperContentWithFocusTrap';

function ScreenWrapper({enableNavigationFallbackContext = true, ...props}: ScreenWrapperProps, ref: ForwardedRef<View>) {
    const ContentWithNavigationFallback = useMemo(
        () => (enableNavigationFallbackContext ? withNavigationFallback(ScreenWrapperContentWithFocusTrap) : ScreenWrapperContentWithFocusTrap),
        [enableNavigationFallbackContext],
    );

    return (
        <ContentWithNavigationFallback
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    );
}

ScreenWrapper.displayName = 'ScreenWrapper';

export default forwardRef(ScreenWrapper);
