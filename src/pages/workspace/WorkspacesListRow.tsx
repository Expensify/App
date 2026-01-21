import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import WorkspacesListRowDisplayName from '@components/WorkspacesListRowDisplayName';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {getUserFriendlyWorkspaceType} from '@libs/PolicyUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type WorkspacesListRowProps = WithCurrentUserPersonalDetailsProps & {
    /** Name of the workspace */
    title: string;

    /** Account ID of the workspace's owner */
    ownerAccountID?: number;

    /** Type of workspace */
    workspaceType?: ValueOf<typeof CONST.POLICY.TYPE>;

    /** Icon to show next to the workspace name */
    workspaceIcon?: AvatarSource;

    /** Icon to be used when workspaceIcon is not present */
    fallbackWorkspaceIcon?: AvatarSource;

    /** Items for the three dots menu */
    menuItems: PopoverMenuItem[];

    /** Renders the component using big screen layout or small screen layout. When layoutWidth === WorkspaceListRowLayout.NONE,
     * component will return null to prevent layout from jumping on initial render and when parent width changes. */
    layoutWidth?: ValueOf<typeof CONST.LAYOUT_WIDTH>;

    /** Custom styles applied to the row */
    rowStyles?: StyleProp<ViewStyle>;

    /** Additional styles from OfflineWithFeedback applied to the row */
    style?: StyleProp<ViewStyle>;

    /** The type of brick road indicator to show. */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Determines if three dots menu should be shown or not */
    shouldDisableThreeDotsMenu?: boolean;

    /** Determines if pending column should be shown or not */
    isJoinRequestPending?: boolean;

    /** ID of the policy */
    policyID?: string;

    /** Is default policy */
    isDefault?: boolean;

    /** Whether the bill is loading */
    isLoadingBill?: boolean;

    /** Whether the list item is highlighted */
    shouldAnimateInHighlight?: boolean;

    /** Function to reset loading spinner icon index */
    resetLoadingSpinnerIconIndex?: () => void;

    /** Whether the list item is hovered */
    isHovered?: boolean;
};

type BrickRoadIndicatorIconProps = {
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    dotIndicatorIcon?: IconAsset;
};

function BrickRoadIndicatorIcon({brickRoadIndicator, dotIndicatorIcon}: BrickRoadIndicatorIconProps) {
    const theme = useTheme();

    if (!brickRoadIndicator || !dotIndicatorIcon) {
        return null;
    }

    return (
        <Icon
            src={dotIndicatorIcon}
            fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.iconSuccessFill}
        />
    );
}

