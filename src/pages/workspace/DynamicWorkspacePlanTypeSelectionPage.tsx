import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspacePlanType} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import type {PolicyType} from '@src/types/form/WorkspaceConfirmationForm';

import React from 'react';

type PlanTypeItem = {
    value: PolicyType;
    text: string;
    alternateText: string;
    keyForList: PolicyType;
    isSelected: boolean;
};

/** Dynamic route page for selecting the workspace plan type (Team/Corporate) during the workspace confirmation flow. */
function DynamicWorkspacePlanTypeSelectionPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_PLAN_TYPE.path);

    const [workspaceConfirmationFormDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Until the user picks a plan the draft is empty, so fall back to the same default the confirmation form
    // uses to keep the initially selected row in sync with what the form shows.
    const planType = workspaceConfirmationFormDraft?.planType ?? getDefaultWorkspacePlanType(policies);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const planTypeOptions: PlanTypeItem[] = [CONST.POLICY.TYPE.TEAM, CONST.POLICY.TYPE.CORPORATE].map((policyType) => ({
        value: policyType,
        text: translate(`workspace.planTypePage.planTypes.${policyType}.label`),
        alternateText: translate(`workspace.planTypePage.planTypes.${policyType}.description`),
        keyForList: policyType,
        isSelected: policyType === planType,
    }));

    const savePlanType = (option: PlanTypeItem) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM, {[INPUT_IDS.PLAN_TYPE]: option.value});
        // After selecting, don't restore focus to the plan menu item on the confirmation page —
        // a focused button suppresses the form's submit-on-Enter, so the next Enter would re-open this
        // page instead of creating the workspace. The header Back button keeps the default focus restore.
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper testID="DynamicWorkspacePlanTypeSelectionPage">
            <HeaderWithBackButton
                title={translate('workspace.common.planType')}
                onBackButtonPress={goBack}
            />
            <Text style={[styles.ph5, styles.pb4, styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.planTypePage.description')}</Text>
            <SelectionList
                data={planTypeOptions}
                ListItem={SingleSelectListItem}
                onSelectRow={savePlanType}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={planTypeOptions.find((option) => option.isSelected)?.keyForList}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default DynamicWorkspacePlanTypeSelectionPage;
