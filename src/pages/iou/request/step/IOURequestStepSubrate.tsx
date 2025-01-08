import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type BaseModalProps from '@components/Modal/types';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Subrate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepWaypointProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SUBRATE> & {
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The report linked to the transaction */
    report: OnyxEntry<OnyxTypes.Report>;
};

type CommentSubrate = {
    key?: string;
    id: string;
    quantity: number;
    name: string;
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

function IOURequestStepWaypoint({
    route: {
        params: {action, backTo, iouType, pageIndex, reportID, transactionID},
    },
    transaction,
    report,
}: IOURequestStepWaypointProps) {
    const styles = useThemeStyles();
    const {canUseCombinedTrackSubmit} = usePermissions();
    const policy = usePolicy(report?.policyID);
    const customUnit = PolicyUtils.getPerDiemCustomUnit(policy);
    const {windowWidth} = useWindowDimensions();
    const [isDeleteStopModalOpen, setIsDeleteStopModalOpen] = useState(false);
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const parsedIndex = parseInt(pageIndex, 10);
    const selectedDestination = transaction?.comment?.customUnit?.customUnitRateID;
    const allSubrates = transaction?.comment?.customUnit?.subRates ?? [];
    const allPossibleSubrates = selectedDestination ? customUnit?.rates?.[selectedDestination]?.subRates ?? [] : [];
    const currentSubrate: CommentSubrate | undefined = allSubrates.at(parsedIndex) ?? undefined;
    const totalSubrateCount = allPossibleSubrates.length;
    const filledSubrateCount = allSubrates.length;

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
        const quantityValue = String(values[`quantity${pageIndex}`] ?? '');
        const subrateValue = values[`subrate${pageIndex}`] ?? '';
        const quantityInt = parseInt(quantityValue, 10);
        if (quantityValue === '') {
            ErrorUtils.addErrorMessage(errors, `quantity${pageIndex}`, translate('common.error.fieldRequired'));
        }
        if (subrateValue === '' || !validOptions.some(({value}) => value === subrateValue)) {
            ErrorUtils.addErrorMessage(errors, `subrate${pageIndex}`, translate('common.error.fieldRequired'));
        }
        if (Number.isNaN(quantityInt)) {
            ErrorUtils.addErrorMessage(errors, `quantity${pageIndex}`, translate('iou.error.invalidQuantity'));
        } else if (quantityInt <= 0) {
            ErrorUtils.addErrorMessage(errors, `quantity${pageIndex}`, translate('iou.error.quantityGreaterThanZero'));
        }

        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_SUBRATE_FORM>) => {
        const quantityValue = String(values[`quantity${pageIndex}`] ?? '');
        const subrateValue = String(values[`subrate${pageIndex}`] ?? '');
        const quantityInt = parseInt(quantityValue, 10);
        const selectedSubrate = allPossibleSubrates.find(({id}) => id === subrateValue);
        const name = selectedSubrate?.name ?? '';
        const rate = selectedSubrate?.rate ?? 0;

        if (parsedIndex === filledSubrateCount) {
            IOU.addSubrate(transaction, pageIndex, quantityInt, subrateValue, name, rate);
        } else {
            IOU.updateSubrate(transaction, pageIndex, quantityInt, subrateValue, name, rate);
        }

        if (backTo) {
            goBack();
        } else {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
        }
    };

    const deleteSubrateAndHideModal = () => {
        IOU.removeSubrate(transaction, pageIndex);
        setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        setIsDeleteStopModalOpen(false);
        goBack();
    };

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.submitExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.trackExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={IOURequestStepWaypoint.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton
                    title={backTo ? translate('common.subrate') : tabTitles[iouType]}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    shouldSetModalVisibility={false}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('iou.deleteSubrate'),
                            onSelected: () => {
                                setRestoreFocusType(undefined);
                                setIsDeleteStopModalOpen(true);
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ]}
                />
                <ConfirmModal
                    title={translate('iou.deleteSubrate')}
                    isVisible={isDeleteStopModalOpen}
                    onConfirm={deleteSubrateAndHideModal}
                    onCancel={() => setIsDeleteStopModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('iou.deleteSubrateConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    shouldEnableNewFocusManagement
                    danger
                    restoreFocusType={restoreFocusType}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_SUBRATE_FORM}
                    enabledWhenOffline
                    validate={validate}
                    onSubmit={submit}
                    shouldValidateOnChange={false}
                    shouldValidateOnBlur={false}
                    submitButtonText={translate('common.save')}
                >
                    <Text style={[styles.pv3]}>{translate('iou.subrateSelection')}</Text>
                    <View style={[styles.mhn5]}>
                        <InputWrapperWithRef
                            InputComponent={ValuePicker}
                            inputID={`subrate${pageIndex}`}
                            label={translate('common.subrate')}
                            defaultValue={currentSubrate?.id}
                            items={validOptions}
                        />
                    </View>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        inputID={`quantity${pageIndex}`}
                        ref={inputCallbackRef}
                        containerStyles={[styles.mt4]}
                        label={translate('iou.quantity')}
                        defaultValue={currentSubrate?.quantity ? String(currentSubrate.quantity) : undefined}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                    />
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

IOURequestStepWaypoint.displayName = 'IOURequestStepWaypoint';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepWaypoint));
