import React from 'react';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
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

const userFriendlyWorkspaceType = (workspaceType: WorkspacesListRowProps['workspaceType']) => {
    switch (workspaceType) {
        case CONST.POLICY.TYPE.FREE:
            return 'Free';
        case CONST.POLICY.TYPE.CORPORATE:
            return 'Control';
        case CONST.POLICY.TYPE.TEAM:
            return 'Collect';
        default:
            throw new Error(`Don't know a friendly workspace name for this workspace type`);
    }
};

function WorkspacesListRow({title, workspaceIcon, fallbackWorkspaceIcon, ownerAccountID, workspaceType, currentUserPersonalDetails}: WorkspacesListRowProps) {
    const styles = useThemeStyles();
    const ownerDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([ownerAccountID], currentUserPersonalDetails.accountID)[0];

    return (
        <View style={[styles.dFlex, styles.gap3, styles.highlightBG, styles.p5, styles.br3]}>
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    imageStyles={[styles.alignSelfCenter]}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    source={workspaceIcon}
                    fallbackIcon={fallbackWorkspaceIcon}
                    name={title}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
                <Text style={styles.textStrong}>{title}</Text>
            </View>
            <View>
                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                    <Avatar
                        source={ownerDetails.avatar}
                        size={CONST.AVATAR_SIZE.SMALL}
                        containerStyles={styles.workspaceOwnerAvatarWrapper}
                    />
                    <View style={styles.dFlex}>
                        <Text style={styles.labelStrong}>{PersonalDetailsUtils.getDisplayNameOrDefault(ownerDetails, 'displayName')}</Text>
                        <Text style={[styles.textMicro, styles.textSupporting]}>{ownerDetails.login}</Text>
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
                        <Text style={styles.labelStrong}>{userFriendlyWorkspaceType(workspaceType)}</Text>
                        <Text style={[styles.textMicro, styles.textSupporting]}>Plan</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default withCurrentUserPersonalDetails(WorkspacesListRow);
