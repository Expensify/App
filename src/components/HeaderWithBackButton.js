import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Keyboard} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Header from './Header';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Tooltip from './Tooltip';
import getButtonState from '../libs/getButtonState';
import * as StyleUtils from '../styles/StyleUtils';
import compose from '../libs/compose';
import ThreeDotsMenu, {ThreeDotsMenuItemPropTypes} from './ThreeDotsMenu';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withKeyboardState, {keyboardStatePropTypes} from './withKeyboardState';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import participantPropTypes from './participantPropTypes';
import CONST from '../CONST';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import PinButton from './PinButton';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Subtitle of the header */
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress: PropTypes.func,

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress: PropTypes.func,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress: PropTypes.func,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether we should show a get assistance (question mark) button */
    shouldShowGetAssistanceButton: PropTypes.bool,

    /** Whether we should show a pin button */
    shouldShowPinButton: PropTypes.bool,

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

    /** The anchor alignment of the menu */
    threeDotsAnchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** Whether we should show a close button */
    shouldShowCloseButton: PropTypes.bool,

    /** Whether we should show a back button */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show the step counter */
    shouldShowStepCounter: PropTypes.bool,

    /** The guides call taskID to associate with the get assistance button, if we show it */
    guidesCallTaskID: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
        text: PropTypes.string,
    }),

    /** Whether we should show an avatar */
    shouldShowAvatarWithDisplay: PropTypes.bool,

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report: iouReportPropTypes,

    /** Policies, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Policies, if we're showing the details for a report and need participant details for AvatarWithDisplay */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...withLocalizePropTypes,
    ...withDelayToggleButtonStatePropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    title: '',
    subtitle: '',
    onDownloadButtonPress: () => {},
    onBackButtonPress: () => Navigation.goBack(),
    onCloseButtonPress: () => Navigation.dismissModal(),
    onThreeDotsButtonPress: () => {},
    shouldShowBorderBottom: false,
    shouldShowDownloadButton: false,
    shouldShowGetAssistanceButton: false,
    shouldShowThreeDotsButton: false,
    shouldShowPinButton: false,
    shouldShowCloseButton: false,
    shouldShowStepCounter: true,
    shouldShowBackButton: true,
    shouldShowAvatarWithDisplay: false,
    report: null,
    policies: {},
    personalDetails: {},
    guidesCallTaskID: '',
    stepCounter: null,
    threeDotsMenuItems: [],
    threeDotsAnchorPosition: {
        vertical: 0,
        horizontal: 0,
    },
    threeDotsAnchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
};

class HeaderWithBackButton extends Component {
    constructor(props) {
        super(props);

        this.triggerButtonCompleteAndDownload = this.triggerButtonCompleteAndDownload.bind(this);
    }

    /**
     * Method to trigger parent onDownloadButtonPress to download the file
     * and toggleDelayButtonState to set button state and revert it after sometime.
     */
    triggerButtonCompleteAndDownload() {
        if (this.props.isDelayButtonStateComplete) {
            return;
        }

        this.props.onDownloadButtonPress();
        this.props.toggleDelayButtonState(true);
    }

    render() {
        return (
            <View style={[styles.headerBar, this.props.shouldShowBorderBottom && styles.borderBottom, this.props.shouldShowBackButton && styles.pl2]}>
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                    {this.props.shouldShowBackButton && (
                        <Tooltip text={this.props.translate('common.back')}>
                            <PressableWithoutFeedback
                                onPress={() => {
                                    if (this.props.isKeyboardShown) {
                                        Keyboard.dismiss();
                                    }
                                    this.props.onBackButtonPress();
                                }}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole="button"
                                accessibilityLabel={this.props.translate('common.back')}
                            >
                                <Icon src={Expensicons.BackArrow} />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    {this.props.shouldShowAvatarWithDisplay && (
                        <AvatarWithDisplayName
                            report={this.props.report}
                            policies={this.props.policies}
                            personalDetails={this.props.personalDetails}
                        />
                    )}
                    {!this.props.shouldShowAvatarWithDisplay && (
                        <Header
                            title={this.props.title}
                            subtitle={this.props.stepCounter && this.props.shouldShowStepCounter ? this.props.translate('stepCounter', this.props.stepCounter) : this.props.subtitle}
                        />
                    )}
                    <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                        {this.props.shouldShowDownloadButton && (
                            <Tooltip text={this.props.translate('common.download')}>
                                <PressableWithoutFeedback
                                    onPress={(e) => {
                                        // Blur the pressable in case this button triggers a Growl notification
                                        // We do not want to overlap Growl with the Tooltip (#15271)
                                        e.currentTarget.blur();
                                        this.triggerButtonCompleteAndDownload();
                                    }}
                                    style={[styles.touchableButtonImage]}
                                    accessibilityRole="button"
                                    accessibilityLabel={this.props.translate('common.download')}
                                >
                                    <Icon
                                        src={Expensicons.Download}
                                        fill={StyleUtils.getIconFillColor(getButtonState(false, false, this.props.isDelayButtonStateComplete))}
                                    />
                                </PressableWithoutFeedback>
                            </Tooltip>
                        )}

                        {this.props.shouldShowGetAssistanceButton && (
                            <Tooltip text={this.props.translate('getAssistancePage.questionMarkButtonTooltip')}>
                                <PressableWithoutFeedback
                                    onPress={() => Navigation.navigate(ROUTES.getGetAssistanceRoute(this.props.guidesCallTaskID))}
                                    style={[styles.touchableButtonImage]}
                                    accessibilityRole="button"
                                    accessibilityLabel={this.props.translate('getAssistancePage.questionMarkButtonTooltip')}
                                >
                                    <Icon src={Expensicons.QuestionMark} />
                                </PressableWithoutFeedback>
                            </Tooltip>
                        )}

                        {this.props.shouldShowPinButton && <PinButton report={this.props.report} />}

                        {this.props.shouldShowThreeDotsButton && (
                            <ThreeDotsMenu
                                menuItems={this.props.threeDotsMenuItems}
                                onIconPress={this.props.onThreeDotsButtonPress}
                                anchorPosition={this.props.threeDotsAnchorPosition}
                                anchorAlignment={this.props.threeDotsAnchorAlignment}
                            />
                        )}

                        {this.props.shouldShowCloseButton && (
                            <Tooltip text={this.props.translate('common.close')}>
                                <PressableWithoutFeedback
                                    onPress={this.props.onCloseButtonPress}
                                    style={[styles.touchableButtonImage]}
                                    accessibilityRole="button"
                                    accessibilityLabel={this.props.translate('common.close')}
                                >
                                    <Icon src={Expensicons.Close} />
                                </PressableWithoutFeedback>
                            </Tooltip>
                        )}
                    </View>
                </View>
            </View>
        );
    }
}

HeaderWithBackButton.propTypes = propTypes;
HeaderWithBackButton.defaultProps = defaultProps;

export default compose(withLocalize, withDelayToggleButtonState, withKeyboardState)(HeaderWithBackButton);
