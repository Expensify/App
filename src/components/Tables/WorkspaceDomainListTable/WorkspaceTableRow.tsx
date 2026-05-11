import {useIsFocused} from '@react-navigation/core';
import React, {useRef} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {PopoverMenuItem} from '@components/PopoverMenu';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import Tooltip from '@components/Tooltip';
import WorkspacesListRowDisplayName from '@components/WorkspacesListRowDisplayName';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUserFriendlyWorkspaceType} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {WorkspaceRowData} from '.';

type WorkspaceRowProps = {
    item: WorkspaceRowData;

    rowIndex: number;
};

export default function WorkspaceRow({item, rowIndex}: WorkspaceRowProps) {
    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean}>(null);

    const theme = useTheme();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Building', 'FallbackWorkspaceAvatar', 'DotIndicator']);

    const formattedOwnerName = item.ownerName ?? '';
    const formattedWorkspaceName = getUserFriendlyWorkspaceType(item.type, translate);
    const itemDeletedStyles = item.isDeleted ? [styles.offlineFeedbackDeleted] : [{}];

    const BrickRoadIndicator = item.brickRoadIndicator && (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <Icon
                src={icons.DotIndicator}
                fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.iconSuccessFill}
            />
        </View>
    );

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            onPress={item.action}
            skeletonReasonAttributes={{context: 'WorkspaceRow'}}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar
                            name={item.title}
                            source={item.icon}
                            avatarID={item.policyID}
                            type={CONST.ICON_TYPE_WORKSPACE}
                            size={CONST.AVATAR_SIZE.SMALL}
                            imageStyles={styles.alignSelfCenter}
                            fallbackIcon={icons.FallbackWorkspaceAvatar}
                        />
                        <View style={[styles.flexRow, styles.flexGrow1, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.title}
                                style={itemDeletedStyles}
                            />
                            {item.isDefault && (
                                <Tooltip
                                    numberOfLines={4}
                                    maxWidth={variables.w184}
                                    text={translate('workspace.common.defaultNote')}
                                >
                                    <View style={[styles.flexRow]}>
                                        <Badge
                                            text={translate('common.default')}
                                            textStyles={styles.textStrong}
                                            badgeStyles={styles.alignSelfCenter}
                                        />
                                    </View>
                                </Tooltip>
                            )}
                        </View>
                    </View>

                    <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                        <Avatar
                            source={item.ownerAvatar}
                            avatarID={item.ownerAccountID}
                            type={CONST.ICON_TYPE_AVATAR}
                            size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                        />
                        <WorkspacesListRowDisplayName
                            isDeleted={item.isDeleted}
                            ownerName={formattedOwnerName}
                        />
                    </View>

                    <View style={[styles.flex1]}>
                        <Text
                            numberOfLines={1}
                            style={itemDeletedStyles}
                        >
                            {formattedWorkspaceName}
                        </Text>
                    </View>

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        {!item.isJoinRequestPending && (
                            <View style={[styles.flexRow, styles.gap1]}>
                                {item.brickRoadIndicator && BrickRoadIndicator}
                                <ThreeDotsMenu
                                    isNested
                                    shouldOverlay
                                    shouldSelfPosition
                                    disabled={item.disabled}
                                    isContainerFocused={isFocused}
                                    threeDotsMenuRef={threeDotsMenuRef}
                                    menuItems={item.threeDotMenuItems ?? []}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.THREE_DOT_MENU}
                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                />
                            </View>
                        )}

                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
