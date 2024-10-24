import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {renamePolicyTax, validateTaxName} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxNameForm';

type NamePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_NAME>;

function NamePage({
    route: {
        params: {policyID, taxID},
    },
    policy,
}: NamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentTaxRate = PolicyUtils.getTaxByID(policy, taxID);
    const {inputCallbackRef} = useAutoFocusInput();

    const [name, setName] = useState(() => Parser.htmlToMarkdown(currentTaxRate?.name ?? ''));

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID ?? '-1', taxID)), [policyID, taxID]);

    const submit = () => {
        const taxName = name.trim();
        // Do not call the API if the edited tax name is the same as the current tag name
        if (currentTaxRate?.name !== taxName) {
            renamePolicyTax(policyID, taxID, taxName);
        }
        goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM>) => {
            if (!policy) {
                return {};
            }
            if (values[INPUT_IDS.NAME] === currentTaxRate?.name) {
                return {};
            }
            return validateTaxName(policy, values);
        },
        [currentTaxRate?.name, policy],
    );

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={NamePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.name')}
                    onBackButtonPress={goBack}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    onSubmit={submit}
                    enabledWhenOffline
                    validate={validate}
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            value={name}
                            maxLength={CONST.TAX_RATES.NAME_MAX_LENGTH}
                            onChangeText={setName}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

NamePage.displayName = 'NamePage';

export default withPolicyAndFullscreenLoading(NamePage);
