import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {BulkActionWarningGroup} from '@libs/WorkspacesSettingsUtils';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type BulkActionConfirmationPromptProps = {
    /** Each warning with the workspaces it applies to, listed under it */
    warnings: BulkActionWarningGroup[];
};

/**
 * The prompt of a bulk action confirmation. Each warning is followed by its workspaces, listed the same way as in
 * useMembersNeedCategoryModal so a wrapped name stays aligned under its first line.
 */
function BulkActionConfirmationPrompt({warnings}: BulkActionConfirmationPromptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={styles.gap4}>
            {warnings.map((group) => (
                <View key={group.warning}>
                    <Text>{group.warning}</Text>
                    <View style={styles.mt3}>
                        {group.workspaces.map((workspace) => (
                            <View
                                key={workspace.policyID}
                                style={[styles.flexRow, styles.alignItemsStart]}
                            >
                                <View style={[StyleUtils.getHeight(variables.fontSizeNormalHeight), styles.justifyContentCenter, styles.ph2]}>
                                    <Icon
                                        src={icons.DotIndicator}
                                        width={variables.iconSizeXXSmall}
                                        height={variables.iconSizeXXSmall}
                                        fill={theme.text}
                                    />
                                </View>
                                <Text style={styles.flex1}>{workspace.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

export default BulkActionConfirmationPrompt;
