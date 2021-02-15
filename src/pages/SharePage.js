import React from 'react';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles, {getSafeAreaMargins, getSafeAreaPadding} from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import ShareManager, {sharedItemPropTypes} from '../libs/ShareManager';
import {redirect} from '../libs/actions/App';
import {clear as clearSharedItem} from '../libs/actions/SharedItem';
import {hide as hideSidebar} from '../libs/actions/Sidebar';
import {addAction, saveReportComment} from '../libs/actions/Report';
import ROUTES from '../ROUTES';
import CustomStatusBar from '../components/CustomStatusBar';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import AttachmentModal from '../components/AttachmentModal';
import OptionsList from '../components/OptionsList';
import {getShareOptions} from '../libs/OptionsListUtils';

const propTypes = {
    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,

    // List of users' personal details
    personalDetails: PropTypes.objectOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        avatarURL: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    })),

    // Shared item object
    ...sharedItemPropTypes,
};

const defaultProps = {
    currentlyViewedReportID: '',
    personalDetails: {},
};

class SharePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedReportId: '',
        };

        this.cancelShare = this.cancelShare.bind(this);
        this.addSharedItemToReport = this.addSharedItemToReport.bind(this);
    }

    /**
     * Clears the shared item and closes the Share Page.
     */
    cancelShare() {
        clearSharedItem();
        redirect(this.props.currentlyViewedReportID !== ''
            ? ROUTES.getReportRoute(this.props.currentlyViewedReportID)
            : ROUTES.HOME);
    }

    /**
     * Posts shared item to the selected report
     */
    addSharedItemToReport() {
        if (!this.props.sharedItem || !this.state.selectedReportId) {
            return;
        }

        switch (this.props.sharedItem.type) {
            case ShareManager.TYPE.TEXT:
                // Shared item is a text.
                // Save it as draft comment, so user would be able to preview before posting.
                saveReportComment(this.state.selectedReportId, this.props.sharedItem.data || '');
                break;
            case ShareManager.TYPE.FILE:
                // Shared item is a file.
                // Post it right away, because user already previewed it in modal.
                addAction(this.state.selectedReportId, '', this.props.sharedItem.data);
                break;
            default:
                break;
        }

        clearSharedItem();
        hideSidebar();

        redirect(ROUTES.getReportRoute(this.state.selectedReportId));
    }

    render() {
        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);

        const {recentReports} = getShareOptions(
            this.props.reports,
            this.props.personalDetails,
            activeReportID,
        );

        const sections = [{
            title: '',
            indexOffset: 0,
            data: recentReports,
            shouldShow: true,
        }];

        return (
            <>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
                    {insets => (
                        <View
                            style={[styles.appContentWrapper,
                                styles.flex1,
                                getSafeAreaPadding(insets),
                            ]}
                        >
                            <HeaderWithCloseButton
                                textSize="large"
                                title="Send to..."
                                onCloseButtonPress={this.cancelShare}
                                shouldShowBorderBottom={false}
                            />
                            <AttachmentModal
                                title="Upload Attachment"
                                onConfirm={() => {
                                    this.addSharedItemToReport();
                                }}
                            >
                                {({displayFileInModal}) => (
                                    <OptionsList
                                        contentContainerStyles={[
                                            styles.sidebarListContainer,
                                            {paddingBottom: getSafeAreaMargins(insets).marginBottom},
                                        ]}
                                        sections={sections}
                                        onSelectRow={(option) => {
                                            this.setState({
                                                selectedReportId: option.reportID,
                                            }, () => {
                                                if (this.props.sharedItem.type === ShareManager.TYPE.TEXT) {
                                                    // Shared item is text. Post it to the report.
                                                    this.addSharedItemToReport();
                                                } else {
                                                    // Shared item is file. Preview it in the modal.
                                                    displayFileInModal({file: this.props.sharedItem.data});
                                                }
                                            });
                                        }}
                                        hideSectionHeaders
                                    />
                                )}
                            </AttachmentModal>
                        </View>
                    )}
                </SafeAreaInsetsContext.Consumer>
            </>
        );
    }
}

SharePage.propTypes = propTypes;
SharePage.defaultProps = defaultProps;

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
    sharedItem: {
        key: ONYXKEYS.SHARED_ITEM,
    },
})(SharePage);
