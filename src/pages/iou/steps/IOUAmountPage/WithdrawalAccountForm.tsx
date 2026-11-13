import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, ScrollView, Keyboard, StyleSheet} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Navigation from '@libs/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import {IOUAmountPageOnyxProps} from '@pages/iou/IOUAmountPage';
import FormHelpMessage from '@components/FormHelpMessage';
import CONST from '@src/CONST';

function WithdrawalAccountForm({route, accountManager, accountManagerFormID, accountManagerFormError}: IOUAmountPageOnyxProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [withdrawalID, setWithdrawalID] = useState('');
    const withdrawalIDInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const isWithdrawalAccountForm = route.params?.step === 'WithdrawalAccountForm';

    const handleApplyFilters = useCallback(() => {
        Keyboard.dismiss();
        // TODO: Implement actual filter application logic
        Navigation.goBack();
    }, []);

    // Scroll to the input when the keyboard is shown
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            // Give the keyboard time to appear before scrolling
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({animated: true});
            }, 100);
        });
        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('iou.withdrawalID')}
                onBackButtonPress={() => {
                    // Clear the withdrawal ID if it's empty and we're navigating back
                    if (isWithdrawalAccountForm && withdrawalID === '') {
                        // Potentially clear the withdrawal ID from Onyx if needed, depending on desired UX
                    }
                    Navigation.goBack();
                }}
            />
            <KeyboardAvoidingView
                style={[styles.flex1, styles.ph5, styles.pb5]}
                behavior={CONST.KEYBOARD_BEHAVIOR.PADDING}
            >
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.flexGrow1}>
                    <View style={styles.mv3}>
                        <Text style={[styles.textHeadline, styles.mb3]}>{translate('iou.enterWithdrawalID')}</Text>
                        <TextInput
                            ref={withdrawalIDInputRef}
                            label={translate('iou.withdrawalID')}
                            value={withdrawalID}
                            onChangeText={setWithdrawalID}
                            placeholder={translate('iou.withdrawalIDPlaceholder')}
                            keyboardType="default"
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={handleApplyFilters}
                        />
                        {accountManagerFormError && (
                            <FormHelpMessage message={accountManagerFormError} isError />
                        )}
                    </View>
                    <View style={styles.mtAuto}>
                        <Button
                            success
                            large
                            text={translate('common.apply')}
                            onPress={handleApplyFilters}
                            isDisabled={_.isEmpty(withdrawalID) || !!accountManagerFormError}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

WithdrawalAccountForm.displayName = 'WithdrawalAccountForm';

export default withOnyx({
    accountManager: {
        key: ONYXKEYS.ACCOUNT_MANAGER,
    },
    accountManagerFormID: {
        key: ONYXKEYS.ACCOUNT_MANAGER_FORM_ID,
    },
    accountManagerFormError: {
        key: ONYXKEYS.ACCOUNT_MANAGER_FORM_ERROR,
    },
})(WithdrawalAccountForm);
