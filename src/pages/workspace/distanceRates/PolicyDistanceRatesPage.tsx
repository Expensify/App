import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import {openPolicyDistanceRatesPage} from '@userActions/Policy';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type {Rate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type RateForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
};

type PolicyDistanceRatesPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<Policy>;

    /** Constant, list of available currencies */
    currencyList: OnyxEntry<OnyxTypes.CurrencyList>;
};

type PolicyDistanceRatesPageProps = PolicyDistanceRatesPageOnyxProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

const distanceRates: Record<string, Rate> = {
    RATE1: {
        name: 'rate 1',
        rate: 0.665,
        currency: 'USD',
        enabled: true,
        customUnitRateID: 'RATE1',
    },
    RATE2: {
        name: 'rate 2',
        rate: 0.122,
        currency: 'USD',
        enabled: false,
        customUnitRateID: 'RATE2',
    },
};

function PolicyDistanceRatesPage({policy, currencyList, route}: PolicyDistanceRatesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedDistanceRates, setSelectedDistanceRates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        openPolicyDistanceRatesPage(route.params.policyID);
    }, [route.params.policyID]);

    const distanceRatesList = useMemo<RateForList[]>(
        () =>
            // TODO replace distanceRates const with actual data from API
            Object.values(distanceRates ?? {}).map((value) => ({
                value: value.customUnitRateID ?? '',
                text: `${currencyList?.[value.currency ?? '']?.symbol ?? ''}${value.rate} / mile`,
                keyForList: value.customUnitRateID ?? '',
                isSelected: selectedDistanceRates[value.customUnitRateID ?? ''],
                rightElement: (
                    <View style={styles.flexRow}>
                        <Text style={[styles.disabledText, styles.alignSelfCenter]}>{value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}</Text>
                        <View style={[styles.p1, styles.pl2]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                            />
                        </View>
                    </View>
                ),
            })),
        [currencyList, selectedDistanceRates, styles.alignSelfCenter, styles.disabledText, styles.flexRow, styles.p1, styles.pl2, theme.icon, translate],
    );

    const addRate = () => {
        // Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(route.params.policyID));
    };

    const openSettings = () => {
        // Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(route.params.policyID));
    };

    const editRate = (rateID: string) => {
        // Navigation.navigate(ROUTES.WORKSPACE_EDIT_DISTANCE_RATE.getRoute(route.params.policyID, rateID));
    };

    const deleteRates = () => {
        // run deleteWorkspaceDistanceRates for all selected rows
    };

    const toggleRate = (rate: RateForList) => {
        setSelectedDistanceRates((prev) => ({
            ...prev,
            [rate.value]: !prev[rate.value],
        }));
    };

    const toggleAllRates = () => {
        const isAllSelected = distanceRatesList.every((rate) => selectedDistanceRates[rate.value]);
        setSelectedDistanceRates(isAllSelected ? {} : Object.fromEntries(distanceRatesList.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('workspace.distanceRates.rate')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const headerButtons = isEmptyObject(selectedDistanceRates) ? (
        <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
            <Button
                text={translate('workspace.distanceRates.addRate')}
                onPress={addRate}
                style={[styles.mr3, isSmallScreenWidth && styles.flexGrow1]}
                icon={Expensicons.Plus}
                iconStyles={[styles.mr2]}
                success
            />

            <Button
                text={translate('workspace.common.settings')}
                onPress={openSettings}
                style={[isSmallScreenWidth && styles.flexGrow1]}
                icon={Expensicons.Gear}
                iconStyles={[styles.mr2]}
            />
        </View>
    ) : (
        <ButtonWithDropdownMenu
            title={translate('workspace.common.settings')}
            onPress={openSettings}
            style={[isSmallScreenWidth && styles.flexGrow1]}
            icon={Expensicons.Gear}
            iconStyles={[styles.mr2]}
        />
    );

    return (
        <ScreenWrapper testID={PolicyDistanceRatesPage.displayName}>
            <HeaderWithBackButton
                icon={Illustrations.CarIce}
                title={translate('workspace.common.distanceRates')}
                shouldShowBackButton={false}
            >
                {!isSmallScreenWidth && headerButtons}
            </HeaderWithBackButton>
            {isSmallScreenWidth && <View style={[styles.ph5]}>{headerButtons}</View>}
            <Text style={[styles.pl5, styles.pb2, styles.pt4, styles.textSupporting]}>{translate('workspace.distanceRates.centrallyManage')}</Text>
            <SelectionList
                canSelectMultiple
                ListItem={RadioListItem}
                onSelectAll={toggleAllRates}
                onCheckboxPress={toggleRate}
                sections={[{data: distanceRatesList, indexOffset: 0, isDisabled: false}]}
                onSelectRow={() => editRate('1')}
                showScrollIndicator
                customListHeader={getCustomListHeader()}
                containerStyle={styles.p5}
            />
        </ScreenWrapper>
    );
}

PolicyDistanceRatesPage.displayName = 'PolicyDistanceRatesPage';

export default withOnyx<PolicyDistanceRatesPageProps, PolicyDistanceRatesPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
    currencyList: {key: ONYXKEYS.CURRENCY_LIST},
})(PolicyDistanceRatesPage);
