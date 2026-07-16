import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import {clearCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {isCurrencySupportedForGlobalReimbursement, updateGeneralSettings} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import {getReviewWorkspaceSettingsTaskCompletionData} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {TupleToUnion} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceOverviewCurrencyPageProps = WithPolicyAndFullscreenLoadingProps;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function WorkspaceOverviewCurrencyPage({policy}: WorkspaceOverviewCurrencyPageProps) {
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY>>();
    const {translate} = useLocalize();
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policy?.id);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const reviewWorkspaceSettingsTaskInformation = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS);

    const onSelectCurrency = (item: CurrencyListItem) => {
        if (!policy) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        updateGeneralSettings(policy, policy?.name ?? '', item.currencyCode, getReviewWorkspaceSettingsTaskCompletionData(reviewWorkspaceSettingsTaskInformation, currentUserAccountID));
        clearCorpayBankAccountFields();

        if (isForcedToChangeCurrency) {
            if (isCurrencySupportedForGlobalReimbursement(item.currencyCode as CurrencyType)) {
                const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, item.currencyCode, true).length > 0;
                if (hasValidExistingAccounts) {
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy.id, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id)));
                    return;
                }
                navigateToBankAccountRoute({policyID: policy.id, backTo: ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id), navigationOptions: {forceReplace: true}});
                return;
            }
        }
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            shouldBeBlocked={shouldBlockCurrencyChange}
            fullPageNotFoundViewProps={{
                onLinkPress: shouldBlockCurrencyChange ? () => Navigation.goBack() : goBackFromInvalidPolicy,
                subtitleKey: shouldBlockCurrencyChange || isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized',
            }}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceOverviewCurrencyPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.currencyInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <CurrencySelectionList
                    searchInputLabel={translate('workspace.editor.currencyInputLabel')}
                    onSelect={onSelectCurrency}
                    initiallySelectedCurrencyCode={policy?.outputCurrency}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceOverviewCurrencyPage);
