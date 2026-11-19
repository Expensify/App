/**
 * The steps an approval fork sends reports through, one line each, joined like the approvers of a workflow.
 */
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type ApprovalForkStepsProps = {
    /** The fork's description, as one HTML line per step */
    lines: string[];
};

function ApprovalForkSteps({lines}: ApprovalForkStepsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['UserCheck']);

    return (
        <View>
            {lines.map((line, index) => (
                <View key={line}>
                    {index > 0 && <View style={styles.workflowApprovalVerticalLine} />}
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={icons.UserCheck}
                                fill={theme.icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                        <View style={[styles.flex1, styles.ml3]}>
                            <RenderHTML html={line} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

export default ApprovalForkSteps;
