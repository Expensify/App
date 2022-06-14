import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View, Keyboard, Pressable,
} from 'react-native';
import styles from '../styles/styles';
import Header from './Header';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Tooltip from './Tooltip';
import ThreeDotsMenu, {ThreeDotsMenuItemPropTypes} from './ThreeDotsMenu';
import VirtualKeyboard from '../libs/VirtualKeyboard';
import getButtonState from '../libs/getButtonState';
import * as StyleUtils from '../styles/StyleUtils';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';
import compose from '../libs/compose';

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

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether we should show a get assistance (question mark) button */
    shouldShowGetAssistanceButton: PropTypes.bool,

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

    /** The guides call taskID to associate with the get assistance button, if we show it */
    guidesCallTaskID: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
    }),

    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,
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
    shouldShowGetAssistanceButton: false,
    shouldShowThreeDotsButton: false,
    shouldShowCloseButton: true,
    shouldShowStepCounter: true,
    guidesCallTaskID: '',
    stepCounter: null,
    threeDotsMenuItems: [],
    threeDotsAnchorPosition: {
        top: 0,
        left: 0,
    },
};

class HeaderWithCloseButton extends Component {
    constructor(props) {
        super(props);

        this.triggerButtonCompleteAndDownload = this.triggerButtonCompleteAndDownload.bind(this);
    }

    /**
     * Called on download button press
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
            <View style={[styles.headerBar, this.props.shouldShowBorderBottom && styles.borderBottom]}>
                <View style={[
                    styles.dFlex,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.flexGrow1,
                    styles.justifyContentBetween,
                    styles.overflowHidden,
                ]}
                >
                    {this.props.shouldShowBackButton && (
                        <Tooltip text={this.props.translate('common.back')}>
                            <Pressable
                                onPress={() => {
                                    if (VirtualKeyboard.isOpen()) {
                                        Keyboard.dismiss();
                                    }
                                    this.props.onBackButtonPress();
                                }}
                                style={[styles.touchableButtonImage]}
                            >
                                <Icon src={Expensicons.BackArrow} />
                            </Pressable>
                        </Tooltip>
                    )}
                    <Header
                        title={this.props.title}
                        subtitle={this.props.stepCounter && this.props.shouldShowStepCounter ? this.props.translate('stepCounter', this.props.stepCounter) : this.props.subtitle}
                    />
                    <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                        {
                            this.props.shouldShowDownloadButton && (
                            <Tooltip text={this.props.translate('common.download')}>

                                <Pressable
                                    onPress={this.triggerButtonCompleteAndDownload}
                                    style={[styles.touchableButtonImage]}
                                >
                                    <Icon
                                        src={Expensicons.Download}
                                        fill={StyleUtils.getIconFillColor(getButtonState(false, false, this.props.isDelayButtonStateComplete))}
                                    />
                                </Pressable>
                            </Tooltip>
                            )
                        }

                        {this.props.shouldShowGetAssistanceButton
                        && (
                        <Tooltip text={this.props.translate('getAssistancePage.questionMarkButtonTooltip')}>
                            <Pressable
                                onPress={() => Navigation.navigate(ROUTES.getGetAssistanceRoute(this.props.guidesCallTaskID))}
                                style={[styles.touchableButtonImage, styles.mr0]}
                                accessibilityRole="button"
                                accessibilityLabel={this.props.translate('getAssistancePage.questionMarkButtonTooltip')}
                            >
                                <Icon src={Expensicons.QuestionMark} />
                            </Pressable>
                        </Tooltip>
                        )}

                        {this.props.shouldShowThreeDotsButton && (
                            <ThreeDotsMenu
                                menuItems={this.props.threeDotsMenuItems}
                                onIconPress={this.props.onThreeDotsButtonPress}
                                iconStyles={[styles.mr0]}
                                anchorPosition={this.props.threeDotsAnchorPosition}
                            />
                        )}

                        {this.props.shouldShowCloseButton
                        && (
                        <Tooltip text={this.props.translate('common.close')}>
                            <Pressable
                                onPress={this.props.onCloseButtonPress}
                                style={[styles.touchableButtonImage, styles.mr0]}
                                accessibilityRole="button"
                                accessibilityLabel={this.props.translate('common.close')}
                            >
                                <Icon src={Expensicons.Close} />
                            </Pressable>
                        </Tooltip>
                        )}
                    </View>
                </View>
            </View>
        );
    }
}

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default compose(
    withLocalize,
    withDelayToggleButtonState,
)(HeaderWithCloseButton);
