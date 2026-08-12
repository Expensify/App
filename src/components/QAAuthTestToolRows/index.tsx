import Button from '@components/ButtonComposed';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import {getCloudflareAuthRedirectOutcome} from '@libs/CloudflareAccess/handleAuthRedirectCallback';

import type {CloudflareAuthProbeResult, CloudflareAuthProbeStatus} from '@userActions/CloudflareProbe';
import {runCloudflareAuthProbe} from '@userActions/CloudflareProbe';
import {clearCloudflareSession} from '@userActions/CloudflareSession';

import CONST from '@src/CONST';

import {useState} from 'react';

/** The semantic probe outcomes are translated; the raw `detail` diagnostic stays verbatim */
const PROBE_STATUS_TRANSLATION_KEYS = {
    success: 'qaAuthStatusSuccess',
    reauthRequired: 'qaAuthStatusReauthRequired',
    error: 'qaAuthStatusError',
} as const satisfies Record<CloudflareAuthProbeStatus, string>;

/** A failed round trip is otherwise invisible: the handler ran during boot, long before this mounts */
function getFailedRedirectResult(): CloudflareAuthProbeResult | null {
    const {outcome, errorMessage} = getCloudflareAuthRedirectOutcome();
    if (outcome === 'not-a-callback' || outcome === 'exchanging') {
        return null;
    }
    return {status: 'error', detail: errorMessage};
}

/**
 * Test-tool rows for the QA server auth flow, rendered only when the QA credentials are configured.
 *
 * With no session, Run navigates the whole tab to Cloudflare, so its spinner stays up until the page
 * unloads and the result of a completed round trip only shows on the next press.
 */
function QAAuthTestToolRows() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isOperationRunning, setIsOperationRunning] = useState(false);
    // Seeded from the boot-time redirect outcome, not an effect: it is fixed for the lifetime of the page
    const [probeResult, setProbeResult] = useState<CloudflareAuthProbeResult | null>(getFailedRedirectResult);
    // Consecutive probes produce identical results, so without a changing element the button reads as dead
    const [probeCompletedAt, setProbeCompletedAt] = useState<Date | null>(null);

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
                        // Never rejects — failures come back as semantic results
                        runCloudflareAuthProbe()
                            .then((result) => {
                                setProbeResult(result);
                                setProbeCompletedAt(new Date());
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
                                setProbeCompletedAt(new Date());
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
                    {probeCompletedAt ? ` — ${probeCompletedAt.toLocaleTimeString()}` : ''}
                </Text>
            )}
        </>
    );
}

QAAuthTestToolRows.displayName = 'QAAuthTestToolRows';

export default QAAuthTestToolRows;
