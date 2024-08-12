import React, {useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
};

const OPTIONS: Choice[] = [
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.TRANSLATION_KEY)},
];

function FeedbackSurvey({title, description, onSubmit, optionRowStyles, footerText, isNoteRequired, isLoading}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draft, draftResults] = useOnyx(ONYXKEYS.FORMS.FEEDBACK_SURVEY_FORM_DRAFT);
    const isLoadingDraft = isLoadingOnyxValue(draftResults);

    const [reason, setReason] = useState<FeedbackSurveyOptionID | undefined>(draft?.reason);
    const [note, setNote] = useState(draft?.note);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    useEffect(() => {
        if (isLoadingDraft) {
            return;
        }
        setNote(draft?.note);
        setReason(draft?.reason);
    // eslint-disable-next-line react-hooks/exhaustive-deps - only sync with Onyx after finish loading
    }, [isLoadingDraft]);

    const handleOptionSelect = (option: FeedbackSurveyOptionID) => {
        setShouldShowReasonError(false);
        setReason(option);
    };

    const handleSubmit = () => {
        if (!reason || (isNoteRequired && !note?.trim())) {
            setShouldShowReasonError(true);
            return;
        }

        onSubmit(reason, note?.trim());
    };

    const handleSetNote = (text: string) => {
        setNote(text);

        if (isNoteRequired && shouldShowReasonError) {
            setShouldShowReasonError(false);
        }
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.FEEDBACK_SURVEY_FORM}
            style={[styles.flexGrow1, styles.justifyContentBetween]}
            onSubmit={handleSubmit}
            submitButtonText={translate('common.submit')}
            isSubmitButtonVisible={false}
            enabledWhenOffline
        >
            <View style={styles.mh5}>
                <Text style={styles.textHeadline}>{title}</Text>
                <Text style={[styles.mt1, styles.mb3, styles.textNormalThemeText]}>{description}</Text>
                <InputWrapper
                    InputComponent={RadioButtons}
                    inputID={INPUT_IDS.REASON}
                    items={OPTIONS}
                    radioButtonStyle={[styles.mb7, optionRowStyles]}
                    value={reason as string}
                    onPress={handleOptionSelect as (value: string) => void}
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
                            value={note}
                        />
                    </>
                )}
            </View>
            <FixedFooter>
                {!!footerText && footerText}
                <FormAlertWithSubmitButton
                    isAlertVisible={shouldShowReasonError}
                    onSubmit={handleSubmit}
                    message={translate('common.error.pleaseCompleteForm')}
                    buttonText={translate('common.submit')}
                    enabledWhenOffline
                    containerStyles={styles.mt3}
                    isLoading={isLoading}
                />
            </FixedFooter>
        </FormProvider>
    );
}

FeedbackSurvey.displayName = 'FeedbackSurvey';

export default FeedbackSurvey;
