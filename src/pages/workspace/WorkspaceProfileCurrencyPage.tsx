import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AdminPolicyAccessOrNotFoundWrapper from './AdminPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceProfileCurrentPageProps = WithPolicyAndFullscreenLoadingProps;

function WorkspaceProfileCurrencyPage({policy}: WorkspaceProfileCurrentPageProps) {
    const {translate} = useLocalize();

    const onSelectCurrency = (item: CurrencyListItem) => {
        Policy.updateGeneralSettings(policy?.id ?? '', policy?.name ?? '', item.currencyCode);
        Navigation.goBack();
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper
            policyID={policy?.id ?? ''}
            onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
            subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
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
                    textInputLabel={translate('workspace.editor.currencyInputLabel')}
                    onSelect={onSelectCurrency}
                    initiallySelectedCurrencyCode={policy?.outputCurrency}
                />
            </ScreenWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceProfileCurrencyPage.displayName = 'WorkspaceProfileCurrencyPage';

export default withPolicyAndFullscreenLoading(WorkspaceProfileCurrencyPage);
