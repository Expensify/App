import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import {AvatarSource} from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

type WorkspacesListRowProps = {
    title: string;
    icon?: AvatarSource | undefined;
    fallbackIcon?: AvatarSource | undefined;
};

function WorkspacesListRow({title, icon, fallbackIcon}: WorkspacesListRowProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.highlightBG, styles.p5, styles.br3]}>
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    imageStyles={[styles.alignSelfCenter]}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    source={icon}
                    fallbackIcon={fallbackIcon}
                    name={title}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
                <Text style={styles.textStrong}>{title}</Text>
            </View>
        </View>
    );
}

export default WorkspacesListRow;
