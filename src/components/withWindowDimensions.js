import React, {forwardRef, createContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';
import getWindowHeightAdjustment from '../libs/getWindowHeightAdjustment';

const WindowDimensionsContext = createContext(null);
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

const windowDimensionsProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

function WindowDimensionsProvider(props) {
    const [windowDimension, setWindowDimension] = useState(() => {
        const initialDimensions = Dimensions.get('window');
        return {
            windowHeight: initialDimensions.height,
            windowWidth: initialDimensions.width,
        };
    });

    useEffect(() => {
        const onDimensionChange = (newDimensions) => {
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

    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => {
                const isExtraSmallScreenWidth = windowDimension.windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
                const isSmallScreenWidth = windowDimension.windowWidth <= variables.mobileResponsiveWidthBreakpoint;
                const isMediumScreenWidth = !isSmallScreenWidth && windowDimension.windowWidth <= variables.tabletResponsiveWidthBreakpoint;
                const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;
                return (
                    <WindowDimensionsContext.Provider
                        value={{
                            windowHeight: windowDimension.windowHeight + getWindowHeightAdjustment(insets),
                            windowWidth: windowDimension.windowWidth,
                            isExtraSmallScreenWidth,
                            isSmallScreenWidth,
                            isMediumScreenWidth,
                            isLargeScreenWidth,
                        }}
                    >
                        {props.children}
                    </WindowDimensionsContext.Provider>
                );
            }}
        </SafeAreaInsetsContext.Consumer>
    );
}

WindowDimensionsProvider.propTypes = windowDimensionsProviderPropTypes;
WindowDimensionsProvider.displayName = 'WindowDimensionsProvider';

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withWindowDimensions(WrappedComponent) {
    const WithWindowDimensions = forwardRef((props, ref) => (
        <WindowDimensionsContext.Consumer>
            {(windowDimensionsProps) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...windowDimensionsProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </WindowDimensionsContext.Consumer>
    ));

    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return WithWindowDimensions;
}

export {WindowDimensionsProvider, windowDimensionsPropTypes};
