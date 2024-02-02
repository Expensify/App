/* eslint-disable @typescript-eslint/naming-convention */
import React, {useEffect, useState} from 'react';
import {Button, ScrollView, TextInput, View} from 'react-native';
import Text from '@components/Text';
import {createLog, sanitizeConsoleInput, setUpdateLogsFunction} from '@libs/Console';
import type {Log} from '@libs/Console';

function Console() {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const addLog = (newLog: Log) => {
            setLogs((prevLogs) => [...prevLogs, newLog]);
        };

        setUpdateLogsFunction(addLog);

        // Clean up when the component unmounts
        return () => setUpdateLogsFunction(null);
    }, []);

    const handleExecute = () => {
        const sanitizedInput = sanitizeConsoleInput(input);

        const customLogs = createLog(sanitizedInput);
        setLogs((prevLogs) => [...prevLogs, ...customLogs]);
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
