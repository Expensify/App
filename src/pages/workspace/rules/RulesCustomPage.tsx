import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updateCustomRules} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesCustomForm';

type RulesCustomPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CUSTOM>;

function RulesCustomPage({
    route: {
        params: {policyID},
    },
}: RulesCustomPageProps) {
    const policy = usePolicy(policyID);

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [customRulesValue, setCustomRulesValue] = useState(() => Parser.htmlToMarkdown(policy?.customRules ?? ''));

    const onChangeCustomRules = useCallback((newValue: string) => {
        setCustomRulesValue(newValue);
    }, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
                testID={RulesCustomPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.customRules.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.RULES_CUSTOM_FORM}
                    onSubmit={({customRules}) => {
                        updateCustomRules(policyID, customRules);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    submitButtonText={translate('workspace.editor.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.CUSTOM_RULES}
                            label={translate('workspace.rules.customRules.subtitle')}
                            role={CONST.ROLE.PRESENTATION}
                            value={customRulesValue}
                            onChangeText={onChangeCustomRules}
                            ref={inputCallbackRef}
                            type="markdown"
                            autoGrowHeight
                            maxLength={CONST.DESCRIPTION_LIMIT}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.customRules.description')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesCustomPage.displayName = 'RulesCustomPage';

export default RulesCustomPage;
