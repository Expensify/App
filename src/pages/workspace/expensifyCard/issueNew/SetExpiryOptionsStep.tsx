import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import type Policy from '@src/types/onyx/Policy';

type SetExpiryOptionsStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<Policy>;

    /** Start from step index */
    startStepIndex: number;

    /** Array of step names */
    stepNames: readonly string[];
};

function SetExpiryOptionsStep({policy, stepNames, startStepIndex}: SetExpiryOptionsStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});

    const [expirationToggle, setExpirationToggle] = useState(!!issueNewCard?.data?.validFrom);

    const isEditing = issueNewCard?.isEditing;

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
            data: expirationToggle ? {validFrom: values.validFrom, validThru: values.validThru} : undefined,
            isEditing: false,
            policyID,
        });
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        if (!expirationToggle) {
            return {};
        }
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> = {};
        if (!values[INPUT_IDS.VALID_FROM]) {
            errors[INPUT_IDS.VALID_FROM] = translate('workspace.card.issueNewCard.enterValidDate');
        }
        if (!values[INPUT_IDS.VALID_THRU]) {
            errors[INPUT_IDS.VALID_THRU] = translate('workspace.card.issueNewCard.enterValidDate');
        }

        if (values[INPUT_IDS.VALID_FROM] && values[INPUT_IDS.VALID_THRU]) {
            const startDate = new Date(values[INPUT_IDS.VALID_FROM]);
            const endDate = new Date(values[INPUT_IDS.VALID_THRU]);

            if (endDate < startDate) {
                errors[INPUT_IDS.VALID_THRU] = translate('iou.error.endDateBeforeStartDate');
            } else if (endDate.getTime() === startDate.getTime()) {
                errors[INPUT_IDS.VALID_THRU] = translate('iou.error.endDateSameAsStartDate');
            }
        }
        return errors;
    };

    return (
        <InteractiveStepWrapper
            wrapperID="SetExpiryOptions"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                onSubmit={submit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                validate={validate}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.card.issueNewCard.setExpiryOptions')}</Text>
                <ToggleSettingOptionRow
                    title={translate('workspace.card.issueNewCard.setExpiryDate')}
                    subtitle={!expirationToggle ? translate('workspace.card.issueNewCard.setExpiryDateDescription') : ''}
                    isActive={expirationToggle}
                    onToggle={setExpirationToggle}
                    switchAccessibilityLabel={translate('workspace.card.issueNewCard.setExpiryDate')}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={[styles.mv3]}
                />
                {expirationToggle && (
                    <>
                        <Text style={[styles.textLabelSupporting, styles.mb1, styles.mt2]}>{translate('workspace.card.issueNewCard.validFrom')}</Text>
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.VALID_FROM}
                            label={translate('workspace.card.issueNewCard.startDate')}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                            defaultValue={issueNewCard?.data?.validFrom}
                        />
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.VALID_THRU}
                            label={translate('workspace.card.issueNewCard.endDate')}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                            defaultValue={issueNewCard?.data?.validThru}
                        />
                    </>
                )}
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default SetExpiryOptionsStep;
