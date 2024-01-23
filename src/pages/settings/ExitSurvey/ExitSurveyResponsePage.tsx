import type {StackScreenProps} from '@react-navigation/stack';
import React, {useRef, useState} from 'react';
import {useSafeAreaFrame} from 'react-native-safe-area-context';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const RESPONSE_INPUT_ID = 'response';

type ExitSurveyResponsePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE>;

function ExitSurveyResponsePage({route}: ExitSurveyResponsePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {height: safeAreaFrameHeight} = useSafeAreaFrame();

    const {reason} = route.params;

    const [response, setResponse] = useState('');
    const responseInputRef = useRef(null);

    const formTopPaddingStyle = styles.mt3;
    const textStyle = styles.headerAnonymousFooter;
    const baseResponseInputContainerStyle = styles.mt7;
    const responseInputMaxHeight = Math.floor(
        // approximation for window height minus safe areas
        safeAreaFrameHeight -
            // Minus the height of HeaderWithBackButton
            variables.contentHeaderHeight -
            // Minus the top padding on the form
            formTopPaddingStyle.marginTop -
            // Minus the height of the text component
            textStyle.lineHeight -
            // Minus the response input margins (multiplied by 2 to create the effect of margins on top and bottom).
            // marginBottom does not work in this case because the TextInput is in a ScrollView and will push the button beneath it out of view,
            // so it's maxHeight is what dictates space between it and the button.
            baseResponseInputContainerStyle.marginTop * 2 -
            // Minus the approximate size of a default button
            variables.componentSizeLarge,
    );
    return (
        <ScreenWrapper testID={ExitSurveyResponsePage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {/* @ts-expect-error - FormProvider is not yet migrated to TS */}
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mh5, formTopPaddingStyle]}
                onSubmit={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM)}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <>
                    <Text style={textStyle}>{translate(`exitSurvey.prompts.${reason}`)}</Text>
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
                        containerStyles={[baseResponseInputContainerStyle, StyleUtils.getMaximumHeight(responseInputMaxHeight)]}
                        shouldSaveDraft
                    />
                </>
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default ExitSurveyResponsePage;
