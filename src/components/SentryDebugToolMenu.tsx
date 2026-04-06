import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIsSentryDebugEnabled, setIsSentrySendEnabled, setSentryDebugHighlightedSpanOps} from '@libs/actions/SentryDebug';
import ONYXKEYS from '@src/ONYXKEYS';
import Switch from './Switch';
import TestToolRow from './TestToolRow';
import Text from './Text';
import TextInput from './TextInput';

function SentrySendToggle({isEnabled}: {isEnabled: boolean}) {
    const {translate} = useLocalize();

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.sentrySendDescription')}>
            <Switch
                accessibilityLabel={translate('initialSettingsPage.troubleshoot.sentrySendDescription')}
                isOn={isEnabled}
                onToggle={() => setIsSentrySendEnabled(!isEnabled)}
            />
        </TestToolRow>
    );
}

function SentryDebugToggle({isEnabled}: {isEnabled: boolean}) {
    const {translate} = useLocalize();

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.sentryDebugDescription')}>
            <Switch
                accessibilityLabel={translate('initialSettingsPage.troubleshoot.sentryDebugDescription')}
                isOn={isEnabled}
                onToggle={() => setIsSentryDebugEnabled(!isEnabled)}
            />
        </TestToolRow>
    );
}

function HighlightedSpanOpsInput() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [highlightedSpanOps] = useOnyx(ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS);
    const [inputValue, setInputValue] = useState(() => highlightedSpanOps?.join(', '));

    const handleChange = (text: string) => {
        setInputValue(text);
        const spanOps = text
            .split(',')
            .map((op) => op.trim())
            .filter((op) => op.length > 0);
        setSentryDebugHighlightedSpanOps(spanOps);
    };

    return (
        <View style={styles.mt4}>
            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('initialSettingsPage.troubleshoot.sentryHighlightedSpanOps')}</Text>
            <TextInput
                autoCapitalize="none"
                accessibilityLabel={translate('initialSettingsPage.troubleshoot.sentryHighlightedSpanOps')}
                value={inputValue}
                onChangeText={handleChange}
                placeholder={translate('initialSettingsPage.troubleshoot.sentryHighlightedSpanOpsPlaceholder')}
            />
        </View>
    );
}

function SentryDebugToolMenu() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isSentrySendEnabled = false] = useOnyx(ONYXKEYS.IS_SENTRY_SEND_ENABLED);
    const [isSentryDebugEnabled = false] = useOnyx(ONYXKEYS.IS_SENTRY_DEBUG_ENABLED);

    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4, styles.mt6]}
                numberOfLines={1}
            >
                {translate('initialSettingsPage.troubleshoot.sentryDebug')}
            </Text>

            <SentrySendToggle isEnabled={isSentrySendEnabled} />
            <SentryDebugToggle isEnabled={isSentryDebugEnabled} />

            {isSentryDebugEnabled && <HighlightedSpanOpsInput />}
        </>
    );
}

export default SentryDebugToolMenu;
