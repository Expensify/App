import HeaderTitle from '@components/HeaderTitle';
import Modal from '@components/Modal';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {rejectCloudflareChallenge, resolveCloudflareChallenge, setIsChallengeModalMounted} from '@libs/actions/CloudflareChallenge';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import viewRef from '@src/types/utils/viewRef';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

let turnstileScriptLoadPromise: Promise<void> | undefined;

/**
 * Loads the Turnstile script once. Explicit rendering keeps control over when and where the widget appears, so the
 * modal opens before any third-party code runs. A failed load is dropped from the cache so the next challenged
 * request can try again instead of inheriting the rejection.
 */
function loadTurnstileScript(): Promise<void> {
    if (turnstileScriptLoadPromise) {
        return turnstileScriptLoadPromise;
    }
    const scriptLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${CONST.CLOUDFLARE_CHALLENGE.TURNSTILE.SCRIPT_URL}?render=explicit`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            reject(new Error('Failed to load the Turnstile script'));
        };
        document.head.appendChild(script);
    });
    scriptLoadPromise.catch(() => {
        turnstileScriptLoadPromise = undefined;
    });
    turnstileScriptLoadPromise = scriptLoadPromise;
    return scriptLoadPromise;
}

/**
 * Modal with the Turnstile check. Cloudflare challenged a request, and passing the check sets a cf_clearance cookie
 * that lets the challenged request retry successfully.
 */
function CloudflareChallengeModal() {
    const [isCloudflareChallengeModalOpen = false] = useOnyx(ONYXKEYS.RAM_ONLY_IS_CLOUDFLARE_CHALLENGE_MODAL_OPEN);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const widgetContainerRef = useRef<HTMLDivElement>(null);

    // Requests challenged while the modal is not mounted must fail instead of waiting for a promise nothing resolves
    useEffect(() => {
        setIsChallengeModalMounted(true);
        return () => setIsChallengeModalMounted(false);
    }, []);

    useEffect(() => {
        if (!isCloudflareChallengeModalOpen) {
            return;
        }
        let isEffectCleanedUp = false;
        let widgetId: string | undefined;
        loadTurnstileScript()
            .then(() => {
                if (isEffectCleanedUp) {
                    return;
                }
                const widgetContainer = widgetContainerRef.current;
                if (!widgetContainer || !window.turnstile) {
                    return;
                }
                const turnstileOptions: TurnstileRenderOptions = {
                    sitekey: CONST.CLOUDFLARE_CHALLENGE.TURNSTILE.SITEKEY,
                    callback: () => resolveCloudflareChallenge(),
                    // The widget shows its own error state and retry option, so these only record what happened
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Cloudflare uses these names
                    'error-callback': (errorCode: string) => Log.hmmm('Turnstile widget failed', {errorCode}),
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Cloudflare uses these names
                    'expired-callback': () => Log.hmmm('Turnstile widget token expired'),
                };
                widgetId = window.turnstile.render(widgetContainer, turnstileOptions);
            })
            .catch((error: unknown) => {
                Log.hmmm('Turnstile script failed to load', {error});
                rejectCloudflareChallenge();
            });
        return () => {
            isEffectCleanedUp = true;
            if (widgetId) {
                window.turnstile?.remove(widgetId);
            }
        };
    }, [isCloudflareChallengeModalOpen]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.CONFIRM}
            isVisible={isCloudflareChallengeModalOpen}
            onClose={rejectCloudflareChallenge}
        >
            <View style={[styles.p5]}>
                <HeaderTitle>
                    <HeaderTitle.Text style={[styles.mb2]}>{translate('cloudflareChallengeModal.title')}</HeaderTitle.Text>
                </HeaderTitle>
                <Text style={[styles.mb4]}>{translate('cloudflareChallengeModal.body')}</Text>
                <View
                    ref={viewRef(widgetContainerRef)}
                    style={[styles.w100]}
                />
            </View>
        </Modal>
    );
}

export default CloudflareChallengeModal;
