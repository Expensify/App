import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';
import TextBase from './TextBase';

type RuleTextBaseProps<TFormID extends OnyxFormKey> = {
    /** The key from text-based InputID */
    fieldID: string;

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

    /** The form ID to read from Onyx */
    formID: TFormID;

    /** Callback when the form is saved */
    onSave: (values: FormOnyxValues<TFormID>) => void;

    /** Callback to go back */
    onBack: () => void;

    /** Optional hash for rule not found validation */
    hash?: string;
};

function RuleTextBase<TFormID extends OnyxFormKey>({
    fieldID,
    hintKey,
    isRequired,
    titleKey,
    labelKey,
    testID,
    characterLimit = CONST.MERCHANT_NAME_MAX_BYTES,
    formID,
    onSave,
    onBack,
    hash,
}: RuleTextBaseProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
                    onBackButtonPress={onBack}
                />
                <TextBase
                    fieldID={fieldID}
                    formID={formID}
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
