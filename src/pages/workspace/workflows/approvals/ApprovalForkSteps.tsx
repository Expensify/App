/**
 * The steps an approval fork sends reports through, one line each, joined like the approvers of a workflow.
 */
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getApprovalForkDescription} from '@libs/WorkflowUtils';

import variables from '@styles/variables';

import type {Approver} from '@src/types/onyx/ApprovalWorkflow';

import React from 'react';
import {View} from 'react-native';

type ApprovalForkStepsProps = {
    /** Approver whose employee settings fork some of the workflow's reports away from it */
    forkApprover: Approver;

    /** Currency the report totals are shown in */
    currency: string;
};

function ApprovalForkSteps({forkApprover, currency}: ApprovalForkStepsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['UserCheck']);
    const lines = getApprovalForkDescription({forkApprover, currency, translate, formatPhoneNumber, convertToDisplayString});

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
