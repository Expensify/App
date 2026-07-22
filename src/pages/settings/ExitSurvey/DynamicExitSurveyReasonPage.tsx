import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {switchToOldDot} from '@libs/actions/ExitSurvey';
import {setErrorFields} from '@libs/actions/FormActions';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import StatusBar from '@libs/StatusBar';

import Navigation from '@navigation/Navigation';

import variables from '@styles/variables';

import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ExitSurveyResponseForm} from '@src/types/form/ExitSurveyResponseForm';
import INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback} from 'react';

import ExitSurveyOffline from './ExitSurveyOffline';

const draftResponseSelector = (value: OnyxEntry<ExitSurveyResponseForm>) => value?.[INPUT_IDS.RESPONSE];

function DynamicExitSurveyReasonPage() {
    const {isOffline} = useNetwork();
    const [draftResponse = ''] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, {selector: draftResponseSelector});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.EXIT_SURVEY_REASON.path);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const {inputCallbackRef} = useAutoFocusInput(true);

    // Device safe area top and bottom insets.
    // When the keyboard is shown, the bottom inset doesn't affect the height, so we take it out from the calculation.
    const {top: safeAreaInsetsTop} = useSafeAreaInsets();

    const goBackJustOnce = useCallback(() => {
        Log.info('[ExitSurvey] User chose Go back just once');
        Navigation.dismissModal();
        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
    }, []);

    const switchToClassic = useCallback(() => {
        Log.info('[ExitSurvey] User chose Switch to Classic');
        if (!draftResponse.trim()) {
            setErrorFields(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {
                [INPUT_IDS.RESPONSE]: getMicroSecondOnyxErrorWithMessage(translate('common.error.fieldRequired')),
            });
            return;
        }
        if (draftResponse.length > CONST.MAX_COMMENT_LENGTH) {
            setErrorFields(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {
                [INPUT_IDS.RESPONSE]: getMicroSecondOnyxErrorWithMessage(translate('common.error.characterLimitExceedCounter', draftResponse.length, CONST.MAX_COMMENT_LENGTH)),
            });
            return;
        }
        switchToOldDot(draftResponse);
        Navigation.dismissModal();
        openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
    }, [draftResponse, translate]);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, switchToClassic, {isActive: !isOffline});

    const formTopMarginsStyle = styles.mt3;
    const baseResponseInputContainerStyle = styles.mt3;
    const formMaxHeight = Math.floor(
        // windowHeight doesn't include status bar height in Android, so we need to add it here.
        // StatusBar.currentHeight is only available on Android.
        windowHeight +
            (StatusBar.currentHeight ?? 0) -
            keyboardHeight -
            safeAreaInsetsTop -
            // Minus the height of HeaderWithBackButton
            variables.contentHeaderHeight -
            // Minus the top margins on the form
            formTopMarginsStyle.marginTop,
    );

    return (
        <ScreenWrapper testID="DynamicExitSurveyReasonPage">
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mh5, formTopMarginsStyle, StyleUtils.getMaximumHeight(formMaxHeight)]}
                onSubmit={switchToClassic}
                submitButtonText=""
                isSubmitButtonVisible={false}
                shouldValidateOnBlur={false}
                validate={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM>) => {
                    const errors: Errors = {};
                    const response = values[INPUT_IDS.RESPONSE] ?? '';
                    if (!response.trim()) {
                        errors[INPUT_IDS.RESPONSE] = translate('common.error.fieldRequired');
                    } else if (response.length > CONST.MAX_COMMENT_LENGTH) {
                        errors[INPUT_IDS.RESPONSE] = translate('common.error.characterLimitExceedCounter', response.length, CONST.MAX_COMMENT_LENGTH);
                    }
                    return errors;
                }}
                shouldHideFixErrorsAlert
                shouldValidateOnChange
            >
                {isOffline && <ExitSurveyOffline />}
                {!isOffline && (
                    <>
                        <Text style={styles.headerAnonymousFooter}>{translate('exitSurvey.reasonPage.title')}</Text>
                        <Text style={styles.mt2}>{translate('exitSurvey.reasonPage.subtitle')}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.RESPONSE}
                            label={translate(`exitSurvey.responsePlaceholder`)}
                            accessibilityLabel={translate(`exitSurvey.responsePlaceholder`)}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            ref={inputCallbackRef}
                            containerStyles={[baseResponseInputContainerStyle]}
                            shouldSaveDraft
                        />
                    </>
                )}
            </FormProvider>
            <FixedFooter>
                <Button
                    large
                    text={translate('exitSurvey.goToExpensifyClassic')}
                    onPress={switchToClassic}
                    isDisabled={isOffline}
                />
                <Button
                    success
                    large
                    pressOnEnter
                    text={translate('exitSurvey.goBackJustOnce')}
                    onPress={goBackJustOnce}
                    isDisabled={isOffline}
                    style={styles.mt3}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default DynamicExitSurveyReasonPage;
