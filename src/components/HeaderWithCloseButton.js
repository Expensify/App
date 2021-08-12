import React from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';
import Header from './Header';
import Icon from './Icon';
import {Close, Download, BackArrow} from './Icon/Expensicons';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import VideoChatButtonAndMenu from './VideoChatButtonAndMenu';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress: PropTypes.func,

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress: PropTypes.func,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether weshould show a inbox call button */
    shouldShowInboxCallButton: PropTypes.bool,

    inboxCallTaskID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    title: '',
    onDownloadButtonPress: () => {},
    onCloseButtonPress: () => {},
    onBackButtonPress: () => {},
    shouldShowBackButton: false,
    shouldShowBorderBottom: false,
    shouldShowDownloadButton: false,
    shouldShowInboxCallButton: false,
    inboxCallTaskID: '',
};

const HeaderWithCloseButton = props => (
    <View style={[styles.headerBar, props.shouldShowBorderBottom && styles.borderBottom]}>
        <View style={[
            styles.dFlex,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.flexGrow1,
            styles.justifyContentBetween,
            styles.overflowHidden,
        ]}
        >
            {props.shouldShowBackButton && (
            <TouchableOpacity
                onPress={props.onBackButtonPress}
                style={[styles.touchableButtonImage]}
            >
                <Icon src={BackArrow} />
            </TouchableOpacity>
            )}
            <Header title={props.title} />
            <View style={[styles.reportOptions, styles.flexRow]}>
                {
                    props.shouldShowDownloadButton && (
                        <TouchableOpacity
                            onPress={props.onDownloadButtonPress}
                            style={[styles.touchableButtonImage]}
                        >
                            <Icon src={Download} />
                        </TouchableOpacity>
                    )
                }

                {
                    props.shouldShowInboxCallButton && <VideoChatButtonAndMenu openInboxCall taskID={props.inboxCallTaskID} />

                }

                <TouchableOpacity
                    onPress={props.onCloseButtonPress}
                    style={[styles.touchableButtonImage]}
                    accessibilityRole="button"
                    accessibilityLabel={props.translate('common.close')}
                >
                    <Icon src={Close} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default compose(withLocalize)(HeaderWithCloseButton);
