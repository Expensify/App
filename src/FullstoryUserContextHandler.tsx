import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from './hooks/useOnyx';
import getEnvironment from './libs/Environment/getEnvironment';
import FS from './libs/Fullstory';
import type {FullstoryUserVars} from './libs/Fullstory/types';
import {buildFullstoryUserVars} from './libs/Fullstory/utils';
import {shallowCompare} from './libs/ObjectUtils';
import ONYXKEYS from './ONYXKEYS';

const SESSION_URL_RETRY_DELAY_MS = 250;
const MAX_SESSION_URL_RETRY_ATTEMPTS = 20;

function FullstoryUserContextHandler() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingLastVisitedPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [userMetadata] = useOnyx(ONYXKEYS.USER_METADATA);

    const activePolicy = activePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`] : undefined;

    const previousUserVars = useRef<OnyxEntry<FullstoryUserVars>>(undefined);
    const sessionURLRetryAttempts = useRef(0);

    useEffect(() => {
        if (!userMetadata?.accountID) {
            return;
        }

        let didCancel = false;
        let retryTimeoutID: ReturnType<typeof setTimeout> | undefined;

        const syncUserVars = () => {
            getEnvironment()
                .then((envName) => {
                    if (didCancel || !FS.shouldInitialize(userMetadata, envName)) {
                        return;
                    }

                    return FS.getSessionURL().then((sessionURL) => {
                        if (didCancel) {
                            return;
                        }

                        if (!sessionURL) {
                            sessionURLRetryAttempts.current += 1;
                            if (sessionURLRetryAttempts.current >= MAX_SESSION_URL_RETRY_ATTEMPTS) {
                                return;
                            }

                            retryTimeoutID = setTimeout(syncUserVars, SESSION_URL_RETRY_DELAY_MS);
                            return;
                        }

                        sessionURLRetryAttempts.current = 0;

                        const userVars = buildFullstoryUserVars({
                            account,
                            activePolicy,
                            introSelected,
                            onboarding,
                            onboardingCompanySize,
                            onboardingLastVisitedPath,
                            onboardingPurposeSelected,
                            policies,
                            session,
                            userMetadata,
                        });

                        if (shallowCompare(previousUserVars.current, userVars)) {
                            return;
                        }

                        previousUserVars.current = userVars;
                        FS.setUserVars(userVars);
                    });
                })
                .catch(() => {
                    if (didCancel) {
                        return;
                    }

                    sessionURLRetryAttempts.current += 1;
                    if (sessionURLRetryAttempts.current >= MAX_SESSION_URL_RETRY_ATTEMPTS) {
                        return;
                    }

                    retryTimeoutID = setTimeout(syncUserVars, SESSION_URL_RETRY_DELAY_MS);
                });
        };

        syncUserVars();

        return () => {
            didCancel = true;
            sessionURLRetryAttempts.current = 0;
            if (retryTimeoutID) {
                clearTimeout(retryTimeoutID);
            }
        };
    }, [account, activePolicy, introSelected, onboarding, onboardingCompanySize, onboardingLastVisitedPath, onboardingPurposeSelected, policies, session, userMetadata]);

    return null;
}

export default FullstoryUserContextHandler;
