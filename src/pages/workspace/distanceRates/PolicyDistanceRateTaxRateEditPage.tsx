import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDistanceTaxRate} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getWorkspaceTaxesSettingsName} from '@libs/TransactionUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type PolicyDistanceRateTaxRateEditPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT>;

function PolicyDistanceRateTaxRateEditPage({route, policy}: PolicyDistanceRateTaxRateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const customUnit = getDistanceRateCustomUnit(policy);
    const rate = customUnit?.rates[rateID];
    const taxRateExternalID = rate?.attributes?.taxRateExternalID;
    const selectedTaxRate = taxRateExternalID ? getWorkspaceTaxesSettingsName(policy, taxRateExternalID) : undefined;

    const onTaxRateChange = (newTaxRate: TaxRatesOption) => {
        if (taxRateExternalID === newTaxRate.code) {
            Navigation.goBack();
            return;
        }
        if (!customUnit || !rate) {
            return;
        }
        updateDistanceTaxRate(policyID, customUnit, [
            {
                ...rate,
                attributes: {
                    ...rate?.attributes,
                    taxRateExternalID: newTaxRate.code,
                },
            },
        ]);
        Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };

    const dismiss = () => {
        Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
                testID="PolicyDistanceRateTaxRateEditPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxRate')}
                    shouldShowBackButton
                />
                <TaxPicker
                    selectedTaxRate={selectedTaxRate}
                    policyID={policyID}
                    onSubmit={onTaxRateChange}
                    onDismiss={dismiss}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(PolicyDistanceRateTaxRateEditPage);
