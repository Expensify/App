/** Page where an admin enters the Odoo URL and API key to connect, or to reconnect after the key stops working. */
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAuthenticationError} from '@libs/actions/connections';
import {connectToOdoo} from '@libs/actions/connections/Odoo';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/OdooCredentialsForm';

import React from 'react';
import {View} from 'react-native';

type OdooSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ODOO_SETUP>;

function OdooSetupPage({route}: OdooSetupPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policyID: string = route.params.policyID;
    // Reconnecting after the key stops working reopens this page, so only a working connection blocks it
    const [shouldBeBlocked = false] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => !!policy?.connections?.odoo?.config?.isConfigured && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.ODOO),
    });

    const confirmCredentials = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM>) => {
        connectToOdoo(policyID, values[INPUT_IDS.ODOO_URL].trim(), values[INPUT_IDS.API_KEY].trim());
        Navigation.dismissModal();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM> = {};

        for (const inputID of Object.values(INPUT_IDS)) {
            if (values[inputID]?.trim()) {
                continue;
            }
            addErrorMessage(errors, inputID, translate('common.error.fieldRequired'));
        }
        return errors;
    };

    return (
        <ConnectionLayout
            displayName="OdooSetupPage"
            headerTitle="workspace.odoo.odooSetup"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ODOO}
            shouldBeBlocked={shouldBeBlocked}
            shouldLoadForEmptyConnection
            shouldUseScrollView={false}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.ODOO_CREDENTIALS_FORM}
                validate={validate}
                onSubmit={confirmCredentials}
                submitButtonText={translate('common.confirm')}
                shouldValidateOnBlur
                shouldUseScrollView
                shouldValidateOnChange
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.odoo.enterCredentials')}</Text>
                <View style={[styles.renderHTML, styles.mb3]}>
                    <RenderHTML html={translate('workspace.odoo.howToFindAPIKey')} />
                </View>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('workspace.odoo.persistentKeyNote')}</Text>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.ODOO_URL}
                        ref={inputCallbackRef}
                        label={translate('workspace.odoo.odooURL')}
                        aria-label={translate('workspace.odoo.odooURL')}
                        hint={translate('workspace.odoo.odooURLHint')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.URL}
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.API_KEY}
                        label={translate('common.apiKey')}
                        aria-label={translate('common.apiKey')}
                        role={CONST.ROLE.PRESENTATION}
                        spellCheck={false}
                        autoCapitalize="none"
                        secureTextEntry
                        autoCorrect={false}
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                </View>
            </FormProvider>
        </ConnectionLayout>
    );
}

export default OdooSetupPage;
