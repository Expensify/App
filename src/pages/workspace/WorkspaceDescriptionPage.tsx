import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useCallback, useState} from 'react';
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
import Navigation from '@libs/Navigation/Navigation';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type WorkspaceDescriptionProps = WithPolicyProps;

function WorkspaceDescriptionPage({policy}: WorkspaceDescriptionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const parser = new ExpensiMark();
    const [description, setDescription] = useState(() => parser.htmlToMarkdown(policy?.description ?? ''));

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM>) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            Policy.updateDescription(policy.id, values.description.trim(), policy.description ?? '');
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [policy],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceDescriptionPage.displayName}
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
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID="description"
                        label={translate('workspace.editor.descriptionInputLabel')}
                        accessibilityLabel={translate('workspace.editor.descriptionInputLabel')}
                        value={description}
                        maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                        spellCheck={false}
                        autoFocus
                        onChangeText={setDescription}
                        autoGrowHeight
                        ref={(el: BaseTextInputRef | null): void => {
                            updateMultilineInputRange(el);
                        }}
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

WorkspaceDescriptionPage.displayName = 'WorkspaceDescriptionPage';

export default withPolicy(WorkspaceDescriptionPage);
