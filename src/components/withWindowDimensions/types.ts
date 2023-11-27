import {ScaledSize} from 'react-native';

type WindowDimensionsContextData = {
    windowHeight: number;
    windowWidth: number;
    isExtraSmallScreenWidth: boolean;
    isSmallScreenWidth: boolean;
    isMediumScreenWidth: boolean;
    isLargeScreenWidth: boolean;
};

type WindowDimensionsProps = WindowDimensionsContextData & {
    // Width of the window
    windowWidth: number;

    // Height of the window
    windowHeight: number;

    // Is the window width extra narrow, like on a Fold mobile device?
    isExtraSmallScreenWidth: boolean;

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: boolean;

    // Is the window width medium sized, like on a tablet device?
    isMediumScreenWidth: boolean;

    // Is the window width wide, like on a browser or desktop?
    isLargeScreenWidth: boolean;
};

type NewDimensions = {window: ScaledSize};

export type {WindowDimensionsContextData, WindowDimensionsProps, NewDimensions};
