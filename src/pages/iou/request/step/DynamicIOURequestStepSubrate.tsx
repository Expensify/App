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
import ValueFieldDropdown from '@components/ValuePicker/ValueFieldDropdown';

import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useThemeStyles from '@hooks/useThemeStyles';

import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';

import {getIOURequestPolicyID} from '@userActions/IOU/MoneyRequest';
import {addSubrate, removeSubrate, updateSubrate} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Subrate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useNavigation} from '@react-navigation/native';
import {SafeString} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepSubrateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SUBRATE_EDIT> & {
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

function DynamicIOURequestStepSubrate({
    route: {
        params: {action, iouType, pageIndex},
    },
    transaction,
    report,
}: DynamicIOURequestStepSubrateProps) {
    const editBackPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SUBRATE_EDIT.path);
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
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan']);
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

    const onChangeQuantity = (newValue: string) => {
        // replace all characters that are not spaces or digits
        let validQuantity = newValue.replaceAll(/[^0-9]/g, '');
        validQuantity = validQuantity.match(/(?:\d *){1,12}/)?.[0] ?? '';
        setQuantityValue(validQuantity);
    };

    useEffect(() => {
        setSubrateValue(currentSubrate?.id);
        setQuantityValue(currentSubrate?.quantity ? String(currentSubrate.quantity) : undefined);
    }, [currentSubrate?.id, currentSubrate?.quantity]);

    // Hide the menu when there is only one subrate
    const shouldShowThreeDotsButton = filledSubrateCount > 1 && !isEmptyObject(currentSubrate);
    const shouldDisableEditor = isFocused && (Number.isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= totalSubrateCount || parsedIndex > filledSubrateCount);

    const validOptions = getSubrateOptions(allPossibleSubrates, allSubrates, currentSubrate?.id);

    const goBack = () => {
        Navigation.goBack(editBackPath);
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

        if (parsedIndex === filledSubrateCount) {
            addSubrate(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        } else {
            updateSubrate(transaction, pageIndex, quantityInt, subrateVal, name, rate);
        }

        goBack();
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
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        deleteSubrateAndHideModal();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={DynamicIOURequestStepSubrate.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton
                    title={translate('common.subrate')}
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
                    {/* The subrate row carries the form's own horizontal margin, which the page margin already provides. */}
                    <View style={[styles.mhn4]}>
                        <InputWrapperWithRef
                            InputComponent={ValueFieldDropdown}
                            inputID={`subrate${pageIndex}`}
                            label={translate('common.subrate')}
                            value={subrateValue}
                            defaultValue={currentSubrate?.id}
                            items={validOptions}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SUBRATE_FIELD}
                            onValueChange={(value) => {
                                setSubrateValue(value as string);

                                // Focus the Quantity input after the subrate list closes.
                                // TransitionTracker's callback fires synchronously inside Reanimated's animation
                                // callback (outside React's event handler), so React flushes state updates async
                                // via MessageChannel. requestIdleCallback ensures focus() runs after React commits
                                // and the modal's FocusTrap (web) deactivates, preventing focus from being stolen.
                                TransitionTracker.runAfterTransitions({
                                    callback: () => {
                                        requestIdleCallback(() => textInputRef.current?.focus());
                                    },
                                    waitForUpcomingTransition: true,
                                });
                            }}
                        />
                    </View>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        inputID={`quantity${pageIndex}`}
                        ref={textInputRef}
                        containerStyles={[styles.mt2]}
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

DynamicIOURequestStepSubrate.displayName = 'DynamicIOURequestStepSubrate';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepSubrate));
