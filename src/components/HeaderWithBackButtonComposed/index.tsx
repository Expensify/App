import Avatar from '@components/Avatar';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import {Keyboard, View} from 'react-native';

import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from './primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from './primitives/HeaderMenuItemButtonTooltip';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import useHeaderStyles from './styles';
import HeaderActions from './zones/HeaderActions';
import HeaderRight from './zones/HeaderRight';

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
    policyAvatar,
    shouldShowReportAvatarWithDisplay = false,
    shouldDisplayStatus,
    shouldShowBackButton = true,
    shouldShowBorderBottom = false,
    shouldShowCloseButton = false,
    shouldShowDownloadButton = false,
    isDownloading = false,
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
    const StyleUtils = useStyleUtils();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {containerStyle, innerRowStyle} = useHeaderStyles({shouldUseHeadlineHeader, shouldShowBorderBottom, style});

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
            style={containerStyle}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={innerRowStyle}>
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
                {!!policyAvatar && (
                    <Avatar
                        containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                        source={policyAvatar.source}
                        name={policyAvatar.name}
                        avatarID={policyAvatar.id}
                        type={policyAvatar.type}
                    />
                )}
                {shouldShowReportAvatarWithDisplay ? (
                    <AvatarWithDisplayName
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
                <HeaderRight>
                    <HeaderActions>
                        {children}
                        {shouldShowDownloadButton && (
                            <HeaderDownloadButton
                                onPress={onDownloadButtonPress}
                                isLoading={isDownloading}
                                iconFill={iconFill}
                            />
                        )}
                    </HeaderActions>
                    {threeDotMenuTooltipsSection}
                    {shouldDisplaySearchRouter && <SearchButton />}
                    {shouldDisplayHelpButton && <SidePanelButton />}
                </HeaderRight>
            </View>
        </View>
    );
}

export default HeaderWithBackButton;
