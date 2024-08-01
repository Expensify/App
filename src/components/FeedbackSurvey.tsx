import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import FixedFooter from './FixedFooter';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import SingleOptionSelector from './SingleOptionSelector';
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

type Option = {
    key: FeedbackSurveyOptionID;
    label: TranslationPaths;
};

const OPTIONS: Option[] = [
    {key: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.ID, label: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_LIMITED.TRANSLATION_KEY},
    {key: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.ID, label: CONST.FEEDBACK_SURVEY_OPTIONS.TOO_EXPENSIVE.TRANSLATION_KEY},
    {key: CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.ID, label: CONST.FEEDBACK_SURVEY_OPTIONS.INADEQUATE_SUPPORT.TRANSLATION_KEY},
    {key: CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.ID, label: CONST.FEEDBACK_SURVEY_OPTIONS.BUSINESS_CLOSING.TRANSLATION_KEY},
];

function FeedbackSurvey({title, description, onSubmit, optionRowStyles, footerText, isNoteRequired, isLoading}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const selectCircleStyles: StyleProp<ViewStyle> = {borderColor: theme.border};
    const [reason, setReason] = useState<Option>();
    const [note, setNote] = useState('');
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const handleOptionSelect = (option: Option) => {
        setShouldShowReasonError(false);
        setReason(option);
    };

    const handleSubmit = () => {
        if (!reason || (isNoteRequired && !note.trim())) {
            setShouldShowReasonError(true);
            return;
        }

        onSubmit(reason.key, note.trim());
    };

    return (
        <View style={[styles.flexGrow1, styles.justifyContentBetween]}>
            <View style={styles.mh5}>
                <Text style={styles.textHeadline}>{title}</Text>
                <Text style={[styles.mt1, styles.mb3, styles.textNormalThemeText]}>{description}</Text>
                <SingleOptionSelector
                    options={OPTIONS}
                    optionRowStyles={[styles.mb7, optionRowStyles]}
                    selectCircleStyles={selectCircleStyles}
                    selectedOptionKey={reason?.key}
                    onSelectOption={handleOptionSelect}
                />
                {!!reason && (
                    <>
                        <Text style={[styles.textNormalThemeText, styles.mb3]}>{translate('feedbackSurvey.additionalInfoTitle')}</Text>
                        <TextInput
                            label={translate('feedbackSurvey.additionalInfoInputLabel')}
                            accessibilityLabel={translate('feedbackSurvey.additionalInfoInputLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            onChangeText={setNote}
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
        </View>
    );
}

FeedbackSurvey.displayName = 'FeedbackSurvey';

export default FeedbackSurvey;
