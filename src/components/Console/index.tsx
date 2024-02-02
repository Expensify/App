/* eslint-disable @typescript-eslint/naming-convention */
import React, {useEffect, useState} from 'react';
import {Button, ScrollView, TextInput, View} from 'react-native';
import Text from '@components/Text';

type Log = {
    time: Date;
    level: string;
    message: string;
};

type UpdateLogsFunction = (newLog: Log) => void;

let updateLogs: UpdateLogsFunction | null = null;
const capturedLogs: Log[] = [];
const originalConsoleLog = console.log;

console.log = (...args) => {
    const message = args
        .map((arg) => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2); // Indent for better readability
                } catch (e) {
                    return 'Unserializable Object';
                }
            }

            return String(arg);
        })
        .join(' ');
    const newLog = {time: new Date(), level: 'log', message};
    capturedLogs.push(newLog);
    if (updateLogs) {
        updateLogs(newLog);
    }
    originalConsoleLog.apply(console, args);
};

function setUpdateLogsFunction(func: UpdateLogsFunction | null) {
    updateLogs = func;
}

const charMap = {
    '\u2018': "'",
    '\u2019': "'",
    '\u201C': '"',
    '\u201D': '"',
    '\u201E': '"',
    '\u2026': '...',
};

const charsToSanitize = /[\u2018\u2019\u201C\u201D\u201E\u2026]/g;

function Console() {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<Log[]>(capturedLogs);

    useEffect(() => {
        const addLog = (newLog: Log) => {
            setLogs((prevLogs) => [...prevLogs, newLog]);
        };

        setUpdateLogsFunction(addLog);

        // Clean up when the component unmounts
        return () => setUpdateLogsFunction(null);
    }, []);

    const handleExecute = () => {
        const sanitizedInput = input.replace(charsToSanitize, (match) => charMap[match]);

        try {
            // @ts-expect-error Any code inside `sanitizedInput` that gets evaluated by `eval()` will be executed in the context of the current this value.
            // eslint-disable-next-line no-eval
            const result = eval.call(this, sanitizedInput);

            if (result !== undefined) {
                setLogs([...logs, {time: new Date(), level: 'info', message: `> ${input}`}, {time: new Date(), level: 'result', message: String(result)}]);
            } else {
                setLogs([...logs, {time: new Date(), level: 'info', message: `> ${input}`}]);
            }
        } catch (e) {
            setLogs([...logs, {time: new Date(), level: 'error', message: `> ${sanitizedInput}`}, {time: new Date(), level: 'error', message: `Error: ${e.message}`}]);
        }
        setInput('');
    };

    return (
        <View style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'black', height: 300}}>
            <TextInput
                onChangeText={setInput}
                value={input}
                placeholder="Enter command"
                autoCapitalize="none"
                autoCorrect={false}
                style={{color: 'white', fontFamily: 'monospace', padding: 8, borderWidth: 1, borderColor: 'white'}}
            />
            <Button
                title="Execute"
                onPress={handleExecute}
            />
            <ScrollView bounces={false}>
                {logs.map((log, index) => (
                    <Text
                        style={{fontFamily: 'monospace', color: 'white'}}
                        key={index}
                    >{`${log.time.toLocaleTimeString()} [${log.level}] - ${log.message}`}</Text>
                ))}
            </ScrollView>
        </View>
    );
}

export default Console;
