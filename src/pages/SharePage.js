import React from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context/src/SafeAreaContext';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import ShareManager from '../libs/ShareManager';
import {redirect} from '../libs/actions/App';
import {clear as clearSharedItem} from '../libs/actions/SharedItem';
import {hide as hideSidebar} from '../libs/actions/Sidebar';
import {addAction} from '../libs/actions/Report';
import ROUTES from '../ROUTES';
import CustomStatusBar from '../components/CustomStatusBar';
import SidebarLinks from './home/sidebar/SidebarLinks';
import FAB from '../components/FAB';
import CreateMenu from '../components/CreateMenu';
import * as ChatSwitcher from '../libs/actions/ChatSwitcher';

const propTypes = {
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,

    // Shared item object
    sharedItem: PropTypes.shape({
        // Shared item type (one of the `ShareType.*`)
        type: PropTypes.string.isRequired,

        // Shared item data. Differs depending on type
        data: PropTypes.oneOfType([
            // Text or HTML for `ShareType.TEXT`
            PropTypes.string,

            // File data structure for `ShareType.FILE`
            PropTypes.shape({
                // File name
                name: PropTypes.string.isRequired,

                // File MIME type
                type: PropTypes.string.isRequired,

                // File URI
                uri: PropTypes.string.isRequired,
            }),
        ]).isRequired,
    }),
};

const defaultProps = {
    currentlyViewedReportID: '',
    sharedItem: null,
};

class SharePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCreateMenuActive: false,
        };

        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.onLinkClick = this.onLinkClick.bind(this);
        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.addSharedItemToReport = this.addSharedItemToReport.bind(this);
    }

    /**
     * Clears the shared item and closes Share Page.
     */
    onCloseButtonClick() {
        clearSharedItem();
        redirect(this.props.currentlyViewedReportID !== ''
            ? ROUTES.getReportRoute(this.props.currentlyViewedReportID)
            : ROUTES.HOME);
    }

    /**
     * Hides navigation menu on redirect to report page.
     */
    onLinkClick() {
        hideSidebar();
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
        ChatSwitcher.show();
    }

    /**
     * Posts shared item to selected report
     *
     * @param {Number} reportID report id
     */
    addSharedItemToReport(reportID) {
        if (!this.props.sharedItem) {
            return;
        }

        switch (this.props.sharedItem.type) {
            case ShareManager.TYPE.TEXT:
                addAction(reportID, this.props.sharedItem.data);
                break;
            case ShareManager.TYPE.FILE:
                addAction(reportID, '', this.props.sharedItem.data);
                break;
            default:
                break;
        }

        clearSharedItem();
    }

    /**
     * Method called when we click the floating action button
     *
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    render() {
        return (
            <SafeAreaProvider>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
                    {insets => (
                        <>
                            <View style={[styles.flex1, styles.sidebar]}>
                                <SidebarLinks
                                    title="Send to..."
                                    showCloseButton
                                    insets={insets}
                                    onCloseButtonClick={this.onCloseButtonClick}
                                    onLinkClick={this.onLinkClick}
                                    onReportSelected={this.addSharedItemToReport}
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
                            />
                        </>
                    )}
                </SafeAreaInsetsContext.Consumer>
            </SafeAreaProvider>
        );
    }
}

SharePage.propTypes = propTypes;
SharePage.defaultProps = defaultProps;

export default withOnyx({
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
    sharedItem: {
        key: ONYXKEYS.SHARED_ITEM,
    },
})(SharePage);
