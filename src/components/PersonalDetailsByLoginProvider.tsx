import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useLayoutEffect, useRef} from 'react';

/** Personal details keyed by login, instead of by accountID like the raw personal details list is. */
type PersonalDetailsByLogin = Record<string, PersonalDetails>;

type Listener = () => void;

/**
 * The context holds a store instead of the map itself so that its value stays stable. Handing the map down
 * directly would re-render every consumer on any personal details change; subscribing to the store instead lets
 * a consumer re-render only when the personal details it actually asked for change.
 */
type PersonalDetailsByLoginStore = {
    /** Registers a listener that is called whenever the map changes, and returns its unsubscribe function */
    subscribe: (listener: Listener) => () => void;

    /** Returns the current map */
    getSnapshot: () => PersonalDetailsByLogin;
};

const EMPTY_PERSONAL_DETAILS_BY_LOGIN: PersonalDetailsByLogin = {};

const PersonalDetailsByLoginContext = createContext<PersonalDetailsByLoginStore>({
    subscribe: () => () => {},
    getSnapshot: () => EMPTY_PERSONAL_DETAILS_BY_LOGIN,
});

function buildPersonalDetailsByLogin(personalDetailsList: OnyxEntry<PersonalDetailsList>): PersonalDetailsByLogin {
    if (!personalDetailsList) {
        return EMPTY_PERSONAL_DETAILS_BY_LOGIN;
    }

    const personalDetailsByLogin: PersonalDetailsByLogin = {};
    for (const personalDetails of Object.values(personalDetailsList)) {
        if (!personalDetails?.login) {
            continue;
        }
        const existing = personalDetailsByLogin[personalDetails.login];
        if (existing && !existing.isClosed && !existing.isOptimisticPersonalDetail) {
            continue;
        }
        personalDetailsByLogin[personalDetails.login] = personalDetails;
    }
    return personalDetailsByLogin;
}

/**
 * Builds the login -> personal details map once for the whole app, so that consumers don't each have to
 * subscribe to the entire personal details list to look somebody up by their login.
 */
function PersonalDetailsByLoginProvider({children}: ChildrenProps) {
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const personalDetailsByLogin = buildPersonalDetailsByLogin(personalDetailsList);

    const storeRef = useRef({snapshot: personalDetailsByLogin, listeners: new Set<Listener>()});

    // Publish the new map before paint so subscribers re-render with the latest details in the same frame.
    useLayoutEffect(() => {
        storeRef.current.snapshot = personalDetailsByLogin;
        for (const listener of storeRef.current.listeners) {
            listener();
        }
    }, [personalDetailsByLogin]);

    const store: PersonalDetailsByLoginStore = {
        subscribe: (listener) => {
            storeRef.current.listeners.add(listener);
            return () => {
                storeRef.current.listeners.delete(listener);
            };
        },
        getSnapshot: () => storeRef.current.snapshot,
    };

    return <PersonalDetailsByLoginContext.Provider value={store}>{children}</PersonalDetailsByLoginContext.Provider>;
}

export default PersonalDetailsByLoginProvider;
export {EMPTY_PERSONAL_DETAILS_BY_LOGIN, PersonalDetailsByLoginContext};
export type {PersonalDetailsByLogin};
