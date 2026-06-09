import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from './hooks/useOnyx';
import FS from './libs/Fullstory';
import type {FullstoryUserVars} from './libs/Fullstory/types';
import {buildFullstoryUserVars} from './libs/Fullstory/utils';
import {shallowCompare} from './libs/ObjectUtils';
import ONYXKEYS from './ONYXKEYS';

function FullstoryUserContextHandler() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingLastVisitedPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [userMetadata] = useOnyx(ONYXKEYS.USER_METADATA);

    const activePolicy = activePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`] : undefined;
    const userVars = buildFullstoryUserVars({
        account,
        activePolicy,
        introSelected,
        loginList,
        onboarding,
        onboardingCompanySize,
        onboardingLastVisitedPath,
        onboardingPurposeSelected,
        policies,
        session,
        userMetadata,
    });

    const previousUserVars = useRef<OnyxEntry<FullstoryUserVars>>(undefined);

    useEffect(() => {
        if (!userMetadata?.accountID) {
            return;
        }

        let didCancel = false;

        FS.onReady().then(() => {
            if (didCancel) {
                return;
            }

            if (shallowCompare(previousUserVars.current, userVars)) {
                return;
            }

            previousUserVars.current = userVars;
            FS.setUserVars(userVars);
        });

        return () => {
            didCancel = true;
        };
    }, [userMetadata?.accountID, userVars]);

    return null;
}

export default FullstoryUserContextHandler;
