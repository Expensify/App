import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles, {getNavigationMenuStyle} from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import CreateMenu from '../../../components/CreateMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import {
    hide as hideSidebar,
    show as showSidebar,
} from '../../../libs/actions/Sidebar';
import variables from '../../../styles/variables';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import Timing from '../../../libs/actions/Timing';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    // propTypes for withWindowDimensions
    ...windowDimensionsPropTypes,
};

class SidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.showNavigationMenu = this.showNavigationMenu.bind(this);
        this.recordTimerAndHideSidebar = this.recordTimerAndHideSidebar.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };

        this.animation = new Animated.Value(
            props.isSidebarShown ? 1 : 0,
        );
    }

    componentDidMount() {
        // Set up the navigationMenu correctly once on init
        if (!this.props.isSmallScreenWidth) {
            showSidebar();
        }
    }

    componentDidUpdate(prevProps) {
        // Always show the sidebar if we are moving from small to large screens
        if (prevProps.isSmallScreenWidth && !this.props.isSmallScreenWidth) {
            showSidebar();
        }
        if (this.props.isSidebarShown === prevProps.isSidebarShown) {
            // Nothing changed, don't trigger animation or re-render
            return;
        }
        this.animateNavigationMenu(prevProps.isSidebarShown);
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        redirect(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        // Prevent from possibly toggling the create menu with the sidebar hidden
        if (!this.props.isSidebarShown) {
            return;
        }
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    /**
     * Method called when we want to show the navigationMenu,
     * will not do anything if it already open
     * Only changes navigationMenu state on smaller screens (e.g. Mobile and mWeb)
     */
    showNavigationMenu() {
        if (this.props.isSidebarShown) {
            return;
        }

        showSidebar();
    }

    /**
     * Animates the navigationMenu in and out.
     *
     * @param {Boolean} navigationMenuIsShown
     */
    animateNavigationMenu(navigationMenuIsShown) {
        Animated.timing(this.animation, {
            toValue: navigationMenuIsShown ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    /**
     * Method called when a pinned chat is selected.
     */
    recordTimerAndHideSidebar() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);

        if (!this.props.isSmallScreenWidth) {
            return;
        }

        hideSidebar();
    }

    render() {
        const sidebarWidth = this.props.isSmallScreenWidth
            ? this.props.windowWidth
            : variables.sideBarWidth;
        const translateXValue = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-sidebarWidth, 0],
        });
        return (
            <Animated.View style={[
                getNavigationMenuStyle(
                    this.props.windowWidth,
                    this.props.isSmallScreenWidth,
                ),
                {
                    transform: [
                        {translateX: translateXValue},
                    ],
                }]}
            >
                <ScreenWrapper
                    includePaddingBottom={false}
                >
                    {insets => (
                        <>
                            <View style={[styles.flex1, styles.sidebar]}>
                                <SidebarLinks
                                    onLinkClick={this.recordTimerAndHideSidebar}
                                    insets={insets}
                                    onAvatarClick={this.navigateToSettings}
                                />
                                <FAB
                                    isActive={this.state.isCreateMenuActive}
                                    onPress={this.toggleCreateMenu}
                                />
                            </View>
                            <CreateMenu
                                onClose={this.toggleCreateMenu}
                                isVisible={this.state.isCreateMenuActive}
                                onItemSelected={this.onCreateMenuItemSelected}
                                menuOptions={[
                                    CONST.MENU_ITEM_KEYS.NEW_CHAT,
                                    CONST.MENU_ITEM_KEYS.REQUEST_MONEY,
                                    CONST.MENU_ITEM_KEYS.NEW_GROUP,
                                    CONST.MENU_ITEM_KEYS.SPLIT_BILL,
                                ]}
                            />
                        </>
                    )}
                </ScreenWrapper>
            </Animated.View>
        );
    }
}

SidebarScreen.propTypes = propTypes;
export default compose(
    withWindowDimensions,
    withOnyx({
        isSidebarShown: {
            key: ONYXKEYS.IS_SIDEBAR_SHOWN,
        },
    }),
)(SidebarScreen);
