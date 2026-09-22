import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import UserPills from '@components/UserPills';

import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

import {useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';

type MergeATSFinalApproverMenuItemProps = {
    /** The workspace whose Merge ATS connection the final approver belongs to. */
    policyID: string;

    /** Label shown above the approver. Each approval mode names this approver differently. */
    description: string;
};

function MergeATSFinalApproverMenuItem({policyID, description}: MergeATSFinalApproverMenuItemProps) {
    const styles = useThemeStyles();
    const {finalApprover} = useMergeATSApprovalDraftState(policyID);
    const finalApproverDetails = usePersonalDetailByLogin(finalApprover);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            description={description}
            descriptionTextStyle={finalApprover ? styles.textLabelSupportingNormal : undefined}
            titleComponent={
                finalApprover ? (
                    <UserPills
                        users={[
                            {
                                avatar: finalApproverDetails?.avatar,
                                displayName: finalApproverDetails?.displayName ?? finalApprover,
                                accountID: finalApproverDetails?.accountID,
                                email: finalApprover,
                            },
                        ]}
                    />
                ) : undefined
            }
            titleStyle={styles.flex1}
            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RECRUITING_MERGE_FINAL_APPROVER.getRoute(policyID))}
        />
    );
}

export default MergeATSFinalApproverMenuItem;
