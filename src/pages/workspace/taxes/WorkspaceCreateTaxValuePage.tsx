import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';

import {useFocusEffect} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type WorkspaceCreateTaxValuePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_CREATE_VALUE>;

function WorkspaceCreateTaxValuePage({
    route: {
        params: {policyID},
    },
}: WorkspaceCreateTaxValuePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM_DRAFT);
    const [currentValue, setCurrentValue] = useState(formDraft?.[INPUT_IDS.VALUE]);

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID));

    const save = () => {
        const normalizedValue = currentValue !== undefined ? String(Number(currentValue)) : currentValue;
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM, {[INPUT_IDS.VALUE]: normalizedValue});
        Navigation.goBack(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID), {shouldSkipFocusRestore: true});
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
            testID="WorkspaceCreateTaxValuePage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.taxes.value')}
                onBackButtonPress={goBack}
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

export default WorkspaceCreateTaxValuePage;
