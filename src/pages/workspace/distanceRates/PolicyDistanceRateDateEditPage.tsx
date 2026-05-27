import React from 'react';
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
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateEditForm';

type PolicyDistanceRateDateEditPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.DISTANCE_RATE_START_DATE_EDIT,
    typeof SCREENS.WORKSPACE.DISTANCE_RATE_END_DATE_EDIT
>;

function PolicyDistanceRateDateEditPage({route}: PolicyDistanceRateDateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isDateBoundMileageRateEnabled = isBetaEnabled(CONST.BETAS.DATE_BOUND_MILEAGE_RATE);
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const policy = usePolicy(policyID);
    const customUnit = getDistanceRateCustomUnit(policy);
    const rate = customUnit?.rates[rateID];

    const isStartDate = route.name === SCREENS.WORKSPACE.DISTANCE_RATE_START_DATE_EDIT;
    const fieldName = isStartDate ? CONST.CUSTOM_UNITS.RATE_FIELD.START_DATE : CONST.CUSTOM_UNITS.RATE_FIELD.END_DATE;
    const inputID = isStartDate ? INPUT_IDS.START_DATE : INPUT_IDS.END_DATE;
    const titleKey = isStartDate ? 'workspace.distanceRates.startDate' : 'workspace.distanceRates.endDate';
    const otherDate = isStartDate ? rate?.endDate : rate?.startDate;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM> = {};
        if (isStartDate && values.startDate && otherDate && values.startDate > otherDate) {
            errors.startDate = translate('workspace.distanceRates.errors.startDateMustBeBeforeEndDate');
        }
        if (!isStartDate && otherDate && values.endDate && otherDate > values.endDate) {
            errors.endDate = translate('workspace.distanceRates.errors.startDateMustBeBeforeEndDate');
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
        if (!customUnit || !rate) {
            return;
        }

        const newValue = (isStartDate ? values.startDate : values.endDate) || null;
        const currentValue = rate[fieldName] ?? null;
        if (currentValue === newValue) {
            Navigation.goBack();
            return;
        }

        updatePolicyDistanceRate(
            policyID,
            customUnit,
            {
                ...rate,
                [fieldName]: newValue,
            },
            fieldName,
        );
        Navigation.goBack();
    };

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
                testID={isStartDate ? 'PolicyDistanceRateStartDateEditPage' : 'PolicyDistanceRateEndDateEditPage'}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    validate={validate}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mh5}>
                        <InputWrapper
                            autoFocus
                            InputComponent={DatePicker}
                            inputID={inputID}
                            label={translate(titleKey)}
                            defaultValue={rate[fieldName] ?? ''}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateDateEditPage;
