import {useFocusEffect} from '@react-navigation/native';
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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';

function WorkspaceCreateTaxValuePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.AMOUNT_SELECTOR.path);

    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM_DRAFT);
    const [currentValue, setCurrentValue] = useState(formDraft?.[INPUT_IDS.VALUE]);

    const save = () => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM, {[INPUT_IDS.VALUE]: currentValue});
        Navigation.goBack(backPath);
    };

    const inputRef = useRef<BaseTextInputRef | null>(null);
    const inputCallbackRef = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
    };
    useFocusEffect(() => {
        const focusTimeout = setTimeout(() => {
            inputRef.current?.focus();
        }, CONST.ANIMATED_TRANSITION);
        return () => clearTimeout(focusTimeout);
    });

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop={false}
            testID="WorkspaceCreateTaxValuePage"
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
                        ref={inputCallbackRef}
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

export default WorkspaceCreateTaxValuePage;
