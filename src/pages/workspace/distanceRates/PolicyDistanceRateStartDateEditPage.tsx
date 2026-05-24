import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updatePolicyDistanceRate} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateEditForm';

type PolicyDistanceRateStartDateEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_START_DATE_EDIT>;

function PolicyDistanceRateStartDateEditPage({route}: PolicyDistanceRateStartDateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isDateBoundMileageRateEnabled = isBetaEnabled(CONST.BETAS.DATE_BOUND_MILEAGE_RATE);
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const policy = usePolicy(policyID);
    const customUnit = getDistanceRateCustomUnit(policy);
    const rate = customUnit?.rates[rateID];

    const currentEndDate = useMemo(() => rate?.endDate, [rate?.endDate]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM> = {};
            if (values.startDate && currentEndDate && values.startDate > currentEndDate) {
                errors.startDate = translate('workspace.distanceRates.errors.startDateMustBeBeforeEndDate');
            }
            return errors;
        },
        [translate, currentEndDate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
            if (!customUnit || !rate) {
                return;
            }

            const newStartDate = values.startDate || null;
            if ((rate.startDate ?? null) === newStartDate) {
                Navigation.goBack();
                return;
            }

            updatePolicyDistanceRate(
                policyID,
                customUnit,
                {
                    ...rate,
                    startDate: newStartDate,
                },
                CONST.CUSTOM_UNITS.RATE_FIELD.START_DATE,
            );
            Navigation.goBack();
        },
        [policyID, customUnit, rate],
    );

    if (!rate || !isDateBoundMileageRateEnabled) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyDistanceRateStartDateEditPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.distanceRates.startDate')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    validate={validate}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mh5}>
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.START_DATE}
                            label={translate('workspace.distanceRates.startDate')}
                            defaultValue={rate.startDate ?? ''}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateStartDateEditPage;
