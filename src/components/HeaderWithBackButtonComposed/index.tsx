import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard, View} from 'react-native';

import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from './primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderHelpButton from './primitives/HeaderHelpButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from './primitives/HeaderMenuItemButtonTooltip';
import HeaderPolicyAvatar from './primitives/HeaderPolicyAvatar';
import HeaderReportAvatar from './primitives/HeaderReportAvatar';
import HeaderRotateButton from './primitives/HeaderRotateButton';
import HeaderSearchRouter from './primitives/HeaderSearchRouter';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';

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
    shouldSetModalVisibility = true,
    shouldShowThreeDotsButton = false,
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
            style={[styles.headerBar, shouldUseHeadlineHeader && styles.headerBarHeight, shouldShowBorderBottom && styles.borderBottom, shouldShowBackButton && [styles.pl2], style]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                {shouldShowBackButton && (
                    <HeaderBackButton
                        onPress={onBackButtonPress}
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
