import type {TurboModule} from 'react-native';

// This entry is selected only by the emulator verification build, never by index.js.
import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports -- This isolated CI entry runs without application providers.
import {AppRegistry, Platform, ScrollView, StyleSheet, Text, TurboModuleRegistry, View} from 'react-native';
import RNFS from 'react-native-fs';

import {verificationRows, VERIFICATION_MARKER, VERIFICATION_ROW_COUNT, VERIFICATION_SCREENS} from '../scripts/pgo/emulatorFixture';

type BootSplashModule = TurboModule & {hide: () => Promise<void>};
const BootSplash = TurboModuleRegistry.getEnforcing<BootSplashModule>('BootSplash');
const startedAt = performance.now();

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, paddingTop: 64, backgroundColor: '#ffffff'},
    heading: {marginBottom: 12},
    row: {paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between'},
});

/** Exercise Hermes, native layout and file I/O using public synthetic data. */
function VerificationApp() {
    const [screen, setScreen] = useState(0);
    const scheduledScreen = useRef(-1);
    const rows = verificationRows(screen);

    useEffect(() => {
        BootSplash.hide();
    }, []);

    const advance = () => {
        if (screen <= scheduledScreen.current) {
            return;
        }
        scheduledScreen.current = screen;
        if (screen < VERIFICATION_SCREENS.length - 1) {
            setTimeout(() => setScreen((previous) => previous + 1), 500);
            return;
        }
        const directory = Platform.OS === 'android' ? RNFS.ExternalCachesDirectoryPath : RNFS.CachesDirectoryPath;
        const temporaryPath = `${directory}/${VERIFICATION_MARKER}.tmp`;
        RNFS.writeFile(
            temporaryPath,
            JSON.stringify({
                schema: 1,
                status: 'passed',
                workload: 'synthetic',
                screens: VERIFICATION_SCREENS.length,
                rows: VERIFICATION_ROW_COUNT,
                durationMs: performance.now() - startedAt,
            }),
            'utf8',
        ).then(() => RNFS.moveFile(temporaryPath, `${directory}/${VERIFICATION_MARKER}`));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>PGO CI verification</Text>
            <Text>{VERIFICATION_SCREENS.at(screen)}</Text>
            <ScrollView
                key={screen}
                onContentSizeChange={advance}
            >
                {rows.map((row) => (
                    <View
                        key={row.id}
                        style={styles.row}
                    >
                        <Text>{row.title}</Text>
                        <Text>{row.amount.toFixed(2)}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

AppRegistry.registerComponent('NewExpensify', () => VerificationApp);
