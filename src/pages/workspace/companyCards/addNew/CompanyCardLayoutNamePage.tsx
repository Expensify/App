import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/CompanyCardLayoutNameForm';

type CompanyCardLayoutNamePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_LAYOUT_NAME>;

function CompanyCardLayoutNamePage({route}: CompanyCardLayoutNamePageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const defaultValue = addNewCard?.data?.companyCardLayoutName ?? '';

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.COMPANY_CARD_LAYOUT_NAME_FORM>) => {
        const companyCardLayoutName = values[INPUT_IDS.COMPANY_CARD_LAYOUT_NAME].trim();
        setAddNewCompanyCardStepAndData({
            data: {companyCardLayoutName},
        });
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.COMPANY_CARD_LAYOUT_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.COMPANY_CARD_LAYOUT_NAME_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.COMPANY_CARD_LAYOUT_NAME]);
        const length = values[INPUT_IDS.COMPANY_CARD_LAYOUT_NAME].length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.COMPANY_CARD_LAYOUT_NAME, translate('common.error.characterLimitExceedCounter', length, CONST.STANDARD_LENGTH_LIMIT));
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="CompanyCardLayoutNamePage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.addNewCard.companyCardLayoutName')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID))}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.COMPANY_CARD_LAYOUT_NAME_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    validate={validate}
                    style={[styles.flexGrow1, styles.ph5]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.COMPANY_CARD_LAYOUT_NAME}
                            label={translate('workspace.companyCards.addNewCard.companyCardLayoutName')}
                            accessibilityLabel={translate('workspace.companyCards.addNewCard.companyCardLayoutName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={defaultValue}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CompanyCardLayoutNamePage.displayName = 'CompanyCardLayoutNamePage';

export default CompanyCardLayoutNamePage;

