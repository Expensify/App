import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {InputID} from '@src/types/form/ExpenseRuleForm';
import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';
import TextBase from './TextBase';

// Text-based field IDs that accept string input
type RuleTextBaseProps = {
    /** The key from text-based InputID */
    fieldID: InputID;

    /** The translation key for the page title and input label if labelKey is missing */
    titleKey: TranslationPaths;

    /** The translation key for the input label */
    labelKey?: TranslationPaths;

    /** Test ID for the screen wrapper */
    testID: string;

    /** The translation key for the hint text to display below the TextInput */
    hintKey?: TranslationPaths;

    /** Whether this field is required */
    isRequired?: boolean;

    /** The character limit for the input */
    characterLimit?: number;

    /** The rule identifier */
    hash?: string;
};

function RuleTextBase({fieldID, hintKey, isRequired, titleKey, labelKey, testID, hash, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES}: RuleTextBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        updateDraftRule(values);
        goBack();
    };

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID={testID}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(titleKey)}
                    onBackButtonPress={goBack}
                />
                <TextBase
                    fieldID={fieldID}
                    hint={hintKey ? translate(hintKey) : undefined}
                    isRequired={isRequired}
                    label={translate(labelKey ?? titleKey)}
                    onSubmit={onSave}
                    title={translate(titleKey)}
                    characterLimit={characterLimit}
                />
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default RuleTextBase;
