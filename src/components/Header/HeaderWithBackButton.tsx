import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {SvgProps} from 'react-native-svg';

import Header from '.';

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
    onBackButtonPress,
    onCloseButtonPress,
    onDownloadButtonPress = () => {},
    onThreeDotsButtonPress,
    report,
    policyAvatar,
    policyAvatarSize = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowReportAvatarWithDisplay = false,
    shouldDisplayStatus,
    shouldShowBackButton = true,
    shouldShowBorderBottom = false,
    shouldShowCloseButton = false,
    shouldShowDownloadButton = false,
    isDownloading,
    shouldSetModalVisibility,
    shouldShowThreeDotsButton = false,
    shouldUseHeadlineHeader,
    stepCounter,
    subtitle,
    title = '',
    titleColor,
    titleStyles,
    threeDotsAnchorAlignment,
    threeDotsMenuItems = [],
    shouldEnableDetailPageNavigation,
    children,
    shouldOverlayDots,
    shouldDisplayHelpButton = false,
    shouldDisplaySearchRouter = false,
    style,
    subTitleLink,
    shouldMinimizeMenuButton = false,
    openParentReportInCurrentTab,
    shouldSkipFocusAfterTransition,
}: HeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const threeDotsMenuFirstItem = threeDotsMenuItems.at(0);

    return (
        <Header style={[shouldShowBorderBottom && styles.borderBottom, style]}>
            {shouldShowBackButton && (
                <Header.BackButton
                    onPress={onBackButtonPress}
                    iconFill={iconFill}
                    shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
                />
            )}
            {!!icon && (
                <Header.Icon
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
                <Header.AvatarWithDisplayName
                    report={report}
                    shouldDisplayStatus={shouldDisplayStatus}
                    shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
                    openParentReportInCurrentTab={openParentReportInCurrentTab}
                />
            ) : (
                <Header.Title
                    title={title}
                    subtitle={subtitle}
                    stepCounter={stepCounter}
                    titleColor={titleColor}
                    titleStyles={titleStyles}
                    subTitleLink={subTitleLink}
                    shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
                    shouldUseHeadlineHeader={shouldUseHeadlineHeader}
                />
            )}
            <Header.Right>
                <Header.Actions>
                    {children}
                    {shouldShowDownloadButton && (
                        <Header.DownloadButton
                            onPress={onDownloadButtonPress}
                            isLoading={isDownloading}
                            iconFill={iconFill}
                        />
                    )}
                </Header.Actions>
                {shouldShowThreeDotsButton && threeDotsMenuItems.length === 1 && shouldMinimizeMenuButton && !!threeDotsMenuFirstItem && (
                    <Header.IconButton
                        tooltipText={threeDotsMenuFirstItem.text}
                        onPress={threeDotsMenuFirstItem.onSelected}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- PopoverMenuItem.icon is typed as a generic component; header menu items always pass an SVG icon component.
                        iconSrc={threeDotsMenuFirstItem.icon as React.FC<SvgProps>}
                        sentryLabel={threeDotsMenuFirstItem.sentryLabel}
                    />
                )}
                {shouldShowThreeDotsButton && !(threeDotsMenuItems.length === 1 && shouldMinimizeMenuButton) && (
                    <Header.ThreeDotsMenu
                        items={threeDotsMenuItems}
                        onIconPress={onThreeDotsButtonPress}
                        shouldOverlay={shouldOverlayDots}
                        anchorAlignment={threeDotsAnchorAlignment}
                        shouldSetModalVisibility={shouldSetModalVisibility}
                    />
                )}
                {shouldShowCloseButton && (
                    <Header.CloseButton
                        iconFill={iconFill}
                        onPress={onCloseButtonPress}
                    />
                )}
                {shouldDisplaySearchRouter && <SearchButton />}
                {shouldDisplayHelpButton && <SidePanelButton />}
            </Header.Right>
        </Header>
    );
}

export default HeaderWithBackButton;
