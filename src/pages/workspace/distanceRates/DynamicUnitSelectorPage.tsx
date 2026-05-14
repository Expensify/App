import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {UnitItemType} from '@components/UnitPicker';
import UnitPicker from '@components/UnitPicker';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyDistanceRatesUnit} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicUnitSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_UNIT_SELECTOR>;

function DynamicUnitSelectorPage({
    route: {
        params: {policyID, customUnitID},
    },
}: DynamicUnitSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const customUnit = policy?.customUnits?.[customUnitID];
    const currentUnit = customUnit?.attributes?.unit;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.UNIT_SELECTOR.path);

    const onUnitSelected = (unit: UnitItemType) => {
        if (!customUnit) {
            Navigation.goBack(backPath);
            return;
        }

        const attributes = {...customUnit?.attributes, unit: unit.value};
        setPolicyDistanceRatesUnit(policyID, customUnit, {
            ...customUnit,
            attributes,
        });
        Navigation.goBack(backPath);
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
                testID="DynamicUnitSelectorPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.unit')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <UnitPicker
                    defaultValue={currentUnit}
                    onOptionSelected={onUnitSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicUnitSelectorPage;
