import React, {useEffect, useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/FeedbackSurveyForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import FixedFooter from './FixedFooter';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import RadioButtons from './RadioButtons';
import type {Choice} from './RadioButtons';
import Text from './Text';
import TextInput from './TextInput';

type FeedbackSurveyProps = {
    /** A unique Onyx key identifying the form */
    formID: typeof ONYXKEYS.FORMS.DISABLE_AUTO_RENEW_SURVEY_FORM | typeof ONYXKEYS.FORMS.REQUEST_EARLY_CANCELLATION_FORM;

    /** Title of the survey */
    title: string;

    /** Description of the survey */
    description: string;

    /** Callback to be called when the survey is submitted */
    onSubmit: (reason: FeedbackSurveyOptionID, note?: string) => void;

    /** Styles for the option row element */
    optionRowStyles?: StyleProp<ViewStyle>;

    /** Optional text to render over the submit button */
    footerText?: React.ReactNode;

    /** Indicates whether note field is required  */
    isNoteRequired?: boolean;

    /** Indicates whether a loading indicator should be shown */
    isLoading?: boolean;

    /** Should the submit button be enabled when offline */
    enabledWhenOffline?: boolean;
};

function FeedbackSurvey({title, description, onSubmit, optionRowStyles, footerText, isNoteRequired, isLoading, formID, enabledWhenOffline = true}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draft, draftResults] = useOnyx(`${formID}Draft`, {canBeMissing: true});
    const [reason, setReason] = useState<string | undefined>(draft?.reason);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const isLoadingDraft = isLoadingOnyxValue(draftResults);

    const options = useMemo<Choice[]>(
        () => [
            {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.ID, label: translate(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.TRANSLATION_KEY)},
            {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.ID, label: translate(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.TRANSLATION_KEY)},
            {value: CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.ID, label: translate(CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.TRANSLATION_KEY)},
            {value: CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.ID, label: translate(CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.TRANSLATION_KEY)},
        ],
        [translate],
    );

    useEffect(() => {
        if (!draft?.reason || isLoadingDraft) {
            return;
        }

        setReason(draft.reason);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync with draft data when it is loaded
    }, [isLoadingDraft]);

    const handleOptionSelect = (value: string) => {
        setReason(value);
        setShouldShowReasonError(false);
    };

    const handleSubmit = () => {
        if (!draft?.reason || (isNoteRequired && !draft.note?.trim())) {
            setShouldShowReasonError(true);
            return;
        }

        onSubmit(draft.reason, draft.note?.trim());
        clearDraftValues(formID);
    };

    const handleSetNote = () => {
        if (!isNoteRequired || !shouldShowReasonError) {
            return;
        }

        setShouldShowReasonError(false);
    };

    return (
        <FormProvider
            formID={formID}
            style={[styles.flexGrow1, styles.justifyContentBetween]}
            onSubmit={handleSubmit}
            submitButtonText={translate('common.submit')}
            isSubmitButtonVisible={false}
            enabledWhenOffline={enabledWhenOffline}
        >
            <View style={styles.mh5}>
                <Text style={styles.textHeadline}>{title}</Text>
                <Text style={[styles.mt1, styles.mb3, styles.textNormalThemeText]}>{description}</Text>
                <InputWrapper
                    InputComponent={RadioButtons}
                    inputID={INPUT_IDS.REASON}
                    items={options}
                    radioButtonStyle={[styles.mb7, optionRowStyles]}
                    onPress={handleOptionSelect}
                    shouldSaveDraft
                />
                {!!reason && (
                    <>
                        <Text style={[styles.textNormalThemeText, styles.mb3]}>{translate('feedbackSurvey.additionalInfoTitle')}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.NOTE}
                            label={translate('feedbackSurvey.additionalInfoInputLabel')}
                            accessibilityLabel={translate('feedbackSurvey.additionalInfoInputLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            onChangeText={handleSetNote}
                            shouldSaveDraft
                        />
                    </>
                )}
            </View>
            <FixedFooter style={styles.pb0}>
                {!!footerText && footerText}
                <FormAlertWithSubmitButton
                    isAlertVisible={shouldShowReasonError}
                    onSubmit={handleSubmit}
                    message={translate('common.error.pleaseCompleteForm')}
                    buttonText={translate('common.submit')}
                    enabledWhenOffline={enabledWhenOffline}
                    containerStyles={styles.mt3}
                    isLoading={isLoading}
                />
            </FixedFooter>
        </FormProvider>
    );
}

export default FeedbackSurvey;
