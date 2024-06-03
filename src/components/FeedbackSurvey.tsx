import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import type {TranslationPaths} from '@src/languages/types';
import Button from './Button';
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
    onSubmit: () => void;
};

const OPTION_KEYS = {
    IMPROVEMENT: 'improvement',
    EXPENSIVE: 'expensive',
    SUPPORT: 'support',
    CLOSING: 'closing',
};

type Option = {
    key: string;
    label: TranslationPaths;
};

const OPTIONS: Option[] = [
    {key: OPTION_KEYS.IMPROVEMENT, label: 'subscription.subscriptionSettings.functionalityNeeds'},
    {key: OPTION_KEYS.EXPENSIVE, label: 'subscription.subscriptionSettings.tooExpensive'},
    {key: OPTION_KEYS.SUPPORT, label: 'subscription.subscriptionSettings.inadequateCustomerSupport'},
    {key: OPTION_KEYS.CLOSING, label: 'subscription.subscriptionSettings.companyClosing'},
];

function FeedbackSurvey({title, description, onSubmit}: FeedbackSurveyProps) {
    const {translate} = useLocalize();
    const [reason, setReason] = useState<Option>();
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const handleOptionSelect = (option: Option) => {
        setReason(option);
    };

    return (
        <View>
            <Text>{title}</Text>
            <Text>{description}</Text>
            <SingleOptionSelector
                options={OPTIONS}
                selectedOptionKey={reason?.key}
                onSelectOption={handleOptionSelect}
            />
            <FixedFooter>
                <Button
                    onPress={onSubmit}
                    text={translate('common.submit')}
                />
                <FormAlertWithSubmitButton
                    isAlertVisible={shouldShowReasonError}
                    onSubmit={onSubmit}
                    message="reportCardLostOrDamaged.reasonError"
                    buttonText={translate('common.submit')}
                />
            </FixedFooter>
        </View>
    );
}

FeedbackSurvey.displayName = 'FeedbackSurvey';

export default FeedbackSurvey;
