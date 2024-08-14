import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@libs/actions/FormActions';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/FeedbackSurveyForm';
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
};

const OPTIONS: Choice[] = [
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.TRANSLATION_KEY)},
    {value: CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.ID, label: translateLocal(CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.TRANSLATION_KEY)},
];

function FeedbackSurvey({title, description, onSubmit, optionRowStyles, footerText, isNoteRequired, isLoading, formID}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draft] = useOnyx(`${formID}Draft`);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const handleOptionSelect = () => {
        setShouldShowReasonError(false);
    };

    const handleSubmit = () => {
        if (!draft?.reason || (isNoteRequired && !draft?.note.trim())) {
            setShouldShowReasonError(true);
            return;
        }

        onSubmit(draft?.reason, draft?.note.trim());
        FormActions.clearDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM);
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
                    onPress={handleOptionSelect}
                    shouldSaveDraft
                />
                {!!draft?.reason && (
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
