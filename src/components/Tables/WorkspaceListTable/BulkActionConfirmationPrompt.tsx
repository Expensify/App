import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {BulkActionWarningGroup} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type BulkActionConfirmationPromptProps = {
    /** Each warning with the workspaces it applies to, listed under it */
    warnings: BulkActionWarningGroup[];

    /** Shown after the warnings, such as which selected workspaces the action skips */
    notice?: string;
};

/**
 * The prompt of a bulk action confirmation. The workspace names are rendered as an indented list, so a wrapped name
 * stays aligned under its first line instead of running into the warning text.
 */
function BulkActionConfirmationPrompt({warnings, notice}: BulkActionConfirmationPromptProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.gap4}>
            {warnings.map((group) => (
                <View key={group.warning}>
                    <Text>{group.warning}</Text>
                    <View style={[styles.mt2, styles.gap1]}>
                        {group.workspaces.map((workspace) => (
                            <View
                                key={workspace.policyID}
                                style={[styles.flexRow, styles.pl2]}
                            >
                                <Text style={styles.textSupporting}>{CONST.DOT_SEPARATOR}</Text>
                                <Text style={[styles.flex1, styles.ml2]}>{workspace.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
            {!!notice && <Text>{notice}</Text>}
        </View>
    );
}

export default BulkActionConfirmationPrompt;
