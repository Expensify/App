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
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesMaxExpenseAgeForm';

type RulesMaxExpenseAgePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AGE>;

function RulesMaxExpenseAgePage({
    route: {
        params: {policyID},
    },
}: RulesMaxExpenseAgePageProps) {
    const policy = usePolicy(policyID);

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const maxExpenseAgeDefaultValue = policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAge ? '' : `${policy?.maxExpenseAge}`;

    const [maxExpenseAgeValue, setMaxExpenseAgeValue] = useState(maxExpenseAgeDefaultValue);

    const onChangeMaxExpenseAge = useCallback((newValue: string) => {
        // replace all characters that are not spaces or digits
        let validMaxExpenseAge = newValue.replace(/[^0-9]/g, '');
        validMaxExpenseAge = validMaxExpenseAge.match(/(?:\d *){1,5}/)?.[0] ?? '';
        setMaxExpenseAgeValue(validMaxExpenseAge);
    }, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesMaxExpenseAgePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.maxExpenseAge')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.RULES_MAX_EXPENSE_AGE_FORM}
                    onSubmit={({maxExpenseAge}) => {
                        PolicyActions.setPolicyMaxExpenseAge(policyID, maxExpenseAge);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    submitButtonText={translate('workspace.editor.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.MAX_EXPENSE_AGE}
                            label={translate('workspace.rules.individualExpenseRules.maxAge')}
                            suffixCharacter={translate('common.days')}
                            suffixStyle={styles.colorMuted}
                            role={CONST.ROLE.PRESENTATION}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            value={maxExpenseAgeValue}
                            onChangeText={onChangeMaxExpenseAge}
                            ref={inputCallbackRef}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.individualExpenseRules.maxExpenseAgeDescription')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesMaxExpenseAgePage.displayName = 'RulesMaxExpenseAgePage';

export default RulesMaxExpenseAgePage;
