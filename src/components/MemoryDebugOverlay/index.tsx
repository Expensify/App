import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {StyleSheet, View} from 'react-native';
import type {ViewStyle} from 'react-native';
import Text from '@components/Text';
import getMemoryInfo from '@libs/telemetry/getMemoryInfo';
import type {MemoryInfo} from '@libs/telemetry/getMemoryInfo/types';

const POLL_INTERVAL_MS = 1000;
const BYTES_PER_MB = 1024 * 1024;
const WARNING_PCT = 60;
const CRITICAL_PCT = 85;
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const styles = StyleSheet.create({
    container: {
        position: 'fixed',
        top: 80,
        right: 8,
        zIndex: 2147483647,
        backgroundColor: '#1a1a1a',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 2,
        maxWidth: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        userSelect: 'none',
    } as ViewStyle,
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    title: {
        color: '#ffffff',
        fontFamily: MONO_FONT,
        fontSize: 12,
        fontWeight: '700',
    },
    percent: {
        marginLeft: 'auto',
        fontFamily: MONO_FONT,
        fontSize: 12,
        fontWeight: '600',
    },
    bytesLine: {
        color: '#ffffff',
        fontFamily: MONO_FONT,
        fontSize: 12,
        opacity: 0.85,
        marginTop: 2,
    },
    criticalBlock: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    criticalTitle: {
        color: '#ffd43b',
        fontFamily: MONO_FONT,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    criticalBody: {
        color: '#ffffff',
        fontFamily: MONO_FONT,
        fontSize: 11,
        opacity: 0.9,
    },
    piiWarning: {
        color: '#ffffff',
        fontFamily: MONO_FONT,
        fontSize: 10,
        fontStyle: 'italic',
        opacity: 0.7,
        marginTop: 6,
    },
});

function getStatusColor(usagePct: number): string {
    if (usagePct >= CRITICAL_PCT) {
        return '#c92a2a';
    }
    if (usagePct >= WARNING_PCT) {
        return '#f08c00';
    }
    return '#2f9e44';
}

function MemoryDebugOverlay() {
    const [info, setInfo] = useState<MemoryInfo | null>(null);

    useEffect(() => {
        let cancelled = false;

        const tick = () => {
            getMemoryInfo()
                .then((next) => {
                    if (cancelled) {
                        return;
                    }
                    setInfo(next);
                })
                .catch(() => {
                    // performance.memory is unavailable in Firefox/Safari
                });
        };

        tick();
        const id = setInterval(tick, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    if (typeof document === 'undefined') {
        return null;
    }

    if (!info || info.usedMemoryBytes === null || info.maxMemoryBytes === null || info.maxMemoryBytes === 0) {
        return null;
    }

    const usagePct = parseFloat(((info.usedMemoryBytes / info.maxMemoryBytes) * 100).toFixed(1));
    const limitMB = Math.round(info.maxMemoryBytes / BYTES_PER_MB);
    const usedMB = info.usedMemoryMB ?? 0;
    const color = getStatusColor(usagePct);
    const shouldShowSnapshotReminder = usagePct >= WARNING_PCT;

    const overlay = (
        <View style={[styles.container, {borderColor: color}]}>
            <View style={styles.headerRow}>
                <View style={[styles.statusDot, {backgroundColor: color}]} />
                <Text style={styles.title}>JS Heap</Text>
                <Text style={[styles.percent, {color}]}>{usagePct}%</Text>
            </View>
            <Text style={styles.bytesLine}>
                {usedMB}MB / {limitMB}MB
            </Text>
            {shouldShowSnapshotReminder && (
                <View style={styles.criticalBlock}>
                    <Text style={styles.criticalTitle}>Take a heap snapshot now</Text>
                    <Text style={styles.criticalBody}>DevTools → Memory → Heap snapshot → Save → send privately.</Text>
                    <Text style={styles.piiWarning}>Contains messages, URLs, tokens. Share only over an encrypted channel.</Text>
                </View>
            )}
        </View>
    );

    return createPortal(overlay, document.body);
}

MemoryDebugOverlay.displayName = 'MemoryDebugOverlay';

export default MemoryDebugOverlay;
