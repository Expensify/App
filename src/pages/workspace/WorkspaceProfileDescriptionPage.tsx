import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceProfileDescriptionPage({policy}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInputInitializedRef = useRef(false);
    const [description, setDescription] = useState(() =>
        Parser.htmlToMarkdown(
            // policy?.description can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            policy?.description ||
                Parser.replace(
                    translate('workspace.common.welcomeNote', {
                        workspaceName: policy?.name ?? '',
                    }),
                ),
        ),
    );

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM>) => {
            const errors = {};

            if (values.description.length > CONST.DESCRIPTION_LIMIT) {
                ErrorUtils.addErrorMessage(errors, 'description', translate('common.error.characterLimitExceedCounter', {length: values.description.length, limit: CONST.DESCRIPTION_LIMIT}));
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

            Policy.updateWorkspaceDescription(policy.id, values.description.trim(), policy.description ?? '');
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [policy],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policy?.id ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceProfileDescriptionPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.descriptionInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    onSubmit={submit}
                    validate={validate}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="description"
                            label={translate('workspace.editor.descriptionInputLabel')}
                            accessibilityLabel={translate('workspace.editor.descriptionInputLabel')}
                            maxAutoGrowHeight={variables.markdownTextInputAutoGrowMaxHeight}
                            value={description}
                            maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                            spellCheck={false}
                            autoFocus
                            onChangeText={setDescription}
                            autoGrowHeight
                            isMarkdownEnabled
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

WorkspaceProfileDescriptionPage.displayName = 'WorkspaceProfileDescriptionPage';

export default withPolicy(WorkspaceProfileDescriptionPage);
