/**
 * This is a file containing constants for navigators located directly in the RootStack in AuthScreens file
 * The ResponsiveStackNavigator displays stack differently based on these constants
 * */

type Navigator = {
    CENTRAL_PANE_NAVIGATOR: string,
    RIGHT_MODAL_NAVIGATOR: string,
    FULL_SCREEN_NAVIGATOR: string,
};

const NAVIGATORS: Navigator =  {
    CENTRAL_PANE_NAVIGATOR: 'CentralPaneNavigator',
    RIGHT_MODAL_NAVIGATOR: 'RightModalNavigator',
    FULL_SCREEN_NAVIGATOR: 'FullScreenNavigator',
};

export default NAVIGATORS;