import type {StackScreenProps} from '@react-navigation/stack';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
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
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxNameForm';

type NamePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_NAME>;

const parser = new ExpensiMark();

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

    const [name, setName] = useState(() => parser.htmlToMarkdown(currentTaxRate?.name ?? ''));

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID ?? '', taxID)), [policyID, taxID]);

    const submit = () => {
        renamePolicyTax(policyID, taxID, name);
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
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
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
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

NamePage.displayName = 'NamePage';

export default withPolicyAndFullscreenLoading(NamePage);
