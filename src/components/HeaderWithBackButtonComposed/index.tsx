import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard, StyleSheet, View} from 'react-native';

import {HeaderContext} from './context';
import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from './primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderHelpButton from './primitives/HeaderHelpButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from './primitives/HeaderMenuItemButtonTooltip';
import HeaderPinButton from './primitives/HeaderPinButton';
import HeaderPolicyAvatar from './primitives/HeaderPolicyAvatar';
import HeaderReportAvatar from './primitives/HeaderReportAvatar';
import HeaderRotateButton from './primitives/HeaderRotateButton';
import HeaderSearchRouter from './primitives/HeaderSearchRouter';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import useHeaderStyles from './styles';

function HeaderWithBackButton({
    icon,
    iconFill,
    iconWidth,
    iconHeight,
    iconStyles,
    onBackButtonPress = () => Navigation.goBack(),
    onCloseButtonPress = () => Navigation.dismissModal(),
    onDownloadButtonPress = () => {},
    onRotateButtonPress = () => {},
    onThreeDotsButtonPress = () => {},
    report,
    policyAvatar,
    shouldShowReportAvatarWithDisplay = false,
    shouldDisplayStatus,
    shouldShowBackButton = true,
    shouldShowBorderBottom = false,
    shouldShowCloseButton = false,
    shouldShowDownloadButton = false,
    isDownloading = false,
    shouldShowRotateButton = false,
    isRotating = false,
    shouldShowPinButton = false,
    shouldSetModalVisibility = true,
    shouldShowThreeDotsButton = false,
    shouldDisableThreeDotsButton = false,
    shouldUseHeadlineHeader = false,
    stepCounter,
    subtitle = '',
    title = '',
    titleColor,
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
    shouldDisplayHelpButton = false,
    shouldDisplaySearchRouter = false,
    style,
    subTitleLink = '',
    shouldMinimizeMenuButton = false,
    openParentReportInCurrentTab = false,
    shouldSkipFocusAfterTransition = false,
}: HeaderWithBackButtonProps) {
    // Avatar-header routes skip Header, so register the dialog label here.
    useDialogLabelRegistration(shouldShowReportAvatarWithDisplay ? (report?.reportName ?? '') : '');

    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {containerStyle, innerRowStyle, rightZoneStyle} = useHeaderStyles({shouldUseHeadlineHeader, shouldShowBorderBottom, shouldOverlay, style});

    return (
        <View
            style={containerStyle}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={innerRowStyle}>
                <HeaderContext.Provider
                    value={{
                        iconFill,
                        shouldUseHeadlineHeader,
                    }}
                >
                    {shouldShowBackButton && (
                        <HeaderBackButton
                            onPress={onBackButtonPress}
                            shouldNavigateToTopMostReport={shouldNavigateToTopMostReport}
                            iconFill={iconFill}
                            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
                        />
                    )}
                    {!!icon && (
                        <HeaderIcon
                            src={icon}
                            width={iconWidth}
                            height={iconHeight}
                            style={iconStyles}
                            iconFill={iconFill}
                        />
                    )}
                    {!!policyAvatar && <HeaderPolicyAvatar policyAvatar={policyAvatar} />}
                    {shouldShowReportAvatarWithDisplay ? (
                        <HeaderReportAvatar
                            report={report}
                            shouldDisplayStatus={shouldDisplayStatus}
                            shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
                            openParentReportInCurrentTab={openParentReportInCurrentTab}
                        />
                    ) : (
                        <HeaderTitle
                            subtitle={subtitle}
                            stepCounter={stepCounter}
                            titleColor={titleColor}
                            subTitleLink={subTitleLink}
                            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
                            shouldUseHeadlineHeader={shouldUseHeadlineHeader}
                        >
                            {title}
                        </HeaderTitle>
                    )}
                    <View style={rightZoneStyle}>
                        <View style={[styles.pr2, styles.flexRow, styles.alignItemsCenter]}>
                            {children}
                            {shouldShowDownloadButton && (
                                <HeaderDownloadButton
                                    onPress={onDownloadButtonPress}
                                    isLoading={isDownloading}
                                    iconFill={iconFill}
                                />
                            )}
                            {shouldShowRotateButton && (
                                <HeaderRotateButton
                                    onPress={onRotateButtonPress}
                                    isLoading={isRotating}
                                />
                            )}
                            {shouldShowPinButton && <HeaderPinButton report={report} />}
                        </View>

                        {shouldShowThreeDotsButton &&
                            threeDotsMenuItems.length === 1 &&
                            shouldMinimizeMenuButton && (
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                                <HeaderMenuItemButtonTooltip threeDotsMenuItem={threeDotsMenuItems.at(0) ?? ({} as PopoverMenuItem)} />
                            )}
                        {shouldShowThreeDotsButton && !(threeDotsMenuItems.length === 1 && shouldMinimizeMenuButton) && (
                            <HeaderThreeDotsMenu
                                icon={threeDotsMenuIcon}
                                iconFill={threeDotsMenuIconFill}
                                disabled={shouldDisableThreeDotsButton}
                                items={threeDotsMenuItems}
                                onIconPress={onThreeDotsButtonPress}
                                shouldOverlay={shouldOverlayDots}
                                anchorAlignment={threeDotsAnchorAlignment}
                                shouldSetModalVisibility={shouldSetModalVisibility}
                            />
                        )}
                        {shouldShowCloseButton && (
                            <HeaderCloseButtonTooltip
                                iconFill={iconFill}
                                onPress={onCloseButtonPress}
                            />
                        )}
                    </View>
                    {shouldDisplaySearchRouter && <HeaderSearchRouter />}
                    {shouldDisplayHelpButton && <HeaderHelpButton />}
                </HeaderContext.Provider>
            </View>
        </View>
    );
}

export default HeaderWithBackButton;
