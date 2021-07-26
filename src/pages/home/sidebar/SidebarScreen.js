import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import PopoverMenu from '../../../components/PopoverMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Timing from '../../../libs/actions/Timing';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import {
    ChatBubble,
    Users,
    MoneyCircle,
    Receipt,
    NewWorkspace,
} from '../../../components/Icon/Expensicons';
import Permissions from '../../../libs/Permissions';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
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

    componentDidMount() {
        Timing.start(CONST.TIMING.SIDEBAR_LOADED);
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
                {({insets}) => (
                    <>
                        <View style={[styles.flex1]}>
                            <SidebarLinks
                                onLinkClick={this.startTimer}
                                insets={insets}
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                            />
                            <FAB
                                accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                                accessibilityRole="button"
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.toggleCreateMenu}
                            />
                        </View>
                        <PopoverMenu
                            onClose={this.toggleCreateMenu}
                            isVisible={this.state.isCreateMenuActive}
                            anchorPosition={styles.createMenuPositionSidebar}
                            animationIn="fadeInLeft"
                            animationOut="fadeOutLeft"
                            onItemSelected={this.onCreateMenuItemSelected}
                            menuItems={[
                                {
                                    icon: ChatBubble,
                                    text: this.props.translate('sidebarScreen.newChat'),
                                    onSelected: () => Navigation.navigate(ROUTES.NEW_CHAT),
                                },
                                {
                                    icon: Users,
                                    text: this.props.translate('sidebarScreen.newGroup'),
                                    onSelected: () => Navigation.navigate(ROUTES.NEW_GROUP),
                                },
                                ...(Permissions.canUseIOU(this.props.betas) ? [
                                    {
                                        icon: MoneyCircle,
                                        text: this.props.translate('iou.requestMoney'),
                                        onSelected: () => Navigation.navigate(ROUTES.IOU_REQUEST),
                                    },
                                ] : []),
                                ...(Permissions.canUseIOU(this.props.betas) ? [
                                    {
                                        icon: Receipt,
                                        text: this.props.translate('iou.splitBill'),
                                        onSelected: () => Navigation.navigate(ROUTES.IOU_BILL),
                                    },
                                ] : []),
                                ...(Permissions.canUseFreePlan(this.props.betas) ? [
                                    {
                                        icon: NewWorkspace,
                                        iconWidth: 46,
                                        iconHeight: 40,
                                        text: this.props.translate('workspace.new.newWorkspace'),
                                        description: this.props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                        onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_NEW),
                                    },
                                ] : []),
                            ]}
                        />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

SidebarScreen.propTypes = propTypes;
export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SidebarScreen);
