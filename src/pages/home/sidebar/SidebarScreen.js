import React, {Component} from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import CreateMenu from '../../../components/CreateMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Timing from '../../../libs/actions/Timing';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import {ChatBubble, Users} from '../../../components/Icon/Expensicons';

const propTypes = {
    // propTypes for withWindowDimensions
    ...windowDimensionsPropTypes,
};

class SidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };
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
        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    /**
     * Method called when a pinned chat is selected.
     */
    startTimer() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
    }

    render() {
        return (
            <ScreenWrapper
                includePaddingBottom={false}
                style={[styles.sidebar]}
            >
                {insets => (
                    <>
                        <View style={[styles.flex1]}>
                            <SidebarLinks
                                onLinkClick={this.startTimer}
                                insets={insets}
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                            />
                            <FAB
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.toggleCreateMenu}
                            />
                        </View>
                        <CreateMenu
                            onClose={this.toggleCreateMenu}
                            isVisible={this.state.isCreateMenuActive}
                            anchorPosition={styles.createMenuPositionSidebar}
                            animationIn="fadeInLeft"
                            animationOut="fadeOutLeft"
                            onItemSelected={this.onCreateMenuItemSelected}
                            menuItems={[
                                {
                                    icon: ChatBubble,
                                    text: 'New Chat',
                                    onSelected: () => Navigation.navigate(ROUTES.NEW_CHAT),
                                },
                                {
                                    icon: Users,
                                    text: 'New Group',
                                    onSelected: () => Navigation.navigate(ROUTES.IOU_BILL),
                                },
                            ]}

                        /**
                         * Temporarily hiding IOU Modal options while Modal is incomplete. Will
                         * be replaced by a beta flag once IOUConfirm is completed.
                        menuOptions={[
                            CONST.MENU_ITEM_KEYS.NEW_CHAT,
                            CONST.MENU_ITEM_KEYS.REQUEST_MONEY,
                            CONST.MENU_ITEM_KEYS.NEW_GROUP,
                            CONST.MENU_ITEM_KEYS.SPLIT_BILL,
                        ]}
                        */
                        />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

SidebarScreen.propTypes = propTypes;
export default withWindowDimensions(SidebarScreen);
