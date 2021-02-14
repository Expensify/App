import React from 'react';
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import ShareManager from '../libs/ShareManager';
import {redirect} from '../libs/actions/App';
import {clear as clearSharedItem} from '../libs/actions/SharedItem';
import {addAction} from '../libs/actions/Report';
import ROUTES from '../ROUTES';
import CustomStatusBar from '../components/CustomStatusBar';

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

        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
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

    render() {
        return (
            <SafeAreaProvider>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
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
