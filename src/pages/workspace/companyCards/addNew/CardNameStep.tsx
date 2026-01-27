import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddNewCardFeedForm';

function CardNameStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.CARD_TITLE]);
        const length = values.cardTitle.length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.CARD_TITLE, translate('common.error.characterLimitExceedCounter', length, CONST.STANDARD_LENGTH_LIMIT));
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM>) => {
        setAddNewCompanyCardStepAndData({
            step: CONST.COMPANY_CARDS.STEP.CARD_DETAILS,
            data: {
                bankName: values.cardTitle,
            },
            isEditing: false,
        });
    };

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS});
    };

    return (
        <ScreenWrapper
            testID="CardNameStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whatBankIssuesCard')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM}
                submitButtonText={translate('common.next')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
                shouldPreventDefaultFocusOnPressSubmit
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_TITLE}
                    label={translate('workspace.companyCards.addNewCard.enterNameOfBank')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={addNewCard?.data?.bankName}
                    containerStyles={[styles.mb6]}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default CardNameStep;
