import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarWithDisplayName from '@components/AvatarWithDisplayName';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import type {SvgProps} from 'react-native-svg';

import {Keyboard, View} from 'react-native';

import HeaderActions from './layout/HeaderActions';
import HeaderRight from './layout/HeaderRight';
import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButton from './primitives/HeaderCloseButton';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderIconButton from './primitives/HeaderIconButton';
import HeaderThreeDotsMenu, {DEFAULT_ANCHOR_ALIGNMENT} from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import useHeaderStyles from './styles/useHeaderStyles';

type HeaderProps = Omit<
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
 * directly from `Header.Actions`/`Header.Right` and block children.
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
}: HeaderProps) {
    // Avatar-header routes skip Header, so register the dialog label here.
    useDialogLabelRegistration(shouldShowReportAvatarWithDisplay ? (report?.reportName ?? '') : '');

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {containerStyle, innerRowStyle} = useHeaderStyles({shouldUseHeadlineHeader, shouldShowBorderBottom, style});

    const threeDotsMenuFirstItem = threeDotsMenuItems.at(0);
    const threeDotMenuTooltipsSection = (
        <>
            {shouldShowThreeDotsButton && threeDotsMenuItems.length === 1 && shouldMinimizeMenuButton && !!threeDotsMenuFirstItem && (
                <HeaderIconButton
                    tooltipText={threeDotsMenuFirstItem.text}
                    onPress={threeDotsMenuFirstItem.onSelected}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- PopoverMenuItem.icon is typed as a generic component; header menu items always pass an SVG icon component.
                    iconSrc={threeDotsMenuFirstItem.icon as React.FC<SvgProps>}
                    sentryLabel={threeDotsMenuFirstItem.sentryLabel}
                />
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
                <HeaderCloseButton
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
                    <AvatarFromIcon
                        icon={policyAvatar}
                        containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(policyAvatarSize)), styles.mr3]}
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
