import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceProfileCurrentPageProps = WithPolicyAndFullscreenLoadingProps;

function WorkspaceProfileCurrencyPage({policy, isLoadingReportData = true}: WorkspaceProfileCurrentPageProps) {
    const {translate} = useLocalize();

    const onSelectCurrency = (item: CurrencyListItem) => {
        Policy.updateGeneralSettings(policy?.id ?? '', policy?.name ?? '', item.currencyCode);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceProfileCurrencyPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                shouldShow={(isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceProfileCurrencyPage.displayName = 'WorkspaceProfileCurrencyPage';

export default withPolicyAndFullscreenLoading(WorkspaceProfileCurrencyPage);
