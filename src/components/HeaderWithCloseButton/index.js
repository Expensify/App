import React, {Component} from 'react';
import {View, Keyboard, Pressable} from 'react-native';
import {propTypes as headerWithCloseButtonPropTypes, defaultProps} from './headerWithCloseButtonPropTypes';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
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

const propTypes = {
    ...headerWithCloseButtonPropTypes,
    ...withLocalizePropTypes,
    ...withDelayToggleButtonStatePropTypes,
    ...keyboardStatePropTypes,
};

class HeaderWithCloseButton extends Component {
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
            <View
                style={[
                    styles.headerBar,
                    this.props.shouldShowBorderBottom && styles.borderBottom,
                    this.props.shouldShowBackButton && styles.pl2,
                    this.props.backgroundColor && StyleUtils.getBackgroundColorStyle(this.props.backgroundColor),
                    ...this.props.containerStyles,
                ]}
            >
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                    {this.props.shouldShowBackButton && (
                        <Tooltip text={this.props.translate('common.back')}>
                            <Pressable
                                onPress={() => {
                                    if (this.props.isKeyboardShown) {
                                        Keyboard.dismiss();
                                    }
                                    this.props.onBackButtonPress();
                                }}
                                style={[styles.touchableButtonImage]}
                            >
                                {({hovered, pressed}) => (
                                    <Icon
                                        src={Expensicons.BackArrow}
                                        fill={themeColors.heading}
                                        opacity={StyleUtils.getIconOpacityForState(hovered, pressed)}
                                    />
                                )}
                            </Pressable>
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
                                <Pressable
                                    onPress={(e) => {
                                        // Blur the pressable in case this button triggers a Growl notification
                                        // We do not want to overlap Growl with the Tooltip (#15271)
                                        e.currentTarget.blur();
                                        this.triggerButtonCompleteAndDownload();
                                    }}
                                    style={[styles.touchableButtonImage]}
                                >
                                    <Icon
                                        src={Expensicons.Download}
                                        fill={StyleUtils.getIconFillColor(getButtonState(false, false, this.props.isDelayButtonStateComplete))}
                                    />
                                </Pressable>
                            </Tooltip>
                        )}

                        {this.props.shouldShowGetAssistanceButton && (
                            <Tooltip text={this.props.translate('getAssistancePage.questionMarkButtonTooltip')}>
                                <Pressable
                                    onPress={() => Navigation.navigate(ROUTES.getGetAssistanceRoute(this.props.guidesCallTaskID))}
                                    style={[styles.touchableButtonImage]}
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
                                anchorPosition={this.props.threeDotsAnchorPosition}
                            />
                        )}

                        {this.props.shouldShowCloseButton && (
                            <Tooltip text={this.props.translate('common.close')}>
                                <Pressable
                                    onPress={this.props.onCloseButtonPress}
                                    style={[styles.touchableButtonImage]}
                                    accessibilityRole="button"
                                    accessibilityLabel={this.props.translate('common.close')}
                                >
                                    {({hovered, pressed}) => (
                                        <Icon
                                            src={Expensicons.Close}
                                            fill={themeColors.heading}
                                            opacity={StyleUtils.getIconOpacityForState(hovered, pressed)}
                                        />
                                    )}
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

export default compose(withLocalize, withDelayToggleButtonState, withKeyboardState)(HeaderWithCloseButton);
