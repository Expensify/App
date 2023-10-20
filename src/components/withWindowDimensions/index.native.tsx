import React, {createContext, useState, useEffect, useMemo, ComponentType, RefAttributes, ForwardedRef} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, ScaledSize} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import variables from '../../styles/variables';
import getWindowHeightAdjustment from '../../libs/getWindowHeightAdjustment';
import {WindowDimensionsContextData, WindowDimensionsProps} from './types';
import ChildrenProps from '../../types/utils/ChildrenProps';

const WindowDimensionsContext = createContext<WindowDimensionsContextData | null>(null);
const windowDimensionsPropTypes = {
    // Width of the window
    windowWidth: PropTypes.number.isRequired,

    // Height of the window
    windowHeight: PropTypes.number.isRequired,

    // Is the window width extra narrow, like on a Fold mobile device?
    isExtraSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width medium sized, like on a tablet device?
    isMediumScreenWidth: PropTypes.bool.isRequired,

    // Is the window width wide, like on a browser or desktop?
    isLargeScreenWidth: PropTypes.bool.isRequired,
};

function WindowDimensionsProvider(props: ChildrenProps) {
    const [windowDimension, setWindowDimension] = useState(() => {
        const initialDimensions = Dimensions.get('window');
        return {
            windowHeight: initialDimensions.height,
            windowWidth: initialDimensions.width,
        };
    });

    useEffect(() => {
        const onDimensionChange = (newDimensions: {window: ScaledSize}) => {
            const {window} = newDimensions;
            setWindowDimension({
                windowHeight: window.height,
                windowWidth: window.width,
            });
        };

        const dimensionsEventListener = Dimensions.addEventListener('change', onDimensionChange);

        return () => {
            if (!dimensionsEventListener) {
                return;
            }
            dimensionsEventListener.remove();
        };
    }, []);
    const insets = useSafeAreaInsets();
    const adjustment = getWindowHeightAdjustment(insets);
    const contextValue = useMemo(() => {
        const isExtraSmallScreenWidth = windowDimension.windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
        return {
            windowHeight: windowDimension.windowHeight + adjustment,
            windowWidth: windowDimension.windowWidth,
            isExtraSmallScreenWidth,
            isSmallScreenWidth: true,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
        };
    }, [windowDimension.windowHeight, windowDimension.windowWidth, adjustment]);
    return <WindowDimensionsContext.Provider value={contextValue}>{props.children}</WindowDimensionsContext.Provider>;
}

WindowDimensionsProvider.displayName = 'WindowDimensionsProvider';

/**
 * @param WrappedComponent
 * @returns
 */
export default function withWindowDimensions<TProps extends WindowDimensionsProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    function WithWindowDimensions(props: Omit<TProps, keyof WindowDimensionsProps>, ref: ForwardedRef<TRef>) {
        return (
            <WindowDimensionsContext.Consumer>
                {(windowDimensionsProps) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...windowDimensionsProps}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(props as TProps)}
                        ref={ref}
                    />
                )}
            </WindowDimensionsContext.Consumer>
        );
    }

    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithWindowDimensions);
}

export {WindowDimensionsProvider, windowDimensionsPropTypes};