function WorkspacesListRow({
    title,
    menuItems,
    workspaceIcon,
    fallbackWorkspaceIcon,
    ownerAccountID,
    workspaceType,
    currentUserPersonalDetails,
    layoutWidth = CONST.LAYOUT_WIDTH.NONE,
    rowStyles,
    style,
    brickRoadIndicator,
    shouldAnimateInHighlight,
    shouldDisableThreeDotsMenu,
    isJoinRequestPending,
    policyID,
    isDefault,
    isLoadingBill,
    resetLoadingSpinnerIconIndex,
    isHovered,
}: WorkspacesListRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const isFocused = useIsFocused();
    const isNarrow = layoutWidth === CONST.LAYOUT_WIDTH.NARROW;
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Hourglass', 'DotIndicator'] as const);
    const illustrations = useMemoizedLazyIllustrations(['Mailbox', 'ShieldYellow'] as const);

    const workspaceTypeIcon = useCallback(
        (type: WorkspacesListRowProps['workspaceType']): IconAsset => {
            switch (type) {
                case CONST.POLICY.TYPE.CORPORATE:
                    return illustrations.ShieldYellow;
                case CONST.POLICY.TYPE.TEAM:
                    return illustrations.Mailbox;
                default:
                    return illustrations.Mailbox;
            }
        },
        [illustrations.Mailbox, illustrations.ShieldYellow],
    );

    const ownerDetails = ownerAccountID && getPersonalDetailsByIDs({accountIDs: [ownerAccountID], currentUserAccountID: currentUserPersonalDetails.accountID}).at(0);
    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean}>(null);
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: !!shouldAnimateInHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.transparent,
    });

    useEffect(() => {
        if (isLoadingBill) {
            return;
        }
        resetLoadingSpinnerIconIndex?.();

        if (!threeDotsMenuRef.current?.isPopupMenuVisible) {
            return;
        }
        threeDotsMenuRef?.current?.hidePopoverMenu();
    }, [isLoadingBill, resetLoadingSpinnerIconIndex]);

    if (layoutWidth === CONST.LAYOUT_WIDTH.NONE) {
        // To prevent layout from jumping or rendering for a split second, when
        // isWide is undefined we don't assume anything and simply return null.
        return null;
    }

    const isWide = layoutWidth === CONST.LAYOUT_WIDTH.WIDE;

    const isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedbackDeleted) : false;

    const ThreeDotMenuOrPendingIcon = (
        <View style={[styles.flexRow, !shouldUseNarrowLayout && styles.workspaceThreeDotMenu]}>
            {!!isJoinRequestPending && (
                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                    <Badge
                        text={translate('workspace.common.requested')}
                        textStyles={styles.textStrong}
                        badgeStyles={[styles.alignSelfCenter, styles.badgeBordered]}
                        icon={icons.Hourglass}
                    />
                </View>
            )}
            {!!isDefault && (
                <Tooltip
                    maxWidth={variables.w184}
                    text={translate('workspace.common.defaultNote')}
                    numberOfLines={4}
                >
                    <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                        <Badge
                            text={translate('common.default')}
                            textStyles={styles.textStrong}
                            badgeStyles={[styles.alignSelfCenter, styles.badgeBordered, styles.badgeSuccess]}
                        />
                    </View>
                </Tooltip>
            )}
            {!isJoinRequestPending && (
                <View style={[styles.flexRow, styles.ml2, styles.gap1]}>
                    <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, isNarrow && styles.workspaceListRBR]}>
                        <BrickRoadIndicatorIcon
                            brickRoadIndicator={brickRoadIndicator}
                            dotIndicatorIcon={icons.DotIndicator}
                        />
                    </View>
                    <ThreeDotsMenu
                        isContainerFocused={isFocused}
                        shouldSelfPosition
                        menuItems={menuItems}
                        anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                        shouldOverlay
                        disabled={shouldDisableThreeDotsMenu}
                        isNested
                        threeDotsMenuRef={threeDotsMenuRef}
                    />
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.flexRow, styles.highlightBG, rowStyles, style, styles.br3]}>
            <Animated.View style={[styles.flex1, styles.flexRow, styles.bgTransparent, isWide && styles.gap5, styles.p5, styles.pr3, animatedHighlightStyle]}>
                <View style={[isWide ? styles.flexRow : styles.flexColumn, styles.flex1, isWide && styles.gap5]}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.flex2, isNarrow && styles.mb3, styles.alignItemsCenter]}>
                        <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
                            <Avatar
                                imageStyles={[styles.alignSelfCenter]}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                source={workspaceIcon}
                                fallbackIcon={fallbackWorkspaceIcon}
                                avatarID={policyID}
                                name={title}
                                type={CONST.ICON_TYPE_WORKSPACE}
                            />
                            <TextWithTooltip
                                text={title}
                                shouldShowTooltip
                                style={[styles.flex1, styles.flexGrow1, styles.textStrong, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                            />
                        </View>
                        {isNarrow && ThreeDotMenuOrPendingIcon}
                    </View>
                    <View style={[styles.flexRow, isWide && styles.flex1, isWide && styles.workspaceOwnerSectionMinWidth, styles.gap2, styles.alignItemsCenter]}>
                        {!!ownerDetails && (
                            <>
                                <Avatar
                                    source={ownerDetails.avatar}
                                    avatarID={ownerDetails.accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.SMALL}
                                    containerStyles={styles.workspaceOwnerAvatarWrapper}
                                />
                                <View style={styles.flex1}>
                                    <WorkspacesListRowDisplayName
                                        isDeleted={isDeleted}
                                        ownerName={getDisplayNameOrDefault(ownerDetails)}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textMicro, styles.textSupporting, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                                    >
                                        {Str.removeSMSDomain(ownerDetails?.login ?? '')}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                    <View style={[styles.flexRow, isWide && styles.flex1, styles.gap2, styles.alignItemsCenter]}>
                        <Icon
                            src={workspaceTypeIcon(workspaceType)}
                            width={variables.workspaceTypeIconWidth}
                            height={variables.workspaceTypeIconWidth}
                            additionalStyles={styles.workspaceTypeWrapper}
                        />
                        <View>
                            {!!workspaceType && (
                                <Text
                                    numberOfLines={1}
                                    style={[styles.labelStrong, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                                >
                                    {getUserFriendlyWorkspaceType(workspaceType, translate)}
                                </Text>
                            )}
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicro, styles.textSupporting, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                            >
                                {translate('workspace.common.plan')}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    {!isNarrow && ThreeDotMenuOrPendingIcon}
                    {!isNarrow && (
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.touchableButtonImage]}>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                                isButtonIcon
                                medium
                            />
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

export default withCurrentUserPersonalDetails(WorkspacesListRow);
