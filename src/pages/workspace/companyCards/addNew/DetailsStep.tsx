import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddNewCardFeedForm';

function DetailsStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const feedProvider = addNewCard?.data.cardType;
    const submit = () => {};

    const handleBackButtonPress = () => {
        if (feedProvider === CONST.COMPANY_CARDS.CARD_TYPE.AMEX) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS});
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_NAME});
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.BANK_ID]);

            switch (feedProvider) {
                case CONST.COMPANY_CARDS.CARD_TYPE.VISA:
                    if (!values[INPUT_IDS.BANK_ID]) {
                        errors[INPUT_IDS.BANK_ID] = translate('common.error.fieldRequired');
                    }
                    if (!values[INPUT_IDS.PROCESSOR_ID]) {
                        errors[INPUT_IDS.PROCESSOR_ID] = translate('common.error.fieldRequired');
                    }
                    if (!values[INPUT_IDS.COMPANY_ID]) {
                        errors[INPUT_IDS.COMPANY_ID] = translate('common.error.fieldRequired');
                    }
                    break;
                case CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD:
                    if (!values[INPUT_IDS.DISTRIBUTION_ID]) {
                        errors[INPUT_IDS.DISTRIBUTION_ID] = translate('common.error.fieldRequired');
                    }
                    break;
                case CONST.COMPANY_CARDS.CARD_TYPE.AMEX:
                    if (!values[INPUT_IDS.DELIVERY_FILE_NAME]) {
                        errors[INPUT_IDS.DELIVERY_FILE_NAME] = translate('common.error.fieldRequired');
                    }
                    break;
                default:
                    break;
            }
            return errors;
        },
        [feedProvider, translate],
    );

    const renderInputs = () => {
        switch (feedProvider) {
            case CONST.COMPANY_CARDS.CARD_TYPE.VISA:
                return (
                    <>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROCESSOR_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.visa.processorLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mb6]}
                            ref={inputCallbackRef}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.BANK_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.visa.bankLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mb6]}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.COMPANY_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.visa.companyLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mb6]}
                        />
                    </>
                );
            case CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD:
                return (
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DISTRIBUTION_ID}
                        label={translate('workspace.companyCards.addNewCard.feedDetails.mastercard.distributionLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mb6]}
                        ref={inputCallbackRef}
                    />
                );
            case CONST.COMPANY_CARDS.CARD_TYPE.AMEX:
                return (
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DELIVERY_FILE_NAME}
                        label={translate('workspace.companyCards.addNewCard.feedDetails.amex.fileNameLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mb6]}
                        ref={inputCallbackRef}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ScreenWrapper
            testID={DetailsStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>
                    {feedProvider && feedProvider !== CONST.COMPANY_CARDS.CARD_TYPE.STRIPE ? translate(`workspace.companyCards.addNewCard.feedDetails.${feedProvider}.title`) : ''}
                </Text>
                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM}
                    submitButtonText={translate('common.submit')}
                    onSubmit={submit}
                    validate={validate}
                    style={[styles.mh5, styles.flexGrow1]}
                    enabledWhenOffline
                >
                    {renderInputs()}
                </FormProvider>
            </ScrollView>
        </ScreenWrapper>
    );
}

DetailsStep.displayName = 'DetailsStep';

export default DetailsStep;
