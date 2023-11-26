import React from 'react';
import {Keyboard, View} from 'react-native';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PinButton from '@components/PinButton';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import headerWithBackButtonPropTypes from './headerWithBackButtonPropTypes';

function HeaderWithBackButton({
    iconFill = undefined,
    guidesCallTaskID = '',
    onBackButtonPress = () => Navigation.goBack(ROUTES.HOME),
    onCloseButtonPress = () => Navigation.dismissModal(),
    onDownloadButtonPress = () => {},
    onThreeDotsButtonPress = () => {},
    report = null,
    policy = {},
    personalDetails = {},
    shouldShowAvatarWithDisplay = false,
    shouldShowBackButton = true,
    shouldShowBorderBottom = false,
    shouldShowCloseButton = false,
    shouldShowDownloadButton = false,
    shouldShowGetAssistanceButton = false,
    shouldDisableGetAssistanceButton = false,
    shouldShowPinButton = false,
    shouldShowThreeDotsButton = false,
    shouldDisableThreeDotsButton = false,
    stepCounter = null,
    subtitle = '',
    title = '',
    titleColor = undefined,
    threeDotsAnchorPosition = {
        vertical: 0,
        horizontal: 0,
    },
    threeDotsMenuItems = [],
    shouldEnableDetailPageNavigation = false,
    children = null,
    shouldOverlay = false,
    singleExecution = (func) => func,
}) {
    const styles = useThemeStyles();
    const [isDownloadButtonActive, temporarilyDisableDownloadButton] = useThrottledButtonState();
    const {translate} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const waitForNavigate = useWaitForNavigation();
    return (
        <View
            // Hover on some part of close icons will not work on Electron if dragArea is true
            // https://github.com/Expensify/App/issues/29598
            dataSet={{dragArea: false}}
            style={[styles.headerBar, shouldShowBorderBottom && styles.borderBottom, shouldShowBackButton && styles.pl2]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                {shouldShowBackButton && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (isKeyboardShown) {
                                    Keyboard.dismiss();
                                }
                                onBackButtonPress();
                            }}
                            style={[styles.touchableButtonImage]}
                            role="button"
                            accessibilityLabel={translate('common.back')}
                            nativeID={CONST.BACK_BUTTON_NATIVE_ID}
                        >
                            <Icon
                                src={Expensicons.BackArrow}
                                fill={iconFill}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}
                {shouldShowAvatarWithDisplay ? (
                    <AvatarWithDisplayName
                        report={report}
                        policy={policy}
                        personalDetails={personalDetails}
                        shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
                    />
                ) : (
                    <Header
                        title={title}
                        subtitle={stepCounter ? translate('stepCounter', stepCounter) : subtitle}
                        textStyles={titleColor ? [StyleUtils.getTextColorStyle(titleColor)] : []}
                    />
                )}
                <View style={[styles.reportOptions, styles.flexRow, styles.pr5, styles.alignItemsCenter]}>
                    {children}
                    {shouldShowDownloadButton && (
                        <Tooltip text={translate('common.download')}>
                            <PressableWithoutFeedback
                                onPress={(e) => {
                                    // Blur the pressable in case this button triggers a Growl notification
                                    // We do not want to overlap Growl with the Tooltip (#15271)
                                    e.currentTarget.blur();

                                    if (!isDownloadButtonActive) {
                                        return;
                                    }

                                    onDownloadButtonPress();
                                    temporarilyDisableDownloadButton(true);
                                }}
                                style={[styles.touchableButtonImage]}
                                role="button"
                                accessibilityLabel={translate('common.download')}
                            >
                                <Icon
                                    src={Expensicons.Download}
                                    fill={iconFill || StyleUtils.getIconFillColor(getButtonState(false, false, !isDownloadButtonActive))}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    {shouldShowGetAssistanceButton && (
                        <Tooltip text={translate('getAssistancePage.questionMarkButtonTooltip')}>
                            <PressableWithoutFeedback
                                disabled={shouldDisableGetAssistanceButton}
                                onPress={singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.GET_ASSISTANCE.getRoute(guidesCallTaskID))))}
                                style={[styles.touchableButtonImage]}
                                role="button"
                                accessibilityLabel={translate('getAssistancePage.questionMarkButtonTooltip')}
                            >
                                <Icon
                                    src={Expensicons.QuestionMark}
                                    fill={iconFill}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    {shouldShowPinButton && <PinButton report={report} />}
                    {shouldShowThreeDotsButton && (
                        <ThreeDotsMenu
                            disabled={shouldDisableThreeDotsButton}
                            menuItems={threeDotsMenuItems}
                            onIconPress={onThreeDotsButtonPress}
                            anchorPosition={threeDotsAnchorPosition}
                            shouldOverlay={shouldOverlay}
                        />
                    )}
                    {shouldShowCloseButton && (
                        <Tooltip text={translate('common.close')}>
                            <PressableWithoutFeedback
                                onPress={onCloseButtonPress}
                                style={[styles.touchableButtonImage]}
                                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                            >
                                <Icon
                                    src={Expensicons.Close}
                                    fill={iconFill}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                </View>
            </View>
        </View>
    );
}

HeaderWithBackButton.propTypes = headerWithBackButtonPropTypes;
HeaderWithBackButton.displayName = 'HeaderWithBackButton';

export default HeaderWithBackButton;
