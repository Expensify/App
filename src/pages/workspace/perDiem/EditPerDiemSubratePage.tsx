import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
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
import INPUT_IDS from '@src/types/form/WorkspacePerDiemForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type EditPerDiemSubratePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_EDIT_SUBRATE>;

function EditPerDiemSubratePage({route}: EditPerDiemSubratePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];
    const selectedSubrate = selectedRate?.subRates?.find((subRate) => subRate.id === subRateID);

    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> = {};

            if (!values.subrate.trim()) {
                errors.subrate = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const editSubrate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>) => {
            const newSubrate = values.subrate.trim();
            if (newSubrate !== selectedSubrate?.name) {
                PerDiem.editPerDiemRateSubrate(policyID, rateID, subRateID, customUnit, newSubrate);
            }
            Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
        },
        [selectedSubrate?.name, policyID, rateID, subRateID, customUnit],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            shouldBeBlocked={!policyID || !rateID || isEmptyObject(selectedRate) || isEmptyObject(selectedSubrate)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                style={[styles.defaultModalContainer]}
                testID={EditPerDiemSubratePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.perDiem.subrate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM}
                    validate={validate}
                    onSubmit={editSubrate}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={selectedSubrate?.name}
                        label={translate('workspace.perDiem.subrate')}
                        accessibilityLabel={translate('workspace.perDiem.subrate')}
                        inputID={INPUT_IDS.SUBRATE}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.MAX_LENGTH_256}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditPerDiemSubratePage.displayName = 'EditPerDiemSubratePage';

export default EditPerDiemSubratePage;
