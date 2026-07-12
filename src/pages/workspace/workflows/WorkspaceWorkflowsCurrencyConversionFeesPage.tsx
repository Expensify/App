import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings, goBackFromInvalidPolicy, isGroupPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {clearPolicyErrorField, setWorkspaceCurrencyConversionFeesPreference} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

type CurrencyConversionFeesPreferenceKey = typeof CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY | typeof CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE;

type WorkspaceWorkflowsCurrencyConversionFeesPageProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_CURRENCY_CONVERSION_FEES>;

type CurrencyConversionFeesItem = {
    text: string;
    keyForList: CurrencyConversionFeesPreferenceKey;
    isSelected: boolean;
};

function WorkspaceWorkflowsCurrencyConversionFeesPage({policy, route}: WorkspaceWorkflowsCurrencyConversionFeesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();

    const selectedPreference = policy?.globalReimbursementFXPreferCompany
        ? CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY
        : CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE;

    const items: CurrencyConversionFeesItem[] = [
        {
            text: translate('workflowsCurrencyConversionFeesPage.companyPays'),
            keyForList: CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY,
            isSelected: selectedPreference === CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY,
        },
        {
            text: translate('workflowsCurrencyConversionFeesPage.employeePays'),
            keyForList: CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE,
            isSelected: selectedPreference === CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE,
        },
    ];

    const onSelectPreference = (item: CurrencyConversionFeesItem) => {
        if (!policy?.id) {
            return;
        }

        const shouldPreferCompany = item.keyForList === CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY;
        if (shouldPreferCompany !== !!policy.globalReimbursementFXPreferCompany) {
            setWorkspaceCurrencyConversionFeesPreference(policy.id, shouldPreferCompany, policy.globalReimbursementFXPreferCompany);
        }

        Navigation.goBack();
    };

    const listHeaderContent = (
        <Text style={[styles.mh5, styles.mv3, styles.textLabelSupportingNormal]}>
            {translate('workflowsCurrencyConversionFeesPage.subtitle')}{' '}
            <TextLink
                style={styles.link}
                href={CONST.ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL}
            >
                {translate('common.learnMore')}
            </TextLink>
        </Text>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS) || !isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENT_FX)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceWorkflowsCurrencyConversionFeesPage"
            >
                <FullPageNotFoundView
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !canEditWorkspaceSettings(policy) || isPendingDeletePolicy(policy) || !isGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('workflowsCurrencyConversionFeesPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingFields?.globalReimbursementFXPreferCompany}
                        errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.GLOBAL_REIMBURSEMENT_FX_PREFER_COMPANY)}
                        onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.GLOBAL_REIMBURSEMENT_FX_PREFER_COMPANY)}
                        style={styles.flex1}
                        contentContainerStyle={styles.flex1}
                    >
                        <SelectionList
                            ListItem={SingleSelectListItem}
                            data={items}
                            onSelectRow={onSelectPreference}
                            initiallyFocusedItemKey={selectedPreference}
                            customListHeaderContent={listHeaderContent}
                            addBottomSafeAreaPadding
                        />
                    </OfflineWithFeedback>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsCurrencyConversionFeesPage.displayName = 'WorkspaceWorkflowsCurrencyConversionFeesPage';

export default withPolicy(WorkspaceWorkflowsCurrencyConversionFeesPage);
