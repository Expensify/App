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
import HeaderThreeDotsMenu, {DEFAULT_ANCHOR_ALIGNMENT} from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import useHeaderStyles from './styles/useHeaderStyles';
import HeaderActions from './zones/HeaderActions';
import HeaderRight from './zones/HeaderRight';

/**
 * Props with no real call site left in the codebase (confirmed by census), so this scaffolding never
 * implements them: `shouldDisableThreeDotsButton`, `threeDotsMenuIcon`, `threeDotsMenuIconFill`,
 * `singleExecution`, `shouldNavigateToTopMostReport`, `shouldOverlay`, and `parentReport`.
 * `numberOfTitleLines` is omitted too: legacy defaults it to 1 and no caller overrides it, and
 * `HeaderTitle` hardcodes that same default.
 *
 * `shouldShowRotateButton` and `shouldShowPinButton` are also omitted, along with the props that
 * only matter when they're true (`onRotateButtonPress`, `isRotating`): every real call site passes
 * `false`, the same as the default, so the rotate and pin buttons never render either way.
 *
 * This `Omit` is temporary scaffolding itself: the next PR drops the whole legacy prop list, so
 * this type goes with it. Its only job here is to make the dead, unused props explicit.
 */
type ComposedHeaderWithBackButtonProps = Omit<
    HeaderWithBackButtonProps,
    | 'shouldDisableThreeDotsButton'
    | 'threeDotsMenuIcon'
    | 'threeDotsMenuIconFill'
    | 'singleExecution'
    | 'shouldNavigateToTopMostReport'
    | 'shouldOverlay'
    | 'numberOfTitleLines'
    | 'parentReport'
    | 'shouldShowRotateButton'
    | 'onRotateButtonPress'
    | 'isRotating'
    | 'shouldShowPinButton'
>;

/**
 * Temporary shape wired to the legacy `HeaderWithBackButton` prop API, assembled from the primitives
 * in `./primitives` and `./zones`. Its purpose is to make it visible, block by block, which composed
 * piece replaces which part of the legacy render and to prove each one does so correctly, and in
 * doing so, to pressure-test the primitives' own APIs so they compose with as little wrapper overhead
 * as possible.
 *
 * Not the target shape: the next PR migrates callers away from this prop list to composing `<Header>`
 * directly from `Header.Left`/`Header.Right` and block children.
 */
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
    policyAvatarSize = CONST.AVATAR_SIZE.DEFAULT,
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
    titleStyles,
    threeDotsAnchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
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
}: ComposedHeaderWithBackButtonProps) {
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length === 1 guarantees .at(0) is defined; the fallback only satisfies the type checker.
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
                        containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(policyAvatarSize)), styles.mr3]}
                        source={policyAvatar.source}
                        name={policyAvatar.name}
                        avatarID={policyAvatar.id}
                        type={policyAvatar.type}
                        size={policyAvatarSize}
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
                        titleStyles={titleStyles}
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
