import AmountForm from '@components/AmountForm';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestDistanceRate} from '@libs/actions/IOU/MoneyRequest';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getCurrentGovernmentMileageRate,
    getDefaultEuroDistanceRateCountry,
    getDistanceRateCountryForCurrency,
    getEuroDistanceRateCountryOptions,
    getExpectedUnitForCountry,
    getGovernmentRateAmountForUnit,
    getNoGovernmentRateNote,
    isEuroDistanceRateCountry,
    isGovernmentRateCountry,
    isSharedGovernmentRateCurrency,
    validateCreateDistanceRateForm,
} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit, isControlPolicy} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import {createPolicyDistanceRate, openPolicyDistanceRatesPage, setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';
import {generateCustomUnitID} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';
import type {Rate} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import EuroCountryDropdown from './EuroCountryDropdown';

type CreateDistanceRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

type DistanceRateKind = ValueOf<typeof CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND>;

const GOVERNMENT_AMOUNT_SKELETON_WIDTH = 64;

function CreateDistanceRatePage({
    route: {
        params: {policyID, transactionID, reportID, iouType, action},
    },
}: CreateDistanceRatePageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'Pencil', 'Info']);
    const {translate, toLocaleDigit, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const customUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID;
    const distanceUnit = customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const customUnitRateID = generateCustomUnitID();
    const {inputCallbackRef} = useAutoFocusInput();
    const isDistanceRateUpgrade = transactionID && reportID;
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`);
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);
    const formRef = useRef<FormRef>(null);

    // The auto-update toggle is on exactly when the workspace has its government rate, and a workspace has at most one
    const hasGovernmentRate = !!policy?.shouldAutoUpdateGovernmentDistanceRates;
    const isEuroWorkspace = isSharedGovernmentRateCurrency(currency);

    const [pickedKind, setPickedKind] = useState<DistanceRateKind>();

    // The workspace's government rate is always for the country chosen in Distance rates > Settings, so that country is shown when it's selected
    const canPickEuroCountry = isEuroWorkspace && !(hasGovernmentRate && pickedKind === CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.GOVERNMENT);
    const [pickedEuroCountry, setPickedEuroCountry] = useState<Country>();
    const euroCountry = (canPickEuroCountry ? pickedEuroCountry : undefined) ?? getDefaultEuroDistanceRateCountry(policy, countryByIp);
    const country = isEuroWorkspace ? euroCountry : getDistanceRateCountryForCurrency(currency, currencyList);
    const governmentRateCountry = !isDistanceRateUpgrade && isGovernmentRateCountry(country) ? country : undefined;
    const defaultKind = hasGovernmentRate ? CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.CUSTOM : CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.GOVERNMENT;
    const kind = governmentRateCountry ? (pickedKind ?? defaultKind) : CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.CUSTOM;
    const isGovernmentKind = kind === CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.GOVERNMENT;
    const isGovernmentRateTaken = isGovernmentKind && hasGovernmentRate;
    const currentGovernmentRate = isGovernmentKind && governmentRateCountry ? getCurrentGovernmentMileageRate(governmentMileageRates, currency, governmentRateCountry) : undefined;

    const existingRateNames = Object.values(customUnit?.rates ?? {}).map((r) => r.name ?? '');

    const FullPageBlockingView = !customUnitID ? FullPageOfflineBlockingView : View;

    // Deep links can open this page before the rates list page has loaded the government reference rates
    const fetchDistanceRates = () => {
        if (isDistanceRateUpgrade) {
            return;
        }
        openPolicyDistanceRatesPage(policyID);
    };

    useNetwork({onReconnect: fetchDistanceRates});

    useEffect(() => {
        fetchDistanceRates();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the rates only need loading once when the page opens
    }, []);

    // The custom form is cleared and the kind goes back to the new country's default
    const selectEuroCountry = (selectedCountry: string) => {
        if (!isEuroDistanceRateCountry(selectedCountry)) {
            return;
        }
        setPickedEuroCountry(selectedCountry);
        setPickedKind(undefined);
        formRef.current?.resetForm({});
    };

    const navigateToWorkspaceOverview = () => {
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));
    };

    const navigateToDistanceRateSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) =>
        isGovernmentKind ? {} : validateCreateDistanceRateForm(values, toLocaleDigit, translate, existingRateNames);

    const saveGovernmentRate = () => {
        if (!policy || !currentGovernmentRate) {
            return;
        }

        // Only Control can auto-update government rates, so the toggle sends every other workspace to the upgrade flow too
        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.governmentDistanceRates.alias, ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID)),
            );
            return;
        }

        setWorkspaceDistanceAutoUpdate(policy, true, governmentMileageRates ?? [], isEuroWorkspace ? governmentRateCountry : undefined);
        Navigation.goBack();
    };

    const saveCustomRate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        // A blocking view is shown when customUnitID is undefined, so this function should never be called
        if (!customUnitID) {
            return;
        }

        const newRate: Rate = {
            currency,
            name: values.name.trim(),
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
            ...(values.startDate && {startDate: values.startDate}),
            ...(values.endDate && {endDate: values.endDate}),
        };

        createPolicyDistanceRate(policyID, customUnitID, newRate);
        if (isDistanceRateUpgrade) {
            const isEdit = action === CONST.IOU.ACTION.EDIT;
            setMoneyRequestDistanceRate(transactionDraft, customUnitRateID, policy, true);
            Navigation.goBack(
                !isEdit
                    ? ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action ?? CONST.IOU.ACTION.CREATE, iouType ?? CONST.IOU.TYPE.SUBMIT, transactionID, reportID)
                    : createDynamicRoute(
                          DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(CONST.IOU.ACTION.EDIT, iouType ?? CONST.IOU.TYPE.SUBMIT, transactionID, reportID),
                          ROUTES.REPORT_WITH_ID.getRoute(reportID),
                      ),
                {compareParams: false},
            );
            return;
        }
        Navigation.goBack();
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        if (isGovernmentKind) {
            saveGovernmentRate();
            return;
        }
        saveCustomRate(values);
    };

    const kindTabs: Array<TabSelectorBaseItem<DistanceRateKind>> = [
        {key: CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.GOVERNMENT, title: translate('workspace.distanceRates.addRatePage.government'), icon: icons.Bank},
        {key: CONST.CUSTOM_UNITS.DISTANCE_RATE_KIND.CUSTOM, title: translate('workspace.distanceRates.addRatePage.custom'), icon: icons.Pencil},
    ];
    const authority = governmentRateCountry ? translate(`workspace.distanceRates.addRatePage.governmentRateAuthorities.${governmentRateCountry}`) : '';
    const kindHint = isGovernmentRateTaken
        ? translate('workspace.distanceRates.addRatePage.alreadyHasGovernmentRate')
        : translate('workspace.distanceRates.addRatePage.matchesAuthority', authority);

    // Saving a government rate switches the workspace to the unit the country publishes its rate in, so the amount is shown in that unit
    const isGovernmentRateInMiles = (getExpectedUnitForCountry(governmentRateCountry) ?? distanceUnit) === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const governmentRateUnit = isGovernmentRateInMiles ? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES : CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS;
    const governmentAmountLabel = translate('workspace.distanceRates.amountPerUnit', translate(isGovernmentRateInMiles ? 'common.mile' : 'common.kilometer'));
    const customAmountLabel = translate('workspace.distanceRates.amountPerUnit', translate(distanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? 'common.mile' : 'common.kilometer'));
    const governmentAmount = currentGovernmentRate
        ? convertAmountToDisplayString(getGovernmentRateAmountForUnit(currentGovernmentRate.rate, currentGovernmentRate.sourceRateID, governmentRateUnit), currency)
        : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="CreateDistanceRatePage"
                shouldEnableKeyboardAvoidingView={false}
            >
                <HeaderWithBackButton title={isDistanceRateUpgrade ? translate('common.rate') : translate('workspace.distanceRates.addRate')} />
                <FullPageBlockingView style={styles.flexGrow1}>
                    <FormProvider
                        ref={formRef}
                        formID={ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM}
                        submitButtonText={translate('common.save')}
                        onSubmit={submit}
                        validate={validate}
                        isSubmitButtonVisible={!isGovernmentRateTaken}
                        isSubmitDisabled={isGovernmentKind && !currentGovernmentRate}
                        enabledWhenOffline
                        style={[styles.mh5, styles.flex1]}
                        submitButtonStyles={[styles.mt0]}
                        addBottomSafeAreaPadding
                    >
                        {!isDistanceRateUpgrade && (
                            <>
                                {canPickEuroCountry ? (
                                    <View style={styles.mhn4}>
                                        <EuroCountryDropdown
                                            label={translate('workspace.distanceRates.addRatePage.whichCountry')}
                                            selectedCountry={country ?? ''}
                                            countries={getEuroDistanceRateCountryOptions(translate, localeCompare)}
                                            onSelectCountry={selectEuroCountry}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.mhn5}>
                                        <MenuItemField
                                            name={translate('common.country')}
                                            value={country ? translate(`allCountries.${country}`) : translate('workspace.distanceRates.addRatePage.otherCountry')}
                                        />
                                    </View>
                                )}
                                {!canPickEuroCountry && (
                                    <View style={[styles.renderHTML, styles.flexRow]}>
                                        <RenderHTML
                                            html={translate(
                                                isEuroWorkspace
                                                    ? 'workspace.distanceRates.addRatePage.setInDistanceRateSettings'
                                                    : 'workspace.distanceRates.addRatePage.basedOnDefaultCurrency',
                                            )}
                                            onLinkPress={isEuroWorkspace ? navigateToDistanceRateSettings : navigateToWorkspaceOverview}
                                        />
                                    </View>
                                )}
                                <View style={[styles.sectionDividerLine, styles.mv6]} />
                                <Text
                                    variant="labelStrong"
                                    style={styles.mb5}
                                >
                                    {translate('workspace.distanceRates.addRatePage.whatKindOfRate')}
                                </Text>
                                {governmentRateCountry ? (
                                    <>
                                        <TabSelectorContextProvider activeTabKey={kind}>
                                            <TabSelectorBase
                                                tabs={kindTabs}
                                                activeTabKey={kind}
                                                onTabPress={setPickedKind}
                                                contentContainerStyles={[styles.ph0, styles.pb0]}
                                                equalWidth
                                            />
                                        </TabSelectorContextProvider>
                                        {isGovernmentKind && <Text style={[styles.textLabelSupporting, styles.mt4]}>{kindHint}</Text>}
                                    </>
                                ) : (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                        <Icon
                                            src={icons.Info}
                                            fill={theme.icon}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                        />
                                        <Text style={[styles.textLabelSupporting, styles.flex1]}>{getNoGovernmentRateNote(translate, country)}</Text>
                                    </View>
                                )}
                            </>
                        )}
                        {!isGovernmentKind && (
                            <>
                                {!isDistanceRateUpgrade && (
                                    <>
                                        <View style={[styles.sectionDividerLine, styles.mv6]} />
                                        <Text
                                            variant="labelStrong"
                                            style={styles.mb5}
                                        >
                                            {translate('common.details')}
                                        </Text>
                                    </>
                                )}
                                <InputWrapper
                                    ref={inputCallbackRef}
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.NAME}
                                    label={translate('common.name')}
                                    accessibilityLabel={translate('common.name')}
                                    role={CONST.ROLE.PRESENTATION}
                                />
                                <View style={[styles.flexRow, styles.gap3, styles.mt2]}>
                                    <View style={styles.flex1}>
                                        <InputWrapper
                                            InputComponent={DatePicker}
                                            inputID={INPUT_IDS.START_DATE}
                                            label={translate('workspace.distanceRates.startDate')}
                                            shouldDeferShowUntilPositioned
                                            shouldDismissKeyboardBeforeShow
                                        />
                                    </View>
                                    <View style={styles.flex1}>
                                        <InputWrapper
                                            InputComponent={DatePicker}
                                            inputID={INPUT_IDS.END_DATE}
                                            label={translate('workspace.distanceRates.endDate')}
                                            shouldDeferShowUntilPositioned
                                            shouldDismissKeyboardBeforeShow
                                        />
                                    </View>
                                </View>
                                {!isDistanceRateUpgrade && (
                                    <>
                                        <View style={[styles.sectionDividerLine, styles.mv6]} />
                                        <Text
                                            variant="labelStrong"
                                            style={styles.mb5}
                                        >
                                            {translate('workspace.distanceRates.rate')}
                                        </Text>
                                    </>
                                )}
                                <InputWrapper
                                    InputComponent={AmountForm}
                                    inputID={INPUT_IDS.RATE}
                                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                                    currency={currency}
                                    isCurrencyPressable={false}
                                    displayAsTextInput
                                    label={customAmountLabel}
                                />
                            </>
                        )}
                        {isGovernmentKind && !isGovernmentRateTaken && (
                            <>
                                <View style={[styles.sectionDividerLine, styles.mv6]} />
                                <Text
                                    variant="labelStrong"
                                    style={styles.mb2}
                                >
                                    {translate('workspace.distanceRates.rate')}
                                </Text>
                                <View style={styles.mhn5}>
                                    {governmentAmount ? (
                                        <MenuItemField
                                            name={governmentAmountLabel}
                                            value={governmentAmount}
                                        />
                                    ) : (
                                        <View style={[styles.ph5, styles.pv3]}>
                                            <Text style={styles.textLabelSupporting}>{governmentAmountLabel}</Text>
                                            <SkeletonTextLine
                                                lineHeight={lineHeightScale.text}
                                                barWidth={GOVERNMENT_AMOUNT_SKELETON_WIDTH}
                                            />
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </FormProvider>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CreateDistanceRatePage;
