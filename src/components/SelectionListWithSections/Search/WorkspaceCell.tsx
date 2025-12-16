import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceCellProps = {
    policyID?: string;
};

function WorkspaceCell({policyID}: WorkspaceCellProps) {
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    if (!policyID || !policy) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={policy.avatarURL}
                avatarID={policyID}
                name={policy.name}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <TextWithTooltip
                text={policy.name}
                shouldShowTooltip
                style={[styles.flex1, styles.flexGrow1]}
            />
        </View>
    );
}

WorkspaceCell.displayName = 'ReportInfoCell';

export default WorkspaceCell;
