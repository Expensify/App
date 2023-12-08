import React, {useMemo} from 'react';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import withCurrentUserPersonalDetails, {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {AvatarSource} from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {Policy} from '@src/types/onyx';

type WorkspacesListRowProps = WithCurrentUserPersonalDetailsProps & {
    /** Name of the workspace */
    title: Policy['name'];

    /** Account ID of the workspace's owner */
    ownerAccountID: Policy['ownerAccountID'];

    /** Type of workspace. Type personal is not valid in this context so it's omitted */
    workspaceType: typeof CONST.POLICY.TYPE.FREE | typeof CONST.POLICY.TYPE.CORPORATE | typeof CONST.POLICY.TYPE.TEAM;

    /** Icon to show next to the workspace name */
    workspaceIcon?: AvatarSource | undefined;

    /** Icon to be used when workspaceIcon is not present */
    fallbackWorkspaceIcon: AvatarSource | undefined;
};

const workspaceTypeIcon = (workspaceType: WorkspacesListRowProps['workspaceType']): React.FC<SvgProps> => {
    switch (workspaceType) {
        case CONST.POLICY.TYPE.FREE:
            return Illustrations.BigRocket;
        case CONST.POLICY.TYPE.CORPORATE:
            return Illustrations.HotDogStand;
        case CONST.POLICY.TYPE.TEAM:
            return Illustrations.SmallRocket;
        default:
            throw new Error(`Don't know which icon to serve for workspace type`);
    }
};

function WorkspacesListRow({title, workspaceIcon, fallbackWorkspaceIcon, ownerAccountID, workspaceType, currentUserPersonalDetails}: WorkspacesListRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ownerDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([ownerAccountID], currentUserPersonalDetails.accountID)[0];

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

    return (
        <View style={[styles.dFlex, styles.gap3, styles.highlightBG, styles.br3, styles.pv5]}>
            <View style={[styles.flexRow, styles.flex1, styles.gap3, styles.pl5, styles.pr2, styles.alignItemsCenter]}>
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
                <ThreeDotsMenu
                    menuItems={[]}
                    anchorPosition={{top: 0, right: 0}}
                />
            </View>
            <View style={styles.ph5}>
                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
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
                            {PersonalDetailsUtils.getDisplayNameOrDefault(ownerDetails, 'displayName')}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicro, styles.textSupporting]}
                        >
                            {ownerDetails.login}
                        </Text>
                    </View>
                </View>
                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                    <Icon
                        src={workspaceTypeIcon(workspaceType)}
                        width={34}
                        height={34}
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
            </View>
        </View>
    );
}

export default withCurrentUserPersonalDetails(WorkspacesListRow);
