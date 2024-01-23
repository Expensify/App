import type {StackScreenProps} from '@react-navigation/stack';
import React, {useRef, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const RESPONSE_INPUT_ID = 'response';

type ExitSurveyResponsePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE>;

function ExitSurveyResponsePage({route}: ExitSurveyResponsePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {reason} = route.params;

    const [response, setResponse] = useState('');
    const responseInputRef = useRef(null);

    return (
        <ScreenWrapper testID={ExitSurveyResponsePage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {/* @ts-expect-error - FormProvider is not yet migrated to TS */}
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mt3, styles.mh5]}
                onSubmit={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM)}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <>
                    <Text style={styles.headerAnonymousFooter}>{translate(`exitSurvey.prompts.${reason}`)}</Text>
                    <InputWrapper
                        // @ts-expect-error – InputWrapper is not yet implemented in TS
                        InputComponent={TextInput}
                        inputID={RESPONSE_INPUT_ID}
                        label={translate(`exitSurvey.responsePlaceholder`)}
                        accessibilityLabel={translate(`exitSurvey.responsePlaceholder`)}
                        role={CONST.ROLE.PRESENTATION}
                        autoGrowHeight
                        maxLength={CONST.MAX_COMMENT_LENGTH}
                        ref={(el) => {
                            if (!el) {
                                return;
                            }
                            responseInputRef.current = el;
                            updateMultilineInputRange(el);
                        }}
                        value={response}
                        onChangeText={setResponse}
                        containerStyles={[styles.mt7, styles.autoGrowHeightMultilineInput]}
                        shouldSaveDraft
                    />
                </>
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default ExitSurveyResponsePage;
