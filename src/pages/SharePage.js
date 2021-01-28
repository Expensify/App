import React from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context/src/SafeAreaContext';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import {redirect} from '../libs/actions/App';
import {clear as clearSharedItem} from '../libs/actions/SharedItem';
import {hide as hideSidebar} from '../libs/actions/Sidebar';
import ROUTES from '../ROUTES';
import CustomStatusBar from '../components/CustomStatusBar';
import SidebarLinks from './home/sidebar/SidebarLinks';
import FAB from '../components/FAB';
import CreateMenu from '../components/CreateMenu';

const propTypes = {
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    currentlyViewedReportID: '',
};

class SharePage extends React.Component {
    constructor(props) {
        super(props);

        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.onLinkClick = this.onLinkClick.bind(this);
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

    render() {
        const props = {};

        return (
            <SafeAreaProvider>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
                    {insets => (
                        <>
                            <View style={[styles.flex1, styles.sidebar]}>
                                <SidebarLinks
                                    title="Send to..."
                                    showAvatar={false}
                                    showCloseButton
                                    insets={insets}
                                    onCloseButtonClick={this.onCloseButtonClick}
                                    onLinkClick={this.onLinkClick}
                                />
                                <FAB
                                    isActive={props.isCreateMenuActive}
                                    onPress={props.toggleCreateMenu}
                                />
                            </View>
                            <CreateMenu
                                onClose={props.toggleCreateMenu}
                                isVisible={props.isCreateMenuActive}
                                onItemSelected={props.onCreateMenuItemSelected}
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
})(SharePage);
