import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';

import useApplyWorkspaceCurrencyChange from '@hooks/useApplyWorkspaceCurrencyChange';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getGovernmentRateCountryForCurrency, getGovernmentRateCountryPhraseTranslationKey, isSharedGovernmentRateCurrency} from '@libs/PolicyDistanceRatesUtils';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceOverviewCurrencyPageProps = WithPolicyAndFullscreenLoadingProps;

function WorkspaceOverviewCurrencyPage({policy}: WorkspaceOverviewCurrencyPageProps) {
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY>>();
    const {translate} = useLocalize();
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policy?.id);
    const {showConfirmModal} = useConfirmModal();
    const applyWorkspaceCurrencyChange = useApplyWorkspaceCurrencyChange(policy);

    const onSelectCurrency = (item: CurrencyListItem) => {
        if (!policy) {
            return;
        }

        const isAutoUpdateOn = !!policy.shouldAutoUpdateGovernmentDistanceRates;
        const isCurrencyChange = item.currencyCode !== policy.outputCurrency;

        // Several supported countries share EUR, so moving to EUR with auto-update on needs the country choice first
        if (isAutoUpdateOn && isCurrencyChange && isSharedGovernmentRateCurrency(item.currencyCode)) {
            Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY_GOVERNMENT_RATE_COUNTRY.getRoute(policy.id, item.currencyCode, isForcedToChangeCurrency));
            return;
        }

        // Moving to another supported currency with auto-update on swaps which government's rates get copied
        const governmentRateCountry = getGovernmentRateCountryForCurrency(item.currencyCode);
        if (isAutoUpdateOn && isCurrencyChange && governmentRateCountry) {
            const countryPhraseTranslationKey = getGovernmentRateCountryPhraseTranslationKey(governmentRateCountry) ?? 'workspace.distanceRates.governmentRateCountryGeneric';
            showConfirmModal({
                title: translate('workspace.distanceRates.autoUpdateGovernmentRate'),
                prompt: translate('workspace.distanceRates.currencyChangeGovernmentRateWarning', item.currencyCode, translate(countryPhraseTranslationKey)),
                confirmText: translate('common.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                applyWorkspaceCurrencyChange(item.currencyCode, {isForcedToChangeCurrency});
            });
            return;
        }

        applyWorkspaceCurrencyChange(item.currencyCode, {isForcedToChangeCurrency});
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
