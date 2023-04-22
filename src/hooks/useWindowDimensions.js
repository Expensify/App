import {useState, useEffect, useMemo} from 'react';
import {Dimensions} from 'react-native';
import variables from '../styles/variables';

export default function useWindowDimensions() {
    const initialDimensions = useMemo(() => Dimensions.get('window'), []);

    const [windowWidth, setWindowWidth] = useState(initialDimensions.width);
    const [windowHeight, setWindowHeight] = useState(initialDimensions.height);
    const [isSmallScreenWidth, setIsSmallScreenWidth] = useState(initialDimensions.width <= variables.mobileResponsiveWidthBreakpoint);
    const [isMediumScreenWidth, setIsMediumScreenWidth] = useState(initialDimensions.width > variables.mobileResponsiveWidthBreakpoint
        && initialDimensions.width <= variables.tabletResponsiveWidthBreakpoint);
    const [isLargeScreenWidth, setIsLargeScreenWidth] = useState(initialDimensions.width > variables.tabletResponsiveWidthBreakpoint);

    useEffect(() => {
        const eventListener = Dimensions.addEventListener(((dimensions) => {
            setWindowWidth(dimensions.width);
            setWindowHeight(dimensions.height);
            setIsSmallScreenWidth(dimensions.width <= variables.mobileResponsiveWidthBreakpoint);
            setIsMediumScreenWidth(dimensions.width > variables.mobileResponsiveWidthBreakpoint && dimensions <= variables.tabletResponsiveWidthBreakpoint);
            setIsLargeScreenWidth(dimensions.width > variables.tabletResponsiveWidthBreakpoint);
        }));
        return eventListener.remove;
    }, []);

    return {
        windowWidth,
        windowHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
    };
}
