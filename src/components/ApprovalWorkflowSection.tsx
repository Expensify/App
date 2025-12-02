import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ApprovalWorkflowSectionProps = {
    /** Single workflow displayed in this component */
    approvalWorkflow: ApprovalWorkflow;

    /** A function that is called when the section is pressed */
    onPress: () => void;
};

function ApprovalWorkflowSection({approvalWorkflow, onPress}: ApprovalWorkflowSectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'UserCheck'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const approverTitle = useCallback(
        (index: number) =>
            approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`,
        [approvalWorkflow.approvers.length, toLocaleOrdinal, translate],
    );

    const members = useMemo(() => {
        if (approvalWorkflow.isDefault) {
            return translate('workspace.common.everyone');
        }

        return sortAlphabetically(approvalWorkflow.members, 'displayName', localeCompare)
            .map((m) => Str.removeSMSDomain(m.displayName))
            .join(', ');
    }, [approvalWorkflow.isDefault, approvalWorkflow.members, translate, localeCompare]);

    return (
        <PressableWithoutFeedback
            accessibilityRole="button"
            style={[styles.border, shouldUseNarrowLayout ? styles.p3 : styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]}
            onPress={onPress}
            accessibilityLabel={translate('workflowsPage.addApprovalsTitle')}
        >
            <View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon
                            src={Expensicons.Lightbulb}
                            fill={theme.icon}
                            additionalStyles={styles.mr2}
                            small
                        />
                        <Text
                            style={[styles.textLabelSupportingNormal]}
                            suppressHighlighting
                        >
                            {translate('workflowsPage.addApprovalTip')}
                        </Text>
                    </View>
                )}
                <MenuItem
                    title={translate('workflowsExpensesFromPage.title')}
                    style={styles.p0}
                    titleStyle={styles.textLabelSupportingNormal}
                    descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]}
                    description={members}
                    numberOfLinesDescription={4}
                    icon={icons.Users}
                    iconHeight={20}
                    iconWidth={20}
                    iconFill={theme.icon}
                    onPress={onPress}
                    shouldRemoveBackground
                />

                {approvalWorkflow.approvers.map((approver, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <View key={`approver-${approver.email}-${index}`}>
                        <View style={styles.workflowApprovalVerticalLine} />
                        <MenuItem
                            title={approverTitle(index)}
                            style={styles.p0}
                            titleStyle={styles.textLabelSupportingNormal}
                            descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]}
                            description={Str.removeSMSDomain(approver.displayName)}
                            icon={icons.UserCheck}
                            iconHeight={20}
                            iconWidth={20}
                            numberOfLinesDescription={1}
                            iconFill={theme.icon}
                            onPress={onPress}
                            shouldRemoveBackground
                        />
                    </View>
                ))}
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter]}
            />
        </PressableWithoutFeedback>
    );
}

export default ApprovalWorkflowSection;
