import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import TextWithTooltip from '@components/TextWithTooltip';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type WorkspaceCellProps = {
    policyID?: string;
};

function WorkspaceCell({policyID}: WorkspaceCellProps) {
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    if (policy?.type === CONST.POLICY.TYPE.PERSONAL || !policy) {
        return null;
    }

    const name = policy.name;
    const avatar = policy.avatarURL;

    return (
        <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatar}
                avatarID={policyID}
                name={name ?? ''}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <TextWithTooltip
                text={name ?? ''}
                shouldShowTooltip
                style={[styles.flex1, styles.flexGrow1]}
            />
        </View>
    );
}

WorkspaceCell.displayName = 'ReportInfoCell';

export default WorkspaceCell;
