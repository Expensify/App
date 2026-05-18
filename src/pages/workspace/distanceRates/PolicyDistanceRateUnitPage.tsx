import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {UnitItemType} from '@components/UnitPicker';
import UnitPicker from '@components/UnitPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyDistanceRatesUnit} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type PolicyDistanceRateUnitPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_UNIT>;

function PolicyDistanceRateUnitPage({route}: PolicyDistanceRateUnitPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const customUnit = getDistanceRateCustomUnit(policy);

    const onUnitSelected = (unit: UnitItemType) => {
        if (!customUnit) {
            return;
        }
        const attributes = {...customUnit.attributes, unit: unit.value};
        setPolicyDistanceRatesUnit(policyID, customUnit, {...customUnit, attributes});
        Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableKeyboardAvoidingView={false}
                testID={PolicyDistanceRateUnitPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.unit')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID))}
                />
                <UnitPicker
                    defaultValue={customUnit?.attributes?.unit}
                    onOptionSelected={onUnitSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyDistanceRateUnitPage.displayName = 'PolicyDistanceRateUnitPage';

export default PolicyDistanceRateUnitPage;
