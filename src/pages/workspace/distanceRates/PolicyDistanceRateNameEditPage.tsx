import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateNameError, getDistanceRateNameErrorMessage, sanitizeDistanceRateName} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {updatePolicyDistanceRateName} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateNameEditForm';

import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';

type PolicyDistanceRateNameEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT>;

function PolicyDistanceRateNameEditPage({route}: PolicyDistanceRateNameEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const policy = usePolicy(policyID);
    const customUnit = getDistanceRateCustomUnit(policy);
    const rate = customUnit?.rates[rateID];
    const currentRateName = rate?.name;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_NAME_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_NAME_EDIT_FORM> = {};
            const existingRateNames = Object.values(customUnit?.rates ?? {}).map((existingRate) => existingRate.name ?? '');
            const nameError = getDistanceRateNameError(existingRateNames, values.rateName, currentRateName);

            if (nameError) {
                errors.rateName = getDistanceRateNameErrorMessage(translate, nameError, values.rateName);
            }

            return errors;
        },
        [customUnit?.rates, currentRateName, translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_NAME_EDIT_FORM>) => {
            if (!customUnit || !rate) {
                return;
            }
            const sanitized = sanitizeDistanceRateName(values.rateName);
            if (currentRateName === sanitized) {
                Navigation.goBack();
                return;
            }
            updatePolicyDistanceRateName(policyID, customUnit, [{...rate, name: sanitized}]);
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [currentRateName, customUnit, rate, policyID],
    );

    if (!rate) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyDistanceRateNameEditPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.name')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_NAME_EDIT_FORM}
                    onSubmit={submit}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={currentRateName}
                        label={translate('common.name')}
                        accessibilityLabel={translate('common.name')}
                        inputID={INPUT_IDS.RATE_NAME}
                        role={CONST.ROLE.PRESENTATION}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateNameEditPage;
