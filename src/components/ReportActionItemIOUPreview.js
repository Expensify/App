import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Text from './Text';
import MultipleAvatars from './MultipleAvatars';
import styles from '../styles/styles';

const personalDetailsPropTypes = PropTypes.shape({
    // This is either the user's full name, or their login if full name is an empty string
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReport: PropTypes.bool.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /* --- Onyx Props --- */
    // Active IOU Report for current report
    iou: PropTypes.shape({
        // Email address of the manager in this iou report
        managerEmail: PropTypes.string,

        // Email address of the creator of this iou report
        ownerEmail: PropTypes.string,

        // Outstanding amount of this transaction
        cachedTotal: PropTypes.string,
    }),

    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user email
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    iou: null,
};

class ReportActionItemIOUPreview extends React.Component {
    /**
     * Creates IOU preview pay button.
     *
     * @returns {View}
     */
    createPayButton() {
        return (
            <TouchableOpacity
                style={[styles.buttonSmall, styles.normalRadius, styles.buttonSuccess, styles.mt6]}
            >
                <Text
                    style={[
                        styles.buttonSmallText,
                        styles.buttonSuccessText,
                    ]}
                >
                    Pay
                </Text>
            </TouchableOpacity>
        );
    }

    /**
     * Creates IOU preview box view if outstanding amount is not 0.
     *
     * @returns {View}
     */
    createPreviewBox() {
        const managerName = lodashGet(
            this.props.personalDetails,
            [this.props.iou.managerEmail, 'displayName'],
            this.props.iou.managerEmail,
        );
        const ownerName = lodashGet(
            this.props.personalDetails,
            [this.props.iou.ownerEmail, 'displayName'],
            this.props.iou.ownerEmail,
        );
        const managerAvatar = lodashGet(this.props.personalDetails, [this.props.iou.managerEmail, 'avatar'], '');
        const ownerAvatar = lodashGet(this.props.personalDetails, [this.props.iou.ownerEmail, 'avatar'], '');
        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const cachedTotal = this.props.iou.cachedTotal.replace(/[()]/g, '');
        const amount = Number(cachedTotal.substring(1));

        if (amount === 0) {
            return null;
        }

        return (
            <View style={[styles.iouPreviewBox, {width: this.props.isSmallScreenWidth ? '100%' : '50%'}]}>
                <View style={[styles.flexRow]}>
                    <View style={styles.flex1}>
                        <Text style={styles.h1}>{cachedTotal}</Text>
                        <Text style={styles.mt2}>
                            {managerName}
                            {' owes '}
                            {ownerName}
                        </Text>
                    </View>
                    <MultipleAvatars
                        avatarImageURLs={[managerAvatar, ownerAvatar]}
                        styles={{
                            secondAvatar: {
                                bottom: -3,
                                right: -25,
                            },
                        }}
                    />
                </View>
                {(this.props.iou.managerEmail === sessionEmail) ? (
                    this.createPayButton()
                )
                    : null}
            </View>
        );
    }

    render() {
        return (
            <View>
                <ReportActionItemIOUQuote action={this.props.action} />
                {this.props.isMostRecentIOUReport && this.props.iou ? (
                    this.createPreviewBox()
                )
                    : null}
            </View>
        );
    }
}

ReportActionItemIOUPreview.propTypes = propTypes;
ReportActionItemIOUPreview.defaultProps = defaultProps;
ReportActionItemIOUPreview.displayName = 'ReportActionItemIOUPreview';

export default withWindowDimensions(withOnyx({
    iou: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ReportActionItemIOUPreview));
