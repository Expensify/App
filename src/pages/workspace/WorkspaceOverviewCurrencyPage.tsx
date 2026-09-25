import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import GovernmentRateCountryRadioButtons from '@components/GovernmentRateCountryRadioButtons';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    getGovernmentRateCountryForCurrency,
    getGovernmentRateCountryPhraseTranslationKey,
    isCurrencySupportedForAutoUpdate,
    isSharedGovernmentRateCurrency,
} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import {clearCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';
import {isCurrencySupportedForGlobalReimbursement, updateGeneralSettings} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {TupleToUnion} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import React, {useRef} from 'react';
import {View} from 'react-native';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceOverviewCurrencyPageProps = WithPolicyAndFullscreenLoadingProps;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function WorkspaceOverviewCurrencyPage({policy}: WorkspaceOverviewCurrencyPageProps) {
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY>>();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policy?.id);
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const {showConfirmModal} = useConfirmModal();
    const pendingGovernmentRateCountry = useRef<string | undefined>(undefined);

    const applyCurrencyChange = (item: CurrencyListItem, governmentRateCountry?: string) => {
        if (!policy) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        updateGeneralSettings(policy, policy?.name ?? '', item.currencyCode, getReviewWorkspaceSettingsTaskCompletion());
        clearCorpayBankAccountFields();

        // The currency change clears the stored country on the server, so the EUR choice is written right after it
        if (governmentRateCountry) {
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceRateCustomUnit(policy), true, governmentMileageRates ?? [], item.currencyCode, governmentRateCountry);
        }

        if (isForcedToChangeCurrency) {
            if (isCurrencySupportedForGlobalReimbursement(item.currencyCode as CurrencyType)) {
                const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, item.currencyCode, true).length > 0;
                if (hasValidExistingAccounts) {
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy.id, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id)));
                    return;
                }
                navigateToBankAccountRoute({
                    policyID: policy.id,
                    backTo: ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id),
                    navigationOptions: {forceReplace: true},
                });
                return;
            }
        }
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    };

    const onSelectCurrency = (item: CurrencyListItem) => {
        if (!policy) {
            return;
        }

        const isAutoUpdateOn = !!policy.shouldAutoUpdateGovernmentDistanceRates;
        const isCurrencyChange = item.currencyCode !== policy.outputCurrency;

        // Several supported countries share EUR, so moving to EUR with auto-update on needs the country choice first
        if (isAutoUpdateOn && isCurrencyChange && isSharedGovernmentRateCurrency(item.currencyCode)) {
            pendingGovernmentRateCountry.current = undefined;
            showConfirmModal({
                title: translate('workspace.distanceRates.autoUpdateGovernmentRate'),
                prompt: (
                    <View>
                        <Text style={[styles.textNormal, styles.mb3]}>{translate('workspace.distanceRates.governmentRateCountrySelectionPrompt')}</Text>
                        <GovernmentRateCountryRadioButtons
                            onSelect={(countryCode) => {
                                pendingGovernmentRateCountry.current = countryCode;
                            }}
                        />
                    </View>
                ),
                confirmText: translate('common.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            }).then((result) => {
                const countryCode = pendingGovernmentRateCountry.current;
                pendingGovernmentRateCountry.current = undefined;
                if (result.action !== ModalActions.CONFIRM || !countryCode) {
                    return;
                }
                applyCurrencyChange(item, countryCode);
            });
            return;
        }

        // Moving to another supported currency with auto-update on swaps which government's rates get copied
        if (isAutoUpdateOn && isCurrencyChange && isCurrencySupportedForAutoUpdate(item.currencyCode)) {
            const countryPhraseTranslationKey = getGovernmentRateCountryPhraseTranslationKey(getGovernmentRateCountryForCurrency(item.currencyCode));
            showConfirmModal({
                title: translate('workspace.distanceRates.autoUpdateGovernmentRate'),
                prompt: translate(
                    'workspace.distanceRates.currencyChangeGovernmentRateWarning',
                    item.currencyCode,
                    translate(countryPhraseTranslationKey ?? 'workspace.distanceRates.governmentRateCountryGeneric'),
                ),
                confirmText: translate('common.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                applyCurrencyChange(item);
            });
            return;
        }

        applyCurrencyChange(item);
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
