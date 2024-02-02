import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import {capturedLogs, createLog, sanitizeConsoleInput} from '@libs/Console';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function ConsolePage() {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<Log[]>(capturedLogs);
    const {translate} = useLocalize();

    useEffect(() => {
        setLogs((prevLogs) => [...prevLogs, ...capturedLogs]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capturedLogs]);

    const handleExecute = () => {
        const sanitizedInput = sanitizeConsoleInput(input);

        const customLogs = createLog(sanitizedInput);
        setLogs((prevLogs) => [...prevLogs, ...customLogs]);
        setInput('');
    };

    const saveLogs = () => {
        const logsWithParsedMessages = logs.map((log) => {
            try {
                const parsedMessage = JSON.parse(log.message);
                return {
                    ...log,
                    message: parsedMessage,
                };
            } catch {
                // If the message can't be parsed, just return the original log
                return log;
            }
        });

        localFileDownload('logs', JSON.stringify(logsWithParsedMessages, null, 2), 'File was saved in your Downloads folder.');
    };

    return (
        <ScreenWrapper testID={ConsolePage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.debugConsole')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            />
            <ScrollView bounces={false}>
                {logs.map((log, index) => (
                    <View
                        style={{borderColor: 'black', borderBottomWidth: 1}}
                        key={index}
                    >
                        <Text>{`${log.time.toLocaleTimeString()} [${log.level}] - ${log.message}`}</Text>
                    </View>
                ))}
            </ScrollView>
            <TextInput
                onChangeText={setInput}
                value={input}
                placeholder="Enter command"
                autoGrowHeight
                autoCorrect={false}
                accessibilityRole="text"
            />
        </ScreenWrapper>
    );
}

ConsolePage.displayName = 'ConsolePage';

export default ConsolePage;
