import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {addSubrate, getIOURequestPolicyID, removeSubrate, updateSubrate} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Subrate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SafeString from '@src/utils/SafeString';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepSubrateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SUBRATE> & {
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The report linked to the transaction */
    report: OnyxEntry<OnyxTypes.Report>;
};

type CommentSubrate = {
    key?: string;
    id: string;
    quantity: number;
    name: string;
    rate: number;
};

function getSubrateOptions(subRates: Subrate[], filledSubRates: CommentSubrate[], currentSubrateID?: string) {
    const filledSubRatesIDs = new Set(filledSubRates.map(({id}) => id));
    return subRates
        .filter(({id}) => currentSubrateID === id || !filledSubRatesIDs.has(id))
        .map(({id, name}) => ({
            value: id,
            label: name,
        }));
}

function IOURequestStepSubrate({
    route: {
        params: {action, backTo, iouType, pageIndex, reportID, transactionID},
    },
    transaction,
    report,
}: IOURequestStepSubrateProps) {
    const styles = useThemeStyles();
    const iouPolicyID = getIOURequestPolicyID(transaction, report);
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: iouPolicyID,
        action,
        iouType,
        isPerDiemRequest: true,
    });

    const customUnit = getPerDiemCustomUnit(policy);
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const {showConfirmModal} = useConfirmModal();
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const parsedIndex = parseInt(pageIndex, 10);
    const selectedDestination = transaction?.comment?.customUnit?.customUnitRateID;
    const allSubrates = transaction?.comment?.customUnit?.subRates ?? [];
    const allPossibleSubrates = selectedDestination ? (customUnit?.rates?.[selectedDestination]?.subRates ?? []) : [];
    const currentSubrate: CommentSubrate | undefined = allSubrates.at(parsedIndex) ?? undefined;
    const totalSubrateCount = allPossibleSubrates.length;
    const filledSubrateCount = allSubrates.length;
    const [subrateValue, setSubrateValue] = useState(currentSubrate?.id);
    const [quantityValue, setQuantityValue] = useState(() => (currentSubrate?.quantity ? String(currentSubrate.quantity) : undefined));

    const onChangeQuantity = useCallback((newValue: string) => {
        // replace all characters that are not spaces or digits
        let validQuantity = newValue.replaceAll(/[^0-9]/g, '');
        validQuantity = validQuantity.match(/(?:\d *){1,12}/)?.[0] ?? '';
        setQuantityValue(validQuantity);
    }, []);

    useEffect(() => {
        setSubrateValue(currentSubrate?.id);
        setQuantityValue(currentSubrate?.quantity ? String(currentSubrate.quantity) : undefined);
    }, [currentSubrate?.id, currentSubrate?.quantity]);

    // Hide the menu when there is only one subrate
    const shouldShowThreeDotsButton = filledSubrateCount > 1 && !isEmptyObject(currentSubrate);
    const shouldDisableEditor = isFocused && (Number.isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= totalSubrateCount || parsedIndex > filledSubrateCount);

    const validOptions = getSubrateOptions(allPossibleSubrates, allSubrates, currentSubrate?.id);

    const goBack = () => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_SUBRATE_FORM>): Partial<Record<string, TranslationPaths>> => {
        const errors = {};
        const quantityVal = SafeString(values[`quantity${pageIndex}`]);
        const subrateVal = values[`subrate${pageIndex}`] ?? '';
        const quantityInt = parseInt(quantityVal, 10);
        if (subrateVal === '' || !validOptions.some(({value}) => value === subrateVal)) {
            addErrorMessage(errors, `subrate${pageIndex}`, translate('common.error.fieldRequired'));
        }
        if (quantityVal === '') {
            addErrorMessage(errors, `quantity${pageIndex}`, translate('common.error.fieldRequired'));
        } else if (Number.isNaN(quantityInt)) {
            addErrorMessage(errors, `quantity${pageIndex}`, translate('iou.error.invalidQuantity'));
        } else if (quantityInt <= 0) {
            addErrorMessage(errors, `quantity${pageIndex}`, translate('iou.error.quantityGreaterThanZero'));
        }

        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_SUBRATE_FORM>) => {
        const quantityVal = SafeString(values[`quantity${pageIndex}`]);
        const subrateVal = SafeString(values[`subrate${pageIndex}`]);
        const quantityInt = parseInt(quantityVal, 10);
        const selectedSubrate = allPossibleSubrates.find(({id}) => id === subrateVal);
        const name = selectedSubrate?.name ?? '';
        const rate = selectedSubrate?.rate ?? 0;
        const transactionReportID = transaction?.participants?.at(0)?.reportID ?? transaction?.reportID ?? reportID;

        if (parsedIndex === filledSubrateCount) {
            addSubrate(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        } else {
            updateSubrate(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        }

        if (backTo) {
            goBack();
        } else {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, transactionReportID));
        }
    };

    const deleteSubrateAndHideModal = () => {
        removeSubrate(transaction, pageIndex);
        goBack();
    };

    const handleDeleteSubrate = async () => {
        const result = await showConfirmModal({
            title: translate('iou.deleteSubrate'),
            prompt: translate('iou.deleteSubrateConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            shouldEnableNewFocusManagement: true,
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        deleteSubrateAndHideModal();
    };

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={IOURequestStepSubrate.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton
                    title={backTo ? translate('common.subrate') : tabTitles[iouType]}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    shouldSetModalVisibility={false}
                    threeDotsMenuItems={[
                        {
                            icon: expensifyIcons.Trashcan,
                            text: translate('iou.deleteSubrate'),
                            onSelected: () => {
                                handleDeleteSubrate();
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ]}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_SUBRATE_FORM}
                    enabledWhenOffline
                    validate={validate}
                    onSubmit={submit}
                    shouldValidateOnChange
                    shouldValidateOnBlur={false}
                    submitButtonText={translate('common.save')}
                >
                    <Text style={[styles.pv3]}>{translate('iou.subrateSelection')}</Text>
                    <View style={[styles.mhn5]}>
                        <InputWrapperWithRef
                            InputComponent={ValuePicker}
                            inputID={`subrate${pageIndex}`}
                            label={translate('common.subrate')}
                            value={subrateValue}
                            defaultValue={currentSubrate?.id}
                            items={validOptions}
                            onValueChange={(value) => {
                                setSubrateValue(value as string);
                                // eslint-disable-next-line @typescript-eslint/no-deprecated
                                InteractionManager.runAfterInteractions(() => {
                                    textInputRef.current?.focus();
                                });
                            }}
                        />
                    </View>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        inputID={`quantity${pageIndex}`}
                        ref={textInputRef}
                        containerStyles={[styles.mt4]}
                        label={translate('iou.quantity')}
                        value={quantityValue}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        maxLength={CONST.IOU.QUANTITY_MAX_LENGTH}
                        onChangeText={onChangeQuantity}
                    />
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

IOURequestStepSubrate.displayName = 'IOURequestStepSubrate';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepSubrate));
