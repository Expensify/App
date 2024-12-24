import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
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

type EditPerDiemDestinationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_EDIT_DESTINATION>;

function EditPerDiemDestinationPage({route}: EditPerDiemDestinationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const subRateID = route.params.subRateID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const customUnit = getPerDiemCustomUnit(policy);

    const selectedRate = customUnit?.rates?.[rateID];

    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM> = {};

            if (!values.destination.trim()) {
                errors.destination = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    const editDestination = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM>) => {
            const newDestination = values.destination.trim();
            if (newDestination !== selectedRate?.name) {
                PerDiem.editPerDiemRateDestination(policyID, rateID, customUnit, newDestination);
            }
            Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
        },
        [selectedRate?.name, policyID, rateID, subRateID, customUnit],
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
                style={[styles.defaultModalContainer]}
                testID={EditPerDiemDestinationPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.perDiem.destination')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_PER_DIEM_FORM}
                    validate={validate}
                    onSubmit={editDestination}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <View style={styles.pb4}>
                        <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>
                            {translate('workspace.perDiem.editDestinationSubtitle', {destination: selectedRate?.name ?? ''})}
                        </Text>
                    </View>
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={selectedRate?.name}
                        label={translate('workspace.perDiem.destination')}
                        accessibilityLabel={translate('workspace.perDiem.destination')}
                        inputID={INPUT_IDS.DESTINATION}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.MAX_LENGTH_256}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

EditPerDiemDestinationPage.displayName = 'EditPerDiemDestinationPage';

export default EditPerDiemDestinationPage;
