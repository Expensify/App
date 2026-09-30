import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatVacationDelegateClearDate, getVacationDelegateClearAfter, getVacationDelegateClearDate, isVacationDelegateExpired} from '@libs/VacationDelegateUtils';
import {getDatePassedError} from '@libs/ValidationUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/VacationDelegateForm';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import React from 'react';
import {View} from 'react-native';

import type {FormInputErrors, FormOnyxValues} from './Form/types';

import DatePicker from './DatePicker';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import MenuItemAction from './MenuItem/presets/MenuItemAction';
import Text from './Text';
import VacationDelegateMenuItem from './VacationDelegateMenuItem';

type VacationDelegateFormProps = {
    /** The saved vacation delegate */
    vacationDelegate?: BaseVacationDelegate;

    /** Text shown above the form */
    description?: string;

    /** Opens the member selection screen. The picked member is stored in the form draft. */
    onChangeDelegate: () => void;

    /**
     * Saves the picked delegate
     * @param delegate - Login of the picked delegate
     * @param clearAfter - UTC datetime (yyyy-MM-dd HH:mm:ss) when the delegate clears, or undefined when it never clears
     */
    onSubmit: (delegate: string, clearAfter: string | undefined) => void;

    /** Removes the saved delegate */
    onRemove: () => void;

    /** Errors left by the last change to the saved delegate */
    errors?: Errors;

    /** Pending action of the last change to the saved delegate */
    pendingAction?: PendingAction;

    /** Dismisses `errors` */
    onCloseError?: () => void;
};

function VacationDelegateForm({vacationDelegate, description, onChangeDelegate, onSubmit, onRemove, errors, pendingAction, onCloseError}: VacationDelegateFormProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'Trashcan']);
    const {timezone} = useCurrentUserPersonalDetails();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT);

    const savedDelegate = isVacationDelegateExpired(vacationDelegate?.clearAfter) ? undefined : vacationDelegate?.delegate;
    const savedClearDate = savedDelegate ? getVacationDelegateClearDate(vacationDelegate?.clearAfter, timezone?.selected) : '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- an empty draft means no member was picked yet
    const delegate = draftValues?.[INPUT_IDS.DELEGATE] || savedDelegate;
    const formattedClearDate = formatVacationDelegateClearDate(draftValues?.[INPUT_IDS.CLEAR_AFTER_DATE] ?? savedClearDate, dateFnsLocale);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.VACATION_DELEGATE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.VACATION_DELEGATE_FORM> => {
        const formErrors: FormInputErrors<typeof ONYXKEYS.FORMS.VACATION_DELEGATE_FORM> = {};
        const dateError = values[INPUT_IDS.CLEAR_AFTER_DATE] ? getDatePassedError(translate, values[INPUT_IDS.CLEAR_AFTER_DATE]) : '';
        if (dateError) {
            formErrors[INPUT_IDS.CLEAR_AFTER_DATE] = dateError;
        }
        return formErrors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.VACATION_DELEGATE_FORM>) => {
        if (!delegate) {
            return;
        }

        onSubmit(delegate, getVacationDelegateClearAfter(values[INPUT_IDS.CLEAR_AFTER_DATE], timezone?.selected));
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.VACATION_DELEGATE_FORM}
            style={styles.flexGrow1}
            onSubmit={submit}
            validate={validate}
            submitButtonText={translate('common.save')}
            submitButtonStyles={styles.ph5}
            isSubmitDisabled={!delegate}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            {!!description && <Text style={[styles.mh5, styles.mb4]}>{description}</Text>}
            <VacationDelegateMenuItem
                vacationDelegate={{delegate}}
                label={translate('statusPage.vacationDelegate.chooseDelegate')}
                errors={errors}
                pendingAction={pendingAction}
                onCloseError={onCloseError}
                onPress={onChangeDelegate}
            />
            <View style={styles.ph5}>
                {/* The date can only be changed through the picker, so it keeps its icon and has no clear button, as in the mockups */}
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.CLEAR_AFTER_DATE}
                    label={translate('statusPage.vacationDelegate.clearAfterRecommended')}
                    defaultValue={savedClearDate}
                    minDate={new Date()}
                    icon={icons.CalendarSolid}
                    shouldForceActiveLabel={false}
                    shouldKeepCalendarIconWhenSelected
                    shouldHideClearButton
                    shouldSaveDraft
                />
                {/* The bottom margin matches the date input's own, so the remove button below sits the same distance from whichever is last */}
                {!!formattedClearDate && <Text style={[styles.textLabelSupporting, styles.mt2, styles.mb2]}>{translate('statusPage.vacationDelegate.willClearOn', formattedClearDate)}</Text>}
            </View>
            {!!savedDelegate && (
                <View style={styles.mt4}>
                    <MenuItemAction
                        title={translate('statusPage.vacationDelegate.removeDelegate')}
                        icon={icons.Trashcan}
                        onPress={onRemove}
                    />
                </View>
            )}
        </FormProvider>
    );
}

export default VacationDelegateForm;
