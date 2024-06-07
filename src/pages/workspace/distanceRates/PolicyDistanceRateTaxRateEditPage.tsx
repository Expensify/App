import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type ListItemType = {
    value: string;
    text: string;
    isSelected: boolean;
    keyForList: string;
    pendingAction?: PendingAction;
};

type PolicyDistanceRateTaxRateEditPageProps = WithPolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT>;

function PolicyDistanceRateTaxRateEditPage({route, policy}: PolicyDistanceRateTaxRateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const rate = customUnit?.rates[rateID];
    const taxRateExternalID = rate.attributes?.taxRateExternalID;
    const taxRateItems: ListItemType[] = useMemo(() => {
        const taxes = policy?.taxRates?.taxes;
        const result = Object.entries(taxes ?? {}).map(([key, value]) => ({
            value: key,
            text: `${value.name} (${value.value})`,
            isSelected: taxRateExternalID === key,
            keyForList: key,
            pendingAction: value.pendingAction,
            isDisabled: value.pendingAction == CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        }));
        return result;
    }, [policy, taxRateExternalID]);

    const onTaxRateChange = (newTaxRate: ListItemType) => {
        DistanceRate.updateDistanceTaxRate(policyID, customUnit, [
            {
                ...rate,
                attributes: {
                    ...rate.attributes,
                    taxRateExternalID: newTaxRate.value,
                },
            },
        ]);
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
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
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxRate')}
                    shouldShowBackButton
                />
                <SelectionList
                    sections={[{data: taxRateItems}]}
                    ListItem={RadioListItem}
                    onSelectRow={onTaxRateChange}
                    initiallyFocusedOptionKey={taxRateItems.find((item) => item.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyDistanceRateTaxRateEditPage.displayName = 'PolicyDistanceRateTaxRateEditPage';

export default withPolicy(PolicyDistanceRateTaxRateEditPage);
