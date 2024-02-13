import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType} from '@src/types/onyx';
import withPolicy from './withPolicy';

type WorkspaceProfileDescriptionOnyxProps = {
    policy: OnyxEntry<PolicyType>;
};
const parser = new ExpensiMark();

function WorkspaceProfileDescriptionPage({policy}: WorkspaceProfileDescriptionOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policyDescription = policy?.description ?? '';

    const submit = useCallback(
        ({workspaceDescription}: {workspaceDescription: string}) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            Policy.updateWorkspaceDescription(policy.id, policyDescription, workspaceDescription);
        },
        [policy, policyDescription],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceProfileDescriptionPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.description')}
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
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        defaultValue={parser.htmlToMarkdown(parser.replace(policyDescription))}
                        inputID="workspaceDescription"
                        label={translate('common.description')}
                        accessibilityLabel={translate('common.description')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={(el: AnimatedTextInputRef) => {
                            inputCallbackRef(el);
                            updateMultilineInputRange(el);
                        }}
                        autoGrowHeight
                        shouldSubmitForm
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

WorkspaceProfileDescriptionPage.displayName = 'WorkspaceProfileDescriptionPage';

export default withPolicy(WorkspaceProfileDescriptionPage);
