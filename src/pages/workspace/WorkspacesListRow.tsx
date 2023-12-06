import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import {AvatarSource} from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import { ValueOf } from 'type-fest';

type WorkspacesListRowProps = {
    title: string;
    workspaceIcon?: AvatarSource | undefined;
    fallbackWorkspaceIcon?: AvatarSource | undefined;
    // owner
    workspaceType: ValueOf<typeof CONST.POLICY.TYPE>;
    item: any; // TBD
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
        </View>
    );
}

export default WorkspacesListRow;
