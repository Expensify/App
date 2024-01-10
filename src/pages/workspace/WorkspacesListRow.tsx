import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type WorkspacesListRowProps = WithCurrentUserPersonalDetailsProps & {
    /** Name of the workspace */
    title: string;

    /** Account ID of the workspace's owner */
    ownerAccountID?: number;

    /** Type of workspace. Type personal is not valid in this context so it's omitted */
    workspaceType: typeof CONST.POLICY.TYPE.FREE | typeof CONST.POLICY.TYPE.CORPORATE | typeof CONST.POLICY.TYPE.TEAM;

    /** Icon to show next to the workspace name */
    workspaceIcon?: AvatarSource;

    /** Icon to be used when workspaceIcon is not present */
    fallbackWorkspaceIcon?: AvatarSource;

    /** Items for the three dots menu */
    menuItems: PopoverMenuItem[];

    /** Renders the component using big screen layout or small screen layout. When layoutWidth === WorkspaceListRowLayout.NONE,
     * component will return null to prevent layout from jumping on initial render and when parent width changes. */
    layoutWidth?: ValueOf<typeof CONST.LAYOUT_WIDTH>;
};

const workspaceTypeIcon = (workspaceType: WorkspacesListRowProps['workspaceType']): IconAsset => {
    switch (workspaceType) {
        case CONST.POLICY.TYPE.FREE:
            return Illustrations.HandCard;
        case CONST.POLICY.TYPE.CORPORATE:
            return Illustrations.ShieldYellow;
        case CONST.POLICY.TYPE.TEAM:
            return Illustrations.Mailbox;
        default:
            throw new Error(`Don't know which icon to serve for workspace type`);
    }
};

function WorkspacesListRow({
    title,
    menuItems,
    workspaceIcon,
    fallbackWorkspaceIcon,
    ownerAccountID,
    workspaceType,
    currentUserPersonalDetails,
    layoutWidth = CONST.LAYOUT_WIDTH.NONE,
}: WorkspacesListRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const ownerDetails = ownerAccountID && PersonalDetailsUtils.getPersonalDetailsByIDs([ownerAccountID], currentUserPersonalDetails.accountID)[0];

    const userFriendlyWorkspaceType = useMemo(() => {
        switch (workspaceType) {
            case CONST.POLICY.TYPE.FREE:
                return translate('workspace.type.free');
            case CONST.POLICY.TYPE.CORPORATE:
                return translate('workspace.type.control');
            case CONST.POLICY.TYPE.TEAM:
                return translate('workspace.type.collect');
            default:
                throw new Error(`Don't know a friendly workspace name for this workspace type`);
        }
    }, [workspaceType, translate]);

    if (layoutWidth === CONST.LAYOUT_WIDTH.NONE) {
        // To prevent layout from jumping or rendering for a split second, when
        // isWide is undefined we don't assume anything and simply return null.
        return null;
    }

    const isWide = layoutWidth === CONST.LAYOUT_WIDTH.WIDE;
    const isNarrow = layoutWidth === CONST.LAYOUT_WIDTH.NARROW;

    return (
        <View style={[isWide ? styles.flexRow : styles.flexColumn, isWide && styles.gap5, styles.highlightBG, styles.br3, styles.pv5, styles.pl5]}>
            <View style={[styles.flexRow, isWide && styles.flex1, styles.gap3, isNarrow && [styles.mb3, styles.mr2], styles.alignItemsCenter]}>
                <Avatar
                    imageStyles={[styles.alignSelfCenter]}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    source={workspaceIcon}
                    fallbackIcon={fallbackWorkspaceIcon}
                    name={title}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.flexGrow1, styles.textStrong]}
                >
                    {title}
                </Text>
                {isNarrow && (
                    <ThreeDotsMenu
                        menuItems={menuItems}
                        anchorPosition={{horizontal: 0, vertical: 0}}
                    />
                )}
            </View>
            <View style={[styles.flexRow, isWide && styles.flex1, styles.gap2, isNarrow && styles.mr5, styles.alignItemsCenter]}>
                {!!ownerDetails && (
                    <>
                        <Avatar
                            source={ownerDetails.avatar}
                            size={CONST.AVATAR_SIZE.SMALL}
                            containerStyles={styles.workspaceOwnerAvatarWrapper}
                        />
                        <View style={styles.flex1}>
                            <Text
                                numberOfLines={1}
                                style={[styles.labelStrong]}
                            >
                                {PersonalDetailsUtils.getDisplayNameOrDefault(ownerDetails)}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicro, styles.textSupporting]}
                            >
                                {ownerDetails.login}
                            </Text>
                        </View>
                    </>
                )}
            </View>
            <View style={[styles.flexRow, isWide && styles.flex1, styles.gap2, isNarrow && styles.mr5, styles.alignItemsCenter]}>
                <Icon
                    src={workspaceTypeIcon(workspaceType)}
                    width={variables.workspaceTypeIconWidth}
                    height={variables.workspaceTypeIconWidth}
                    additionalStyles={styles.workspaceTypeWrapper}
                />
                <View style={styles.dFlex}>
                    <Text
                        numberOfLines={1}
                        style={styles.labelStrong}
                    >
                        {userFriendlyWorkspaceType}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicro, styles.textSupporting]}
                    >
                        {translate('workspace.common.plan')}
                    </Text>
                </View>
            </View>
            {isWide && (
                <ThreeDotsMenu
                    menuItems={menuItems}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    iconStyles={[styles.mr2]}
                />
            )}
        </View>
    );
}

WorkspacesListRow.displayName = 'WorkspacesListRow';

export default withCurrentUserPersonalDetails(WorkspacesListRow);
