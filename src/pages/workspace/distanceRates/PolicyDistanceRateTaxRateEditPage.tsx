import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type PolicyDistanceRateTaxRateEditPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT>;

function PolicyDistanceRateTaxRateEditPage({route, policy}: PolicyDistanceRateTaxRateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const rate = customUnit?.rates[rateID];
    const taxRateExternalID = rate.attributes?.taxRateExternalID;
    const selectedTaxRate = TransactionUtils.getWorkspaceTaxesSettingsName(policy, taxRateExternalID ?? '');

    const onTaxRateChange = (newTaxRate: OptionsListUtils.TaxRatesOption) => {
        if (taxRateExternalID === newTaxRate.code) {
            Navigation.goBack();
            return;
        }
        DistanceRate.updateDistanceTaxRate(policyID, customUnit, [
            {
                ...rate,
                attributes: {
                    ...rate.attributes,
                    taxRateExternalID: newTaxRate.code,
                },
            },
        ]);
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };

    const dismiss = () => {
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
                testID={PolicyDistanceRateTaxRateEditPage.displayName}
            >
                {({insets}) => (
                    <>
                        <HeaderWithBackButton
                            title={translate('workspace.taxes.taxRate')}
                            shouldShowBackButton
                        />
                        <TaxPicker
                            selectedTaxRate={selectedTaxRate}
                            policyID={policyID}
                            insets={insets}
                            onSubmit={onTaxRateChange}
                            onDismiss={dismiss}
                        />
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyDistanceRateTaxRateEditPage.displayName = 'PolicyDistanceRateTaxRateEditPage';

export default withPolicy(PolicyDistanceRateTaxRateEditPage);
