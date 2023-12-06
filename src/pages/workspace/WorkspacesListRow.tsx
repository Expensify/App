import React from 'react';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import {AvatarSource} from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

type WorkspacesListRowProps = {
    title: string;
    workspaceIcon?: AvatarSource | undefined;
    fallbackWorkspaceIcon?: AvatarSource | undefined;
    // owner
    workspaceType: ValueOf<typeof CONST.POLICY.TYPE>;
    item: any; // TBD
};

const workspaceTypeIcon = (workspaceType: ValueOf<typeof CONST.POLICY.TYPE>): React.FC<SvgProps> => {
    switch (workspaceType) {
        case CONST.POLICY.TYPE.FREE:
            // TODO: Ask design team to provide icon
            throw new Error("Don't know which icon to server for free workspace type");
        case CONST.POLICY.TYPE.PERSONAL:
            return Illustrations.BigRocket;
        case CONST.POLICY.TYPE.CORPORATE:
            return Illustrations.HotDogStand;
        case CONST.POLICY.TYPE.TEAM:
            return Illustrations.SmallRocket;
        default:
            throw new Error(`Don't know which icon to serve for workspace type`);
    }
};

function WorkspacesListRow({title, workspaceIcon, fallbackWorkspaceIcon, owner, workspaceType, item}: WorkspacesListRowProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.highlightBG, styles.p5, styles.br3]}>
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
            <View style={[styles.flexRow]}>
                <Icon
                    src={workspaceTypeIcon(workspaceType)}
                    width={34}
                    height={34}
                    additionalStyles={styles.workspaceTypeIcon}
                />
            </View>
        </View>
    );
}

export default WorkspacesListRow;
