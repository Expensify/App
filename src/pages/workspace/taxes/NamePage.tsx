import type {StackScreenProps} from '@react-navigation/stack';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {renamePolicyTax} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxNameForm';
import type * as OnyxTypes from '@src/types/onyx';

type NamePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_NAME>;

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

    const [name, setName] = useState(() => parser.htmlToMarkdown(currentTaxRate?.name ?? ''));

    const submit = () => {
        renamePolicyTax(policyID, taxID, name);
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_EDIT.getRoute(policyID ?? '', taxID));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NamePage.displayName}
        >
            <HeaderWithBackButton title={translate('common.name')} />

            <FormProvider
                formID={ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM}
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
                        inputID={INPUT_IDS.NAME}
                        label={translate('workspace.editor.nameInputLabel')}
                        accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                        value={name}
                        maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                        spellCheck={false}
                        autoFocus
                        onChangeText={setName}
                        autoGrowHeight
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NamePage.displayName = 'NamePage';

export default withPolicyAndFullscreenLoading(NamePage);
