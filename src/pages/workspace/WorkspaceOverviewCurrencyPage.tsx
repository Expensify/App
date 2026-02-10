import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';
import {clearCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {isCurrencySupportedForGlobalReimbursement, updateGeneralSettings} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceOverviewCurrencyPageProps = WithPolicyAndFullscreenLoadingProps;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

const hasVBASelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN;

function WorkspaceOverviewCurrencyPage({policy}: WorkspaceOverviewCurrencyPageProps) {
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY>>();
    const {translate} = useLocalize();
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const [hasVBA = false] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: hasVBASelector, canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    const onSelectCurrency = (item: CurrencyListItem) => {
        if (!policy) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        updateGeneralSettings(policy.id, policy?.name ?? '', item.currencyCode);
        clearCorpayBankAccountFields();

        if (isForcedToChangeCurrency) {
            if (isCurrencySupportedForGlobalReimbursement(item.currencyCode as CurrencyType)) {
                const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, item.currencyCode, true).length > 0;
                if (hasValidExistingAccounts) {
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy.id));
                    return;
                }
                navigateToBankAccountRoute(policy.id, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id), {forceReplace: true});
                return;
            }
        }
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            shouldBeBlocked={hasVBA}
            fullPageNotFoundViewProps={{
                onLinkPress: hasVBA ? () => Navigation.goBack() : goBackFromInvalidPolicy,
                subtitleKey: hasVBA || isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized',
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
