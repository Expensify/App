/** Manual bill intake. Attachments keep the typed invoice details and never enter SmartScan. */
import AmountForm from '@components/AmountForm';
import AttachmentPicker from '@components/AttachmentPicker';
import UserAvatar from '@components/Avatar/UserAvatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import DatePicker from '@components/DatePicker';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextWithMiddleEllipsis from '@components/TextWithMiddleEllipsis';

import useBillReceiverEmail from '@hooks/useBillReceiverEmail';
import useCanCreateBill from '@hooks/useCanCreateBill';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {createBill} from '@libs/actions/BillPay';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import {isValidDate, isValidEmailWithTLD} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import type {TupleToUnion} from 'type-fest';

import {sessionEmailAndAccountIDSelector} from '@selectors/Session';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

/** Bills only take a PDF of the invoice, which never enters SmartScan */
const BILL_ATTACHMENT_EXTENSION = 'pdf' satisfies TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>;

function CreateBillPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus', 'Paperclip', 'Close']);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const receiverEmail = useBillReceiverEmail();
    const canCreateBill = useCanCreateBill();
    const receiverDetails = usePersonalDetailByLogin(receiverEmail);
    const [currency, setCurrency] = useState<string>(CONST.CURRENCY.USD);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const [file, setFile] = useState<FileObject>();
    const [fileError, setFileError] = useState('');

    const attachFile = (files: FileObject[]) => {
        const pickedFile = files.at(0);
        if (!pickedFile) {
            return;
        }
        if (splitExtensionFromFileName(pickedFile.name ?? '').fileExtension.toLowerCase() !== BILL_ATTACHMENT_EXTENSION) {
            setFileError(translate('attachmentPicker.notAllowedExtension'));
            return;
        }
        if ((pickedFile.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE) {
            setFileError(translate('attachmentPicker.sizeExceededWithLimit', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / (1024 * 1024)));
            return;
        }
        setFile(pickedFile);
        setFileError('');
    };

    const selectCurrency = (item: CurrencyListItem) => {
        setCurrency(item.currencyCode);
        setIsCurrencyPickerVisible(false);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_BILL_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.CREATE_BILL_FORM> = {};
        if (!isValidEmailWithTLD(values.vendorEmail.trim())) {
            errors.vendorEmail = translate('common.error.email');
        }
        if (!values.merchant.trim()) {
            errors.merchant = translate('common.error.fieldRequired');
        }
        const amount = Number(values.amount);
        if (!Number.isFinite(amount) || convertToBackendAmount(amount) <= 0) {
            errors.amount = translate('common.error.invalidAmount');
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
            <FullPageNotFoundView shouldShow={!canCreateBill}>
                <HeaderWithBackButtonAndTitle
                    title={translate('billPay.createBill')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_BILL_FORM}
                    style={[styles.flexGrow1, styles.ph5]}
                    validate={validate}
                    onSubmit={(values) =>
                        createBill(
                            {
                                // Classic sends bills to the bill intake of the user's own domain, whose technical contact receives them.
                                domain: Str.extractEmailDomain(session?.email ?? '').toLowerCase(),
                                vendorEmail: values.vendorEmail.trim().toLowerCase(),
                                merchant: values.merchant.trim(),
                                amount: convertToBackendAmount(Number(values.amount)),
                                currency,
                                date: values.date,
                                file,
                            },
                            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        )
                    }
                    submitButtonText={translate('billPay.createBill')}
                    enabledWhenOffline
                >
                    <View style={[styles.gap4, styles.pb5]}>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('common.to')}</Text>
                            <MenuItem.Root>
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={receiverDetails?.avatar ?? getDefaultAvatarURL({accountID: receiverDetails?.accountID, accountEmail: receiverEmail})}
                                            accountID={receiverDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                                        />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>{receiverDetails?.displayName ?? receiverEmail ?? ''}</MenuItem.Title>
                                        <MenuItem.Description>{receiverEmail ?? ''}</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsStart, styles.gap3]}>
                            <View style={styles.flex1}>
                                <InputWrapper
                                    InputComponent={AmountForm}
                                    inputID="amount"
                                    valueType="string"
                                    label={translate('iou.amount')}
                                    currency={currency}
                                    displayAsTextInput
                                    shouldShowCurrencyButton
                                    isCurrencyPressable
                                    currencyButtonAccessibilityLabel={`${translate('common.currency')}, ${currency}`}
                                    onCurrencyButtonPress={() => setIsCurrencyPickerVisible(true)}
                                    shouldSaveDraft
                                />
                            </View>
                            <AttachmentPicker acceptedFileTypes={[BILL_ATTACHMENT_EXTENSION]}>
                                {({openPicker}) => (
                                    <Button
                                        size={CONST.BUTTON_SIZE.LARGE}
                                        accessibilityLabel={translate('billPay.attachPDF')}
                                        onPress={() => openPicker({onPicked: attachFile})}
                                    >
                                        <Button.Icon src={icons.ReceiptPlus} />
                                    </Button>
                                )}
                            </AttachmentPicker>
                        </View>
                        {!!file && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.border, styles.p3]}>
                                <Icon
                                    src={icons.Paperclip}
                                    fill={theme.icon}
                                    size={CONST.ICON_SIZE.MEDIUM}
                                />
                                <TextWithMiddleEllipsis
                                    text={file.name ?? ''}
                                    style={[styles.ml2, styles.mr2, styles.flex1]}
                                    textStyle={styles.textBold}
                                />
                                <PressableWithFeedback
                                    onPress={() => setFile(undefined)}
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={`${translate('common.remove')}, ${file.name ?? ''}`}
                                    sentryLabel={CONST.SENTRY_LABEL.UPLOAD_FILE.REMOVE_BUTTON}
                                >
                                    <Icon
                                        src={icons.Close}
                                        fill={theme.icon}
                                        size={CONST.ICON_SIZE.MEDIUM}
                                    />
                                </PressableWithFeedback>
                            </View>
                        )}
                        {!!fileError && (
                            <DotIndicatorMessage
                                type="error"
                                messages={{fileError}}
                            />
                        )}
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
                            label={translate('common.merchant')}
                            shouldSaveDraft
                        />
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID="date"
                            valueType="string"
                            label={translate('common.date')}
                            defaultValue={format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                            shouldSaveDraft
                        />
                    </View>
                </FormProvider>
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                    isVisible={isCurrencyPickerVisible}
                    onClose={() => setIsCurrencyPickerVisible(false)}
                    onModalHide={() => setIsCurrencyPickerVisible(false)}
                    shouldEnableNewFocusManagement
                    shouldUseModalPaddingStyle={false}
                    shouldHandleNavigationBack
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <ScreenWrapper
                        style={[styles.pb0]}
                        testID="CreateBillCurrencyPicker"
                        shouldEnableMaxHeight
                        enableEdgeToEdgeBottomSafeAreaPadding
                    >
                        <HeaderWithBackButtonAndTitle
                            title={translate('common.currency')}
                            onBackButtonPress={() => setIsCurrencyPickerVisible(false)}
                        />
                        <CurrencySelectionList
                            initiallySelectedCurrencyCode={currency}
                            onSelect={selectCurrency}
                            searchInputLabel={translate('common.search')}
                            addBottomSafeAreaPadding
                        />
                    </ScreenWrapper>
                </Modal>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default CreateBillPage;
