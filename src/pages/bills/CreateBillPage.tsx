/** Manual bill intake. Attachments keep the typed invoice details and never enter SmartScan. */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TextInput from '@components/TextInput';
import UploadFile from '@components/UploadFile';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {createBill} from '@libs/actions/BillPay';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isValidDate, isValidEmailWithTLD} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useState} from 'react';
import {View} from 'react-native';

function CreateBillPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [files, setFiles] = useState<FileObject[]>([]);
    const [fileError, setFileError] = useState('');
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_BILL_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.CREATE_BILL_FORM> = {};
        if (!isValidEmailWithTLD(`bill@${values.domain.trim()}`)) {
            errors.domain = translate('common.error.email');
        }
        if (!isValidEmailWithTLD(values.vendorEmail.trim())) {
            errors.vendorEmail = translate('common.error.email');
        }
        if (!values.merchant.trim()) {
            errors.merchant = translate('common.error.fieldRequired');
        }
        const amount = Number(values.amount.replace(',', '.'));
        if (!Number.isFinite(amount) || convertToBackendAmount(amount) <= 0) {
            errors.amount = translate('common.error.invalidAmount');
        }
        if (!/^[A-Z]{3}$/.test(values.currency.toUpperCase())) {
            errors.currency = translate('common.error.pleaseCompleteForm');
        }
        if (!isValidDate(values.date)) {
            errors.date = translate('common.error.dateInvalid');
        }
        return errors;
    };

    return (
        <ScreenWrapper
            testID="CreateBillPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('billPay.createBill')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_BILL_FORM}
                    style={[styles.flexGrow1, styles.ph5]}
                    validate={validate}
                    onSubmit={(values) =>
                        createBill(
                            {
                                domain: values.domain.trim().toLowerCase(),
                                vendorEmail: values.vendorEmail.trim().toLowerCase(),
                                merchant: values.merchant.trim(),
                                amount: convertToBackendAmount(Number(values.amount.replace(',', '.'))),
                                currency: values.currency.toUpperCase(),
                                date: values.date,
                                file: files.at(0),
                            },
                            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        )
                    }
                    submitButtonText={translate('billPay.createBill')}
                    enabledWhenOffline
                >
                    <View style={[styles.gap4, styles.pb5]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="domain"
                            label={translate('billPay.domain')}
                            defaultValue={session?.email?.split('@').at(1) ?? ''}
                            autoCapitalize="none"
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="vendorEmail"
                            label={translate('billPay.vendorEmail')}
                            inputMode="email"
                            autoCapitalize="none"
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="merchant"
                            label={translate('billPay.invoiceDetails')}
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="amount"
                            label={translate('iou.amount')}
                            inputMode="decimal"
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="currency"
                            label={translate('common.currency')}
                            defaultValue={CONST.CURRENCY.USD}
                            autoCapitalize="characters"
                            maxLength={3}
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="date"
                            label={translate('common.date')}
                            defaultValue={DateUtils.extractDate(DateUtils.getDBTime())}
                            shouldSaveDraft
                        />
                        <UploadFile
                            buttonText={translate('billPay.attachPDF')}
                            uploadedFiles={files}
                            onUpload={setFiles}
                            onRemove={() => setFiles([])}
                            acceptedFileTypes={['pdf']}
                            fileLimit={1}
                            maxFileSize={CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE}
                            errorText={fileError}
                            setError={setFileError}
                        />
                    </View>
                </FormProvider>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default CreateBillPage;
