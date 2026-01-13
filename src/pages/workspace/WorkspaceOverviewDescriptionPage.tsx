import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateWorkspaceDescription} from '@libs/actions/Policy/Policy';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceOverviewDescriptionPage({policy}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInputInitializedRef = useRef(false);
    const [description, setDescription] = useState(() => Parser.htmlToMarkdown(policy?.description ?? translate('workspace.common.defaultDescription')));

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM>) => {
            const errors = {};

            if (values.description.length > CONST.DESCRIPTION_LIMIT) {
                addErrorMessage(errors, 'description', translate('common.error.characterLimitExceedCounter', values.description.length, CONST.DESCRIPTION_LIMIT));
            }

            return errors;
        },
        [translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM>) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            updateWorkspaceDescription(policy.id, values.description.trim(), policy.description);
            Keyboard.dismiss();
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack());
        },
        [policy],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceOverviewDescriptionPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.descriptionInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.ph5, styles.pb5]}>
                    <Text>{translate('workspace.common.descriptionHint')}</Text>
                </View>
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    onSubmit={submit}
                    validate={validate}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="description"
                            label={translate('workspace.editor.descriptionInputLabel')}
                            accessibilityLabel={translate('workspace.editor.descriptionInputLabel')}
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            value={description}
                            spellCheck={false}
                            autoFocus
                            onChangeText={setDescription}
                            autoGrowHeight
                            type="markdown"
                            ref={(el: BaseTextInputRef | null): void => {
                                if (!isInputInitializedRef.current) {
                                    updateMultilineInputRange(el);
                                }
                                isInputInitializedRef.current = true;
                            }}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOverviewDescriptionPage);
