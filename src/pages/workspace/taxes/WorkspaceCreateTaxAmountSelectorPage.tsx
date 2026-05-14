import {useFocusEffect, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- The input ref doesn't exist at the navigate() call site, so we can't use Navigation's afterTransition callback
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';

type FormConfig = {
    formID: OnyxFormKey;
    inputID: string;
};

const FORM_CONFIGS = {
    [SCREENS.WORKSPACE.TAX_CREATE]: {
        formID: ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM,
        inputID: INPUT_IDS.VALUE,
    },
} as const satisfies Record<string, FormConfig>;

const DEFAULT_CONFIG = FORM_CONFIGS[SCREENS.WORKSPACE.TAX_CREATE];

function WorkspaceCreateTaxAmountSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentRoute = useRoute();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.AMOUNT_SELECTOR.path);

    const entryScreenName = useNavigationState((state) => {
        const idx = state.routes.findIndex((r) => r.key === currentRoute.key);
        return idx > 0 ? state.routes.at(idx - 1)?.name : undefined;
    });
    const config = (entryScreenName ? (FORM_CONFIGS as Record<string, FormConfig>)[entryScreenName] : undefined) ?? DEFAULT_CONFIG;

    const [formDraft] = useOnyx(`${config.formID}Draft`);
    const [currentValue, setCurrentValue] = useState((formDraft as Record<string, string> | undefined)?.[config.inputID]);

    const save = () => {
        setDraftValues(config.formID, {[config.inputID]: currentValue});
        Navigation.goBack(backPath);
    };

    const inputRef = useRef<BaseTextInputRef | null>(null);
    useFocusEffect(() => {
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => inputRef.current?.focus(),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    });

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop={false}
            testID="WorkspaceCreateTaxAmountSelectorPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.taxes.value')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <ScrollView
                contentContainerStyle={[styles.flexGrow1, styles.mb5]}
                addBottomSafeAreaPadding
            >
                <View style={styles.flex1}>
                    <NumberWithSymbolForm
                        value={currentValue}
                        onInputChange={setCurrentValue}
                        ref={inputRef}
                        decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                        maxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
                        isSymbolPressable={false}
                        symbol="%"
                        symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                        autoGrowExtraSpace={variables.w80}
                        autoGrowMarginSide="left"
                        style={[styles.iouAmountTextInput, styles.textAlignRight]}
                        containerStyle={styles.iouAmountTextInputContainer}
                        touchableInputWrapperStyle={styles.heightUndefined}
                    />
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={save}
                        style={styles.mh5}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceCreateTaxAmountSelectorPage;
