import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
// import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

// MEMBER
// {
//     email: string;
//     avatar?: AvatarSource;
//     displayName?: string;
// }

// type Approver = {
//     email: string;
//     forwardsTo?: string;
//     avatar?: AvatarSource;
//     displayName?: string;
//     isInMultipleWorkflows: boolean;
//     isCircularReference?: boolean;
// };

// const mockApprover1 = {
//     email: 'dx@gmail.com',
//     forwardsTo: 'dx@gmail.com',
//     avatar: undefined,
//     displayName: 'dx',
//     isInMultipleWorkflows: false,
//     isCircularReference: true,
// };

// const mockApprover2 = {
//     email: 'xd@gmail.com',
//     forwardsTo: 'xd@gmail.com',
//     avatar: undefined,
//     displayName: 'xd',
//     isInMultipleWorkflows: false,
//     isCircularReference: true,
// };

// const mockMember1 = {
//     email: 'xdd@gmail.com',
//     avatar: undefined,
//     displayName: 'xdd',
// };

// const mockMember2 = {
//     email: 'ddx@gmail.com',
//     avatar: undefined,
//     displayName: 'ddx',
// };

// const mockWorkflow: ApprovalWorkflow = {
//     members: [mockMember1, mockMember2],
//     approvers: [mockApprover1, mockApprover2],
//     isDefault: false,
//     isBeingEdited: false,
//     isLoading: false,
// };

// type ApprovalWorkflow = {
//     members: Member[];
//     approvers: Approver[];
//     isDefault: boolean;
//     isBeingEdited: boolean;
//     isLoading?: boolean;
// };

function ApprovalWorkflowSection({approvalWorkflow}: {approvalWorkflow: ApprovalWorkflow}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    // const approvalWorkflow = approvalWorkflow1 ?? mockWorkflow;

    return (
        <PressableWithFeedback
            accessibilityRole="button"
            style={[styles.border, styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]}
            onPress={() => {}}
            accessibilityLabel="WORKSHOP THIS"
        >
            <View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (
                    <View style={[styles.flexRow, styles.mb4]}>
                        <Icon
                            src={Expensicons.Lightbulb}
                            fill={theme.icon}
                            additionalStyles={styles.mr3}
                        />
                        <Text
                            style={[styles.textLabelSupportingNormal]}
                            suppressHighlighting
                        >
                            This default workflow applies to all members, unless a more specific workflow exists.
                        </Text>
                    </View>
                )}

                <MenuItem
                    title="Expenses from"
                    style={styles.p0}
                    titleStyle={[styles.textMicro, styles.colorMuted]}
                    descriptionTextStyle={styles.textNormalThemeText}
                    description={approvalWorkflow.isDefault ? 'Everyone' : approvalWorkflow.members.map((m) => m.displayName).join(', ')}
                    icon={Expensicons.Users}
                    iconHeight={20}
                    iconWidth={20}
                    iconFill={theme.icon}
                    interactive={false}
                />

                {approvalWorkflow.approvers.map((approver) => (
                    <View key={approver.email}>
                        <View style={{height: 16, width: 1, backgroundColor: theme.border, marginLeft: 19}} />
                        <MenuItem
                            title="Approver"
                            style={styles.p0}
                            titleStyle={styles.textLabelSupportingNormal}
                            descriptionTextStyle={styles.textNormalThemeText}
                            description={approver.displayName}
                            icon={Expensicons.User}
                            iconHeight={20}
                            iconWidth={20}
                            iconFill={theme.icon}
                            interactive={false}
                        />
                    </View>
                ))}
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter]}
            />
        </PressableWithFeedback>
    );
}

export default ApprovalWorkflowSection;
