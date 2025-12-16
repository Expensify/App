import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type WorkspaceCellProps = {
    policyID?: string;
    policyName?: string;
    avatarURL?: string;
};

function WorkspaceCell({policyName, avatarURL, policyID}: WorkspaceCellProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                avatarID={policyID}
                name={policyName}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <TextWithTooltip
                text={policyName ?? ''}
                shouldShowTooltip
                style={[styles.flex1, styles.flexGrow1]}
            />
        </View>
    );
}

WorkspaceCell.displayName = 'ReportInfoCell';

export default WorkspaceCell;
