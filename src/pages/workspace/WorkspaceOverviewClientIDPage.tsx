import React, {useCallback, useState} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateWorkspaceClientID} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceClientIDForm';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceOverviewClientIDPage({policy}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [clientID, setClientID] = useState(() => policy?.clientID ?? '');

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CLIENT_ID_FORM>) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            updateWorkspaceClientID(policy.id, values.clientID.trim(), policy.clientID);
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
                testID="WorkspaceOverviewClientIDPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.clientIDInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.ph5, styles.pb5]}>
                    <Text>{translate('workspace.common.clientIDInputHint')}</Text>
                </View>
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_CLIENT_ID_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    onSubmit={submit}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.CLIENT_ID}
                            label={translate('workspace.common.clientIDInputLabel')}
                            accessibilityLabel={translate('workspace.common.clientIDInputLabel')}
                            value={clientID}
                            spellCheck={false}
                            autoFocus
                            onChangeText={setClientID}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOverviewClientIDPage);
