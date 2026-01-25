import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicyName, getWorkspaceIcon} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type WorkspaceCellProps = {
    policyID?: string;
    report?: Report;
};

function WorkspaceCell({policyID, report}: WorkspaceCellProps) {
    const styles = useThemeStyles();
    const icon = getWorkspaceIcon(report);
    const name = getPolicyName({report});

    if (report?.type !== CONST.REPORT.TYPE.EXPENSE && report?.type !== CONST.REPORT.TYPE.INVOICE) {
        return null;
    }

    if (!icon || !name) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={icon.source}
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

WorkspaceCell.displayName = 'WorkspaceCell';

export default WorkspaceCell;
