import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import HeaderBackButton from '@components/HeaderWithBackButtonComposed/primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from '@components/HeaderWithBackButtonComposed/primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from '@components/HeaderWithBackButtonComposed/primitives/HeaderDownloadButton';
import HeaderHelpButton from '@components/HeaderWithBackButtonComposed/primitives/HeaderHelpButton';
import HeaderIcon from '@components/HeaderWithBackButtonComposed/primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from '@components/HeaderWithBackButtonComposed/primitives/HeaderMenuItemButtonTooltip';
import HeaderPinButton from '@components/HeaderWithBackButtonComposed/primitives/HeaderPinButton';
import HeaderPolicyAvatar from '@components/HeaderWithBackButtonComposed/primitives/HeaderPolicyAvatar';
import HeaderProgressBar from '@components/HeaderWithBackButtonComposed/primitives/HeaderProgressBar';
import HeaderReportAvatar from '@components/HeaderWithBackButtonComposed/primitives/HeaderReportAvatar';
import HeaderRotateButton from '@components/HeaderWithBackButtonComposed/primitives/HeaderRotateButton';
import HeaderSearchRouter from '@components/HeaderWithBackButtonComposed/primitives/HeaderSearchRouter';
import HeaderThreeDotsMenu from '@components/HeaderWithBackButtonComposed/primitives/HeaderThreeDotsMenu';
import HeaderTitle from '@components/HeaderWithBackButtonComposed/primitives/HeaderTitle';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard, StyleSheet, View} from 'react-native';

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
    progressBarPercentage,
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

    const threeDotMenuTooltipsSection = (
        <>
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
        </>
    );

    return (
        <View
            style={[
                styles.headerBar,
                shouldUseHeadlineHeader && styles.headerBarHeight,
                shouldShowBorderBottom && styles.borderBottom,
                // progressBarPercentage can be 0 which would
                // be falsy, hence using !== undefined explicitly
                progressBarPercentage !== undefined && styles.pl0,
                shouldShowBackButton && [styles.pl2],
                shouldOverlay && StyleSheet.absoluteFill,
                style,
            ]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                {shouldShowBackButton && (
                    <HeaderBackButton
                        onPress={onBackButtonPress}
                        shouldNavigateToTopMostReport={shouldNavigateToTopMostReport}
                        iconFill={iconFill}
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
                {!!progressBarPercentage && (
                    <HeaderProgressBar
                        percentageProgress={progressBarPercentage}
                        stepCounter={stepCounter}
                    />
                )}
                {shouldShowReportAvatarWithDisplay && !progressBarPercentage && (
                    <HeaderReportAvatar
                        report={report}
                        shouldDisplayStatus={shouldDisplayStatus}
                        shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
                        openParentReportInCurrentTab={openParentReportInCurrentTab}
                    />
                )}
                {!shouldShowReportAvatarWithDisplay && !progressBarPercentage && (
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
                <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
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
                    {threeDotMenuTooltipsSection}
                </View>
                {shouldDisplaySearchRouter && <HeaderSearchRouter />}
                {shouldDisplayHelpButton && <HeaderHelpButton />}
            </View>
        </View>
    );
}

export default HeaderWithBackButton;
