import Button from '@components/ButtonComposed';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {getCloudflareSignInOutcome} from '@libs/CloudflareAccess/finishSignInFromURL';
import DateUtils from '@libs/DateUtils';

import type {CloudflareAuthProbeResult, CloudflareAuthProbeStatus} from '@userActions/CloudflareProbe';
import {runCloudflareAuthProbe} from '@userActions/CloudflareProbe';
import {clearCloudflareSession, getCloudflareSession} from '@userActions/CloudflareSession';

import CONST from '@src/CONST';

import {useState} from 'react';

/** The semantic probe outcomes are translated. The raw `detail` diagnostic stays verbatim */
const PROBE_STATUS_TRANSLATION_KEYS = {
    success: 'qaAuthStatusSuccess',
    reauthRequired: 'qaAuthStatusReauthRequired',
    signInFailed: 'qaAuthStatusSignInFailed',
    error: 'qaAuthStatusError',
} as const satisfies Record<CloudflareAuthProbeStatus, string>;

/** A failed round trip is otherwise invisible: the handler ran during boot, long before this mounts */
function getFailedRedirectResult(): CloudflareAuthProbeResult | null {
    // A live session (this boot's or another tab's) outranks a recorded failure. It is history at that point
    if (getCloudflareSession()) {
        return null;
    }
    const {outcome, errorMessage} = getCloudflareSignInOutcome();
    if (outcome === 'not-a-callback' || outcome === 'exchanging') {
        return null;
    }
    return {status: 'signInFailed', detail: errorMessage};
}

/**
 * Test-tool rows for the QA server auth flow, rendered only when the QA credentials are configured. With no
 * session, Run navigates the whole tab to Cloudflare, so a round trip's result only shows on the next press.
 */
function QAAuthTestToolRows() {
    const styles = useThemeStyles();
    const {translate, datetimeToCalendarTime} = useLocalize();

    const [isOperationRunning, setIsOperationRunning] = useState(false);
    // Seeded from the boot-time redirect outcome. An in-flight exchange's failure surfaces when Run joins it
    const [probeResult, setProbeResult] = useState<CloudflareAuthProbeResult | null>(getFailedRedirectResult);
    // Consecutive probes produce identical results, so without a changing element the button reads as dead
    const [probeCompletedAt, setProbeCompletedAt] = useState<string | null>(null);

    if (!isQAAuthConfigured()) {
        return null;
    }

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.qaAuth')}>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    isDisabled={isOperationRunning}
                    isLoading={isOperationRunning}
                    onPress={() => {
                        setIsOperationRunning(true);
                        // Never rejects. Failures come back as semantic results
                        runCloudflareAuthProbe({shouldRedirectOnReauthRequired: probeResult?.status === 'reauthRequired'})
                            .then((result) => {
                                setProbeResult(result);
                                setProbeCompletedAt(DateUtils.getDBTime());
                            })
                            .finally(() => setIsOperationRunning(false));
                    }}
                >
                    <Button.Text>{translate('initialSettingsPage.troubleshoot.qaAuthRunProbe')}</Button.Text>
                </Button>
            </TestToolRow>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.qaAuthSession')}>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    isDisabled={isOperationRunning}
                    onPress={() => {
                        setIsOperationRunning(true);
                        clearCloudflareSession()
                            .then(() => {
                                setProbeResult(null);
                                setProbeCompletedAt(null);
                            })
                            .catch((error: unknown) => {
                                setProbeResult({status: 'error', detail: error instanceof Error ? error.message : undefined});
                                setProbeCompletedAt(DateUtils.getDBTime());
                            })
                            .finally(() => setIsOperationRunning(false));
                    }}
                >
                    <Button.Text>{translate('initialSettingsPage.troubleshoot.qaAuthClearSession')}</Button.Text>
                </Button>
            </TestToolRow>
            {!!probeResult && (
                <Text style={styles.textLabelSupporting}>
                    {translate(`initialSettingsPage.troubleshoot.${PROBE_STATUS_TRANSLATION_KEYS[probeResult.status]}`)}
                    {probeResult.detail ? ` (${probeResult.detail})` : ''}
                    {probeCompletedAt ? ` — ${datetimeToCalendarTime(probeCompletedAt, false)}` : ''}
                </Text>
            )}
        </>
    );
}

QAAuthTestToolRows.displayName = 'QAAuthTestToolRows';

export default QAAuthTestToolRows;
