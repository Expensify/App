import {describe, expect, it} from 'bun:test';

import {PROFILE_BROADCAST_ACTION, androidApplicationID, androidProfileReceiverComponent} from '@scripts/pgo/android';
import {percentageImprovement} from '@scripts/pgo/pgo';

describe('PGO tooling', () => {
    it('reads the bootstrapped release application ID', () => {
        // Given
        const buildGradle = `
            android {
                defaultConfig {
                    applicationId "com.chrispader.expensify.pgo"
                }
            }
        `;

        // When / Then
        expect(androidApplicationID(buildGradle)).toBe('com.chrispader.expensify.pgo');
    });

    it('uses an explicit application ID instead of the Gradle value', () => {
        // Given / When / Then
        expect(androidApplicationID('invalid build file', 'com.example.expensify.pgo')).toBe('com.example.expensify.pgo');
    });

    it('targets the bootstrapped package with the original Java receiver namespace', () => {
        // Given / When / Then
        expect(androidProfileReceiverComponent('com.chrispader.expensify.pgo')).toBe('com.chrispader.expensify.pgo/org.me.mobiexpensifyg.PgoProfileReceiver');
        expect(PROFILE_BROADCAST_ACTION).toBe('com.expensify.chat.action.WRITE_PGO_PROFILES');
    });

    it('reports positive values when the optimized build is faster', () => {
        // Given / When / Then
        expect(percentageImprovement(500, 400)).toBe(20);
    });
});
