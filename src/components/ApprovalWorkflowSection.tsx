import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getApprovalLimitDescription} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import Icon from './Icon';
import MenuItem from './MenuItem';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ApprovalWorkflowSectionProps = {
    /** Single workflow displayed in this component */
    approvalWorkflow: ApprovalWorkflow;

    /** A function that is called when the section is pressed */
    onPress: () => void;

    /** Currency used for formatting approval limits */
    currency?: string;
};

function ApprovalWorkflowSection({approvalWorkflow, onPress, currency = CONST.CURRENCY.USD}: ApprovalWorkflowSectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Lightbulb', 'Users', 'UserCheck']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });

    const approverTitle = (index: number) =>
        approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`;

    const members = approvalWorkflow.isDefault
        ? translate('workspace.common.everyone')
        : sortAlphabetically(approvalWorkflow.members, 'displayName', localeCompare)
              .map((m) => Str.removeSMSDomain(m.displayName))
              .join(', ');
    return (
        <PressableWithoutFeedback
            accessibilityRole="button"
            style={[styles.border, shouldUseNarrowLayout ? styles.p3 : styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]}
            onPress={onPress}
            accessibilityLabel={translate('workflowsPage.accessibilityLabel', {
                members,
                approvers: approvalWorkflow?.approvers.map((approver) => Str.removeSMSDomain(approver?.displayName ?? '')).join(', '),
            })}
        >
            <View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon
                            src={icons.Lightbulb}
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
                    shouldBeAccessible={false}
                    tabIndex={-1}
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
                            shouldBeAccessible={false}
                            tabIndex={-1}
                            iconHeight={20}
                            iconWidth={20}
                            numberOfLinesDescription={1}
                            iconFill={theme.icon}
                            onPress={onPress}
                            shouldRemoveBackground
                            helperText={getApprovalLimitDescription({approver, currency, translate, personalDetailsByEmail})}
                            helperTextStyle={styles.workflowApprovalLimitText}
                        />
                    </View>
                ))}
            </View>
            <Icon
                src={icons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter]}
            />
        </PressableWithoutFeedback>
    );
}

export default ApprovalWorkflowSection;
