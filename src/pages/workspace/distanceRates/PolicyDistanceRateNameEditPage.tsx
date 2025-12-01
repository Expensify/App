import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
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
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updatePolicyDistanceRateName} from '@userActions/Policy/DistanceRate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateNameEditForm';

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
            const newRateName = values.rateName.trim();

            if (!newRateName) {
                errors.rateName = translate('workspace.distanceRates.errors.rateNameRequired');
            } else if (Object.values(customUnit?.rates ?? {}).some((r) => r.name === newRateName) && currentRateName !== newRateName) {
                errors.rateName = translate('workspace.distanceRates.errors.existingRateName');
            } else if ([...newRateName].length > CONST.TAX_RATES.NAME_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                errors.rateName = translate('common.error.characterLimitExceedCounter', {length: [...newRateName].length, limit: CONST.TAX_RATES.NAME_MAX_LENGTH});
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
            if (currentRateName === values.rateName) {
                Navigation.goBack();
                return;
            }
            updatePolicyDistanceRateName(policyID, customUnit, [{...rate, name: values.rateName}]);
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
                testID={PolicyDistanceRateNameEditPage.displayName}
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
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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

PolicyDistanceRateNameEditPage.displayName = 'PolicyDistanceRateNameEditPage';

export default PolicyDistanceRateNameEditPage;
