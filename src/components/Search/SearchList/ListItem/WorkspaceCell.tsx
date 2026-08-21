import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getPolicyName, getWorkspaceIcon} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceCellProps = {
    policyID?: string;
    report?: Report;
};

function WorkspaceCell({policyID, report}: WorkspaceCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icon = getWorkspaceIcon(report, translate);
    const name = getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')});

    if (report?.type !== CONST.REPORT.TYPE.EXPENSE && report?.type !== CONST.REPORT.TYPE.INVOICE) {
        return null;
    }

    if (!icon || !name) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter]}>
            <WorkspaceAvatar
                imageStyles={styles.alignSelfCenter}
                size={CONST.AVATAR_SIZE.XXX_SMALL}
                source={icon.source}
                avatarID={policyID ?? CONST.DEFAULT_NUMBER_ID}
                name={name ?? ''}
            />
            <TextWithTooltip
                text={name ?? ''}
                shouldShowTooltip
                style={[styles.flex1, styles.flexGrow1]}
                isCopyable
            />
        </View>
    );
}

export default WorkspaceCell;
