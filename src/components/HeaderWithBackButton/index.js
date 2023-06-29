import React, {Component} from 'react';
import {View, Keyboard} from 'react-native';
import styles from '../../styles/styles';
import Header from '../Header';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import getButtonState from '../../libs/getButtonState';
import * as StyleUtils from '../../styles/StyleUtils';
import compose from '../../libs/compose';
import ThreeDotsMenu from '../ThreeDotsMenu';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from '../withDelayToggleButtonState';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import AvatarWithDisplayName from '../AvatarWithDisplayName';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import PinButton from '../PinButton';
import {propTypes as headerWithBackButtonPropTypes, defaultProps as headerWithBackButtonDefaultProps} from './headerWithBackButtonPropTypes';

const propTypes = {
    ...headerWithBackButtonPropTypes,
    ...withLocalizePropTypes,
    ...withDelayToggleButtonStatePropTypes,
    ...keyboardStatePropTypes,
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
                            report={this.props.parentReport || this.props.report}
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
HeaderWithBackButton.defaultProps = headerWithBackButtonDefaultProps;

export default compose(withLocalize, withDelayToggleButtonState, withKeyboardState)(HeaderWithBackButton);
