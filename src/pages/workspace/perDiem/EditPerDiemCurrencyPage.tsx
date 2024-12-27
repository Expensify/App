import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PerDiem from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type EditPerDiemCurrencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_EDIT_CURRENCY>;

function EditPerDiemCurrencyPage({route}: EditPerDiemCurrencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];

    const editCurrency = useCallback(
        (item: CurrencyListItem) => {
            const newCurrency = item.currencyCode;
            if (newCurrency !== selectedRate?.currency) {
                PerDiem.editPerDiemRateCurrency(policyID, rateID, customUnit, newCurrency);
            }
            Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
        },
        [selectedRate?.currency, policyID, rateID, subRateID, customUnit],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            shouldBeBlocked={!policyID || !rateID || isEmptyObject(selectedRate)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID={EditPerDiemCurrencyPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.currency')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID))}
                />
                <View style={[styles.pb4, styles.mh5]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.perDiem.editCurrencySubtitle', {destination: selectedRate?.name ?? ''})}</Text>
                </View>
                <CurrencySelectionList
                    initiallySelectedCurrencyCode={selectedRate?.currency}
                    onSelect={editCurrency}
                    searchInputLabel={translate('common.search')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditPerDiemCurrencyPage.displayName = 'EditPerDiemCurrencyPage';

export default EditPerDiemCurrencyPage;
