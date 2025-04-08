import React, {useMemo} from 'react';
import {ActivityIndicator, Keyboard, StyleSheet, View} from 'react-native';
import Avatar from '@components/Avatar';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PinButton from '@components/PinButton';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import HelpButton from '@components/SidePanel/HelpComponents/HelpButton';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
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
    iconWidth,
    iconHeight,
    iconStyles,
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
    isDownloading = false,
    shouldShowPinButton = false,
    shouldSetModalVisibility = true,
    shouldShowThreeDotsButton = false,
    shouldDisableThreeDotsButton = false,
    shouldUseHeadlineHeader = false,
    stepCounter,
    subtitle = '',
    title = '',
    titleColor,
    threeDotsAnchorPosition = {
        vertical: 0,
        horizontal: 0,
    },
    threeDotsAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
    threeDotsMenuItems = [],
    threeDotsMenuIcon,
    threeDotsMenuIconFill,
    shouldEnableDetailPageNavigation = false,
    children = null,
    shouldOverlayDots = false,
    shouldOverlay = false,
    shouldNavigateToTopMostReport = false,
    shouldDisplayHelpButton = true,
    shouldDisplaySearchRouter = false,
    progressBarPercentage,
    style,
    subTitleLink = '',
}: HeaderWithBackButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isDownloadButtonActive, temporarilyDisableDownloadButton] = useThrottledButtonState();
    const {translate} = useLocalize();

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
                textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2]}
                subTitleLink={subTitleLink}
                numberOfTitleLines={1}
            />
        );
    }, [
        StyleUtils,
        subTitleLink,
        shouldUseHeadlineHeader,
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
                shouldUseHeadlineHeader && styles.headerBarDesktopHeight,
                shouldShowBorderBottom && styles.borderBottom,
                // progressBarPercentage can be 0 which would
                // be falsey, hence using !== undefined explicitly
                progressBarPercentage !== undefined && styles.pl0,
                shouldShowBackButton && [styles.pl2],
                shouldOverlay && StyleSheet.absoluteFillObject,
                style,
            ]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                {shouldShowBackButton && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (Keyboard.isVisible()) {
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
                {!!icon && (
                    <Icon
                        src={icon}
                        width={iconWidth ?? variables.iconHeader}
                        height={iconHeight ?? variables.iconHeader}
                        additionalStyles={[styles.mr2, iconStyles]}
                        fill={iconFill}
                    />
                )}
                {!!policyAvatar && (
                    <Avatar
                        containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                        source={policyAvatar?.source}
                        name={policyAvatar?.name}
                        avatarID={policyAvatar?.id}
                        type={policyAvatar?.type}
                    />
                )}
                {middleContent}
                <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                    <View style={[styles.pr2, styles.flexRow, styles.alignItemsCenter]}>
                        {children}
                        {shouldShowDownloadButton &&
                            (!isDownloading ? (
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
                            ) : (
                                <ActivityIndicator
                                    style={[styles.touchableButtonImage]}
                                    size="small"
                                    color={theme.spinner}
                                />
                            ))}
                        {shouldShowPinButton && !!report && <PinButton report={report} />}
                    </View>
                    {shouldShowThreeDotsButton && (
                        <ThreeDotsMenu
                            icon={threeDotsMenuIcon}
                            iconFill={threeDotsMenuIconFill}
                            disabled={shouldDisableThreeDotsButton}
                            menuItems={threeDotsMenuItems}
                            onIconPress={onThreeDotsButtonPress}
                            anchorPosition={threeDotsAnchorPosition}
                            shouldOverlay={shouldOverlayDots}
                            anchorAlignment={threeDotsAnchorAlignment}
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
                {shouldDisplayHelpButton && <HelpButton />}
                {shouldDisplaySearchRouter && <SearchButton />}
            </View>
        </View>
    );
}

HeaderWithBackButton.displayName = 'HeaderWithBackButton';

export default HeaderWithBackButton;
