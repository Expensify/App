import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIsSentryDebugEnabled, setSentryDebugHighlightedSpanOps} from '@libs/actions/SentryDebug';
import ONYXKEYS from '@src/ONYXKEYS';
import Switch from './Switch';
import TestToolRow from './TestToolRow';
import Text from './Text';
import TextInput from './TextInput';

type SentryDebugToggleProps = {
    isEnabled: boolean;
};

function SentryDebugToggle({isEnabled}: SentryDebugToggleProps) {
    const {translate} = useLocalize();

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.sentryDebugDescription')}>
            <Switch
                accessibilityLabel={translate('initialSettingsPage.troubleshoot.sentryDebug')}
                isOn={isEnabled}
                onToggle={() => setIsSentryDebugEnabled(!isEnabled)}
            />
        </TestToolRow>
    );
}

function HighlightedSpanOpsInput() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [highlightedSpanOps] = useOnyx(ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS, {canBeMissing: true});
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
    const [isSentryDebugEnabled = false] = useOnyx(ONYXKEYS.IS_SENTRY_DEBUG_ENABLED, {canBeMissing: true});

    return (
        <>
            <Text
                style={[styles.textLabelSupporting, styles.mb4, styles.mt6]}
                numberOfLines={1}
            >
                {translate('initialSettingsPage.troubleshoot.sentryDebug')}
            </Text>

            <SentryDebugToggle isEnabled={isSentryDebugEnabled} />

            {isSentryDebugEnabled && <HighlightedSpanOpsInput />}
        </>
    );
}

export default SentryDebugToolMenu;
