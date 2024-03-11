import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import {createPolicyDistanceRate, generateCustomUnitID} from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';
import type {Rate} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

type PolicyNewDistanceRatePageOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type PolicyDistanceRatePageProps = PolicyNewDistanceRatePageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CREATE_DISTANCE_RATE>;

function PolicyNewDistanceRatePage({policy, route}: PolicyDistanceRatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = policy !== null ? policy?.outputCurrency : CONST.CURRENCY.USD;
    const customUnits = policy?.customUnits ?? {};
    const customUnitID = customUnits[Object.keys(customUnits)[0]].customUnitID;
    const customUnitRateID = generateCustomUnitID();

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => {
        const newRate: Rate = {
            currency,
            name: CONST.CUSTOM_UNITS.DEFAULT_RATE,
            rate: parseFloat(values.rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID,
            enabled: true,
        };

        createPolicyDistanceRate(newRate, customUnitID, route.params.policyID);
        Navigation.goBack();
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={PolicyNewDistanceRatePage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.distanceRates.addRate')} />
                    <FormProvider
                        formID={ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM}
                        submitButtonText={translate('common.save')}
                        onSubmit={submit}
                        enabledWhenOffline
                        style={[styles.flexGrow1]}
                        shouldHideFixErrorsAlert
                        submitFlexEnabled={false}
                        submitButtonStyles={[styles.mh5, styles.mt0]}
                    >
                        <InputWrapper
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.RATE}
                            extraDecimals={1}
                            isCurrencyPressable={false}
                            currency={currency}
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

PolicyNewDistanceRatePage.displayName = 'PolicyNewDistanceRatePage';

export default withOnyx<PolicyDistanceRatePageProps, PolicyNewDistanceRatePageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(PolicyNewDistanceRatePage);
