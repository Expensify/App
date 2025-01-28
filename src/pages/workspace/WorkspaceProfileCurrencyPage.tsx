import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import mapCurrencyToCountry from '@pages/ReimbursementAccount/utils/mapCurrencyToCountry';
import * as FormActions from '@userActions/FormActions';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceProfileCurrencyPageProps = WithPolicyAndFullscreenLoadingProps;

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

function WorkspaceProfileCurrencyPage({policy}: WorkspaceProfileCurrencyPageProps) {
    const {translate} = useLocalize();

    const onSelectCurrency = (item: CurrencyListItem) => {
        if (!policy) {
            return;
        }
        FormActions.clearDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[COUNTRY]: mapCurrencyToCountry(item.currencyCode)});
        Policy.updateGeneralSettings(policy.id, policy?.name ?? '', item.currencyCode);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{onLinkPress: PolicyUtils.goBackFromInvalidPolicy, subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceProfileCurrencyPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.currencyInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <CurrencySelectionList
                    searchInputLabel={translate('workspace.editor.currencyInputLabel')}
                    onSelect={onSelectCurrency}
                    initiallySelectedCurrencyCode={policy?.outputCurrency}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfileCurrencyPage.displayName = 'WorkspaceProfileCurrencyPage';

export default withPolicyAndFullscreenLoading(WorkspaceProfileCurrencyPage);
