import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import FixedFooter from './FixedFooter';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import SingleOptionSelector from './SingleOptionSelector';
import Text from './Text';

type FeedbackSurveyProps = {
    /** Title of the survey */
    title: string;
    /** Description of the survey */
    description: string;
    /** Callback to be called when the survey is submitted */
    onSubmit: (reason: Option) => void;
};

type Option = {
    key: string;
    label: TranslationPaths;
};

const OPTIONS: Option[] = [
    {key: COMMON_CONST.SUBSCRIPTION_CHANGE_REASONS.TOO_LIMITED.id, label: 'feedbackSurvey.functionalityNeeds'},
    {key: COMMON_CONST.SUBSCRIPTION_CHANGE_REASONS.TOO_EXPENSIVE.id, label: 'feedbackSurvey.tooExpensive'},
    {key: COMMON_CONST.SUBSCRIPTION_CHANGE_REASONS.INADEQUATE_SUPPORT.id, label: 'feedbackSurvey.inadequateCustomerSupport'},
    {key: COMMON_CONST.SUBSCRIPTION_CHANGE_REASONS.BUSINESS_CLOSING.id, label: 'feedbackSurvey.companyClosing'},
];

function FeedbackSurvey({title, description, onSubmit}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const selectCircleStyles = {borderColor: theme.border};
    const [reason, setReason] = useState<Option>();
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const handleOptionSelect = (option: Option) => {
        setShouldShowReasonError(false);
        setReason(option);
    };

    const handleSubmit = () => {
        if (!reason) {
            setShouldShowReasonError(true);
            return;
        }

        onSubmit(reason);
    };

    return (
        <View style={[styles.flexGrow1, styles.justifyContentBetween]}>
            <View style={[styles.mh5]}>
                <Text style={[styles.textHeadline]}>{title}</Text>
                <Text style={[styles.mt1, styles.mb3, styles.textNormalThemeText]}>{description}</Text>
                <SingleOptionSelector
                    options={OPTIONS}
                    optionRowStyles={[styles.mb7]}
                    selectCircleStyles={[selectCircleStyles]}
                    selectedOptionKey={reason?.key}
                    onSelectOption={handleOptionSelect}
                />
            </View>
            <FixedFooter>
                <FormAlertWithSubmitButton
                    isAlertVisible={shouldShowReasonError}
                    onSubmit={handleSubmit}
                    message="common.error.pleaseCompleteForm"
                    buttonText={translate('common.submit')}
                />
            </FixedFooter>
        </View>
    );
}

FeedbackSurvey.displayName = 'FeedbackSurvey';

export default FeedbackSurvey;
