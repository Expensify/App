import React from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';
import Header from './Header';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Tooltip from './Tooltip';
import InboxCallButton from './InboxCallButton';
import ThreeDotsMenu, {ThreeDotsMenuItemPropTypes} from './ThreeDotsMenu';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Subtitle of the header */
    subtitle: PropTypes.string,

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress: PropTypes.func,

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress: PropTypes.func,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress: PropTypes.func,

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether we should show a inbox call button */
    shouldShowInboxCallButton: PropTypes.bool,

    /** Whether we should show a more options (threedots) button */
    shouldShowThreeDotsButton: PropTypes.bool,

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems: ThreeDotsMenuItemPropTypes,

    /** The anchor position of the menu */
    threeDotsAnchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** Whether we should show a close button */
    shouldShowCloseButton: PropTypes.bool,

    /** Whether we should show the step counter */
    shouldShowStepCounter: PropTypes.bool,

    /** The task ID to associate with the call button, if we show it */
    inboxCallTaskID: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    title: '',
    subtitle: '',
    onDownloadButtonPress: () => {},
    onCloseButtonPress: () => {},
    onBackButtonPress: () => {},
    onThreeDotsButtonPress: () => {},
    shouldShowBackButton: false,
    shouldShowBorderBottom: false,
    shouldShowDownloadButton: false,
    shouldShowInboxCallButton: false,
    shouldShowThreeDotsButton: false,
    shouldShowCloseButton: true,
    shouldShowStepCounter: true,
    inboxCallTaskID: '',
    stepCounter: null,
    threeDotsMenuItems: [],
    threeDotsAnchorPosition: {
        top: 0,
        left: 0,
    },
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
                <Tooltip text={props.translate('common.back')}>
                    <TouchableOpacity
                        onPress={props.onBackButtonPress}
                        style={[styles.touchableButtonImage]}
                    >
                        <Icon src={Expensicons.BackArrow} />
                    </TouchableOpacity>
                </Tooltip>
            )}
            <Header
                title={props.title}
                subtitle={props.stepCounter && props.shouldShowStepCounter ? props.translate('stepCounter', props.stepCounter) : props.subtitle}
            />
            <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                {
                    props.shouldShowDownloadButton && (
                    <Tooltip text={props.translate('common.download')}>

                        <TouchableOpacity
                            onPress={props.onDownloadButtonPress}
                            style={[styles.touchableButtonImage]}
                        >
                            <Icon src={Expensicons.Download} />
                        </TouchableOpacity>
                    </Tooltip>
                    )
                }

                {props.shouldShowInboxCallButton && <InboxCallButton taskID={props.inboxCallTaskID} />}

                {props.shouldShowThreeDotsButton && (
                    <ThreeDotsMenu
                        menuItems={props.threeDotsMenuItems}
                        onIconPress={props.onThreeDotsButtonPress}
                        iconStyles={[styles.mr0]}
                        anchorPosition={props.threeDotsAnchorPosition}
                    />
                )}

                {props.shouldShowCloseButton
                && (
                <Tooltip text={props.translate('common.close')}>
                    <TouchableOpacity
                        onPress={props.onCloseButtonPress}
                        style={[styles.touchableButtonImage, styles.mr0]}
                        accessibilityRole="button"
                        accessibilityLabel={props.translate('common.close')}
                    >
                        <Icon src={Expensicons.Close} />
                    </TouchableOpacity>
                </Tooltip>
                )}
            </View>
        </View>
    </View>
);

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default withLocalize(HeaderWithCloseButton);
