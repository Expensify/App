import React, {useMemo} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import Avatar from '@components/Avatar';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PinButton from '@components/PinButton';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type HeaderWithBackButtonProps from './types';

function HeaderWithBackButton({
    icon,
    iconFill,
    guidesCallTaskID = '',
    onBackButtonPress = () => Navigation.goBack(),
    onCloseButtonPress = () => Navigation.dismissModal(),
    onDownloadButtonPress = () => {},
    onThreeDotsButtonPress = () => {},
    report,
    policy,
    policyAvatar,
    shouldShowReportAvatarWithDisplay = false,
    shouldShowBackButton = true,
    shouldShowBorderBottom = false,
    shouldShowCloseButton = false,
    shouldShowDownloadButton = false,
    shouldShowGetAssistanceButton = false,
    shouldDisableGetAssistanceButton = false,
    shouldShowPinButton = false,
    shouldSetModalVisibility = true,
    shouldShowThreeDotsButton = false,
    shouldDisableThreeDotsButton = false,
    stepCounter,
    subtitle = '',
    title = '',
    titleColor,
    threeDotsAnchorPosition = {
        vertical: 0,
        horizontal: 0,
    },
    threeDotsMenuItems = [],
    threeDotsMenuIcon,
    threeDotsMenuIconFill,
    shouldEnableDetailPageNavigation = false,
    children = null,
    shouldOverlayDots = false,
    shouldOverlay = false,
    shouldNavigateToTopMostReport = false,
    shouldDisplaySearchRouter = false,
    progressBarPercentage,
    style,
}: HeaderWithBackButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isDownloadButtonActive, temporarilyDisableDownloadButton] = useThrottledButtonState();
    const {translate} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();

    // If the icon is present, the header bar should be taller and use different font.
    const isCentralPaneSettings = !!icon;

    const middleContent = useMemo(() => {
        if (progressBarPercentage) {
            return (
                <>
                    {/* Reserves as much space for the middleContent as possible */}
                    <View style={styles.flexGrow1} />
                    {/* Uses absolute positioning so that it's always centered instead of being affected by the
                    presence or absence of back/close buttons to the left/right of it */}
                    <View style={styles.headerProgressBarContainer}>
                        <View style={styles.headerProgressBar}>
                            <View style={[{width: `${progressBarPercentage}%`}, styles.headerProgressBarFill]} />
                        </View>
                    </View>
                </>
            );
        }

        if (shouldShowReportAvatarWithDisplay) {
            return (
                <AvatarWithDisplayName
                    report={report}
                    policy={policy}
                    shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
                />
            );
        }

        return (
            <Header
                title={title}
                subtitle={stepCounter ? translate('stepCounter', stepCounter) : subtitle}
                textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, isCentralPaneSettings && styles.textHeadlineH2]}
            />
        );
    }, [
        StyleUtils,
        isCentralPaneSettings,
        policy,
        progressBarPercentage,
        report,
        shouldEnableDetailPageNavigation,
        shouldShowReportAvatarWithDisplay,
        stepCounter,
        styles.flexGrow1,
        styles.headerProgressBar,
        styles.headerProgressBarContainer,
        styles.headerProgressBarFill,
        styles.textHeadlineH2,
        subtitle,
        title,
        titleColor,
        translate,
    ]);

    return (
        <View
            // Hover on some part of close icons will not work on Electron if dragArea is true
            // https://github.com/Expensify/App/issues/29598
            dataSet={{dragArea: false}}
            style={[
                styles.headerBar,
                isCentralPaneSettings && styles.headerBarDesktopHeight,
                shouldShowBorderBottom && styles.borderBottom,
                // progressBarPercentage can be 0 which would
                // be falsey, hence using !== undefined explicitly
                progressBarPercentage !== undefined && styles.pl0,
                shouldShowBackButton && [styles.pl2, styles.pr2],
                shouldOverlay && StyleSheet.absoluteFillObject,
                style,
            ]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                {shouldShowBackButton && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (isKeyboardShown) {
                                    Keyboard.dismiss();
                                }
                                const topmostReportId = Navigation.getTopmostReportId();
                                if (shouldNavigateToTopMostReport && topmostReportId) {
                                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(topmostReportId));
                                } else {
                                    onBackButtonPress();
                                }
                            }}
                            style={[styles.touchableButtonImage]}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.back')}
                            id={CONST.BACK_BUTTON_NATIVE_ID}
                        >
                            <Icon
                                src={Expensicons.BackArrow}
                                fill={iconFill ?? theme.icon}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}
                {icon && (
                    <Icon
                        src={icon}
                        width={variables.iconHeader}
                        height={variables.iconHeader}
                        additionalStyles={[styles.mr2]}
                    />
                )}
                {policyAvatar && (
                    <Avatar
                        containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                        source={policyAvatar?.source}
                        name={policyAvatar?.name}
                        avatarID={policyAvatar?.id}
                        type={policyAvatar?.type}
                    />
                )}
                {middleContent}
                <View style={[styles.reportOptions, styles.flexRow, styles.pr5, styles.gap4, styles.alignItemsCenter]}>
                    {children}
                    {shouldShowDownloadButton && (
                        <Tooltip text={translate('common.download')}>
                            <PressableWithoutFeedback
                                onPress={(event) => {
                                    // Blur the pressable in case this button triggers a Growl notification
                                    // We do not want to overlap Growl with the Tooltip (#15271)
                                    (event?.currentTarget as HTMLElement)?.blur();

                                    if (!isDownloadButtonActive) {
                                        return;
                                    }

                                    onDownloadButtonPress();
                                    temporarilyDisableDownloadButton();
                                }}
                                style={[styles.touchableButtonImage]}
                                role="button"
                                accessibilityLabel={translate('common.download')}
                            >
                                <Icon
                                    src={Expensicons.Download}
                                    fill={iconFill ?? StyleUtils.getIconFillColor(getButtonState(false, false, !isDownloadButtonActive))}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    {shouldShowGetAssistanceButton && (
                        <Tooltip text={translate('getAssistancePage.questionMarkButtonTooltip')}>
                            <PressableWithoutFeedback
                                disabled={shouldDisableGetAssistanceButton}
                                onPress={() => Navigation.navigate(ROUTES.GET_ASSISTANCE.getRoute(guidesCallTaskID, Navigation.getActiveRoute()))}
                                style={[styles.touchableButtonImage]}
                                role="button"
                                accessibilityLabel={translate('getAssistancePage.questionMarkButtonTooltip')}
                            >
                                <Icon
                                    src={Expensicons.QuestionMark}
                                    fill={iconFill ?? theme.icon}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    {shouldShowPinButton && !!report && <PinButton report={report} />}
                    {shouldShowThreeDotsButton && (
                        <ThreeDotsMenu
                            icon={threeDotsMenuIcon}
                            iconFill={threeDotsMenuIconFill}
                            disabled={shouldDisableThreeDotsButton}
                            menuItems={threeDotsMenuItems}
                            onIconPress={onThreeDotsButtonPress}
                            anchorPosition={threeDotsAnchorPosition}
                            shouldOverlay={shouldOverlayDots}
                            shouldSetModalVisibility={shouldSetModalVisibility}
                        />
                    )}
                    {shouldShowCloseButton && (
                        <Tooltip text={translate('common.close')}>
                            <PressableWithoutFeedback
                                onPress={onCloseButtonPress}
                                style={[styles.touchableButtonImage]}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                            >
                                <Icon
                                    src={Expensicons.Close}
                                    fill={iconFill ?? theme.icon}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                </View>
                {shouldDisplaySearchRouter && <SearchButton />}
            </View>
        </View>
    );
}

HeaderWithBackButton.displayName = 'HeaderWithBackButton';

export default HeaderWithBackButton;
