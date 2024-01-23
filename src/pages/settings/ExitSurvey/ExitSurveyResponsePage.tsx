import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const RESPONSE_INPUT_ID = 'response';

type ExitSurveyResponsePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE>;

function ExitSurveyResponsePage({route}: ExitSurveyResponsePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {reason} = route.params;

    return (
        <ScreenWrapper testID={ExitSurveyResponsePage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mt3, styles.mh5]}
                onSubmit={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM)}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <Text style={styles.headerAnonymousFooter}>{translate(`exitSurvey.prompts.${reason}`)}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={RESPONSE_INPUT_ID}
                    containerStyles={styles.mt7}
                    placeholder={translate(`exitSurvey.responsePlaceholder`)}
                    multiline
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default ExitSurveyResponsePage;
