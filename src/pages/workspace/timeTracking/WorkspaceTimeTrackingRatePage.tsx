import React from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updatePolicyTimeTrackingDefaultRate} from '@libs/actions/Policy/Policy';
import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTimeTrackingRateForm';

type WorkspaceTimeTrackingRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TIME_TRACKING_RATE>;

function WorkspaceTimeTrackingRatePage({route}: WorkspaceTimeTrackingRatePageProps) {
    const {policyID} = route.params;

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TIME_TRACKING_RATE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TIME_TRACKING_RATE_FORM> =>
        getFieldRequiredErrors(values, [INPUT_IDS.RATE]);

    if (!policy) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED}
        >
            <ScreenWrapper testID="WorkspaceTimeTrackingRatePage">
                <HeaderWithBackButton title={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TIME_TRACKING_RATE_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={(values) => {
                        updatePolicyTimeTrackingDefaultRate(policyID, Number.parseFloat(values[INPUT_IDS.RATE]));
                        Navigation.goBack();
                    }}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        label={translate('workspace.moreFeatures.timeTracking.defaultHourlyRate')}
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.RATE}
                        currency={policy?.outputCurrency ?? CONST.CURRENCY.USD}
                        defaultValue={convertToFrontendAmountAsString(getDefaultTimeTrackingRate(policy), policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                        isCurrencyPressable={false}
                        ref={inputCallbackRef}
                        displayAsTextInput
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTimeTrackingRatePage;
