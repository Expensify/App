import React from 'react';
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
import ThreeDotsMenu from '../ThreeDotsMenu';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from '../withDelayToggleButtonState';
import AvatarWithDisplayName from '../AvatarWithDisplayName';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import PinButton from '../PinButton';
import {propTypes as headerWithBackButtonPropTypes, defaultProps as headerWithBackButtonDefaultProps} from './headerWithBackButtonPropTypes';
import useLocalize from '../../hooks/useLocalize';
import useKeyboardState from '../../hooks/useKeyboardState';

const propTypes = {
    ...headerWithBackButtonPropTypes,
    ...withDelayToggleButtonStatePropTypes,
};

function HeaderWithBackButton(props) {
    const {translate} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    return (
        <View style={[styles.headerBar, props.shouldShowBorderBottom && styles.borderBottom, props.shouldShowBackButton && styles.pl2]}>
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                {props.shouldShowBackButton && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (isKeyboardShown) {
                                    Keyboard.dismiss();
                                }
                                props.onBackButtonPress();
                            }}
                            style={[styles.touchableButtonImage]}
                            accessibilityRole="button"
                            accessibilityLabel={translate('common.back')}
                        >
                            <Icon src={Expensicons.BackArrow} />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}
                {props.shouldShowAvatarWithDisplay && (
                    <AvatarWithDisplayName
                        report={props.parentReport || props.report}
                        policies={props.policies}
                        personalDetails={props.personalDetails}
                    />
                )}
                {!props.shouldShowAvatarWithDisplay && (
                    <Header
                        title={props.title}
                        subtitle={props.stepCounter && props.shouldShowStepCounter ? translate('stepCounter', props.stepCounter) : props.subtitle}
                    />
                )}
                <View style={[styles.reportOptions, styles.flexRow, styles.pr5]}>
                    {props.shouldShowDownloadButton && (
                        <Tooltip text={translate('common.download')}>
                            <PressableWithoutFeedback
                                onPress={(e) => {
                                    // Blur the pressable in case this button triggers a Growl notification
                                    // We do not want to overlap Growl with the Tooltip (#15271)
                                    e.currentTarget.blur();

                                    if (props.isDelayButtonStateComplete) {
                                        return;
                                    }

                                    props.onDownloadButtonPress();
                                    props.toggleDelayButtonState(true);
                                }}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole="button"
                                accessibilityLabel={translate('common.download')}
                            >
                                <Icon
                                    src={Expensicons.Download}
                                    fill={StyleUtils.getIconFillColor(getButtonState(false, false, props.isDelayButtonStateComplete))}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}

                    {props.shouldShowGetAssistanceButton && (
                        <Tooltip text={translate('getAssistancePage.questionMarkButtonTooltip')}>
                            <PressableWithoutFeedback
                                onPress={() => Navigation.navigate(ROUTES.getGetAssistanceRoute(props.guidesCallTaskID))}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole="button"
                                accessibilityLabel={translate('getAssistancePage.questionMarkButtonTooltip')}
                            >
                                <Icon src={Expensicons.QuestionMark} />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}

                    {props.shouldShowPinButton && <PinButton report={props.report} />}

                    {props.shouldShowThreeDotsButton && (
                        <ThreeDotsMenu
                            menuItems={props.threeDotsMenuItems}
                            onIconPress={props.onThreeDotsButtonPress}
                            anchorPosition={props.threeDotsAnchorPosition}
                            anchorAlignment={props.threeDotsAnchorAlignment}
                        />
                    )}

                    {props.shouldShowCloseButton && (
                        <Tooltip text={translate('common.close')}>
                            <PressableWithoutFeedback
                                onPress={props.onCloseButtonPress}
                                style={[styles.touchableButtonImage]}
                                accessibilityRole="button"
                                accessibilityLabel={translate('common.close')}
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

HeaderWithBackButton.propTypes = propTypes;
HeaderWithBackButton.defaultProps = headerWithBackButtonDefaultProps;

export default withDelayToggleButtonState(HeaderWithBackButton);
