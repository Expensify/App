import type {BaseTransportOptions, Transport, TransportRequest, TransportRequestExecutor} from '@sentry/core';
import {createTransport} from '@sentry/core';
import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import {startSpan} from '@libs/telemetry/activeSpans';
import {browserTracingIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';

function makeLocalTransport(options: BaseTransportOptions): Transport {
    console.debug('[SENTRY] makeLocalTransport called with options:', options);

    const makeRequest: TransportRequestExecutor = (request: TransportRequest) => {
        let bodyString: string;
        if (request.body instanceof Uint8Array) {
            bodyString = new TextDecoder().decode(request.body);
        } else {
            bodyString = request.body;
        }

        // Sentry envelope format: header\nitem_header\nitem_payload\n...
        const lines = bodyString.split('\n').filter(Boolean);
        const parsed = lines.map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return line;
            }
        });
        console.debug('[SENTRY REQUEST]:', parsed);

        return Promise.resolve({
            statusCode: 200,
        });
    };

    return createTransport(options, makeRequest);
}

export default function (): void {
    Sentry.init({
        dsn: CONFIG.SENTRY_DSN || undefined,
        enabled: true,
        transport: makeLocalTransport,
        tracesSampleRate: 1.0,
        profilesSampleRate: Platform.OS === 'android' ? 0 : 1.0,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations: [navigationIntegration, tracingIntegration, browserTracingIntegration, SentryReact.browserProfilingIntegration()],
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
    });

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });

    // Test - wyślij testowy event
    Sentry.captureMessage('Test message from local transport');
}
