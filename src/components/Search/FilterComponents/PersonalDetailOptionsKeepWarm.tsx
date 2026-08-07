import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';

/**
 * Holds the Onyx subscriptions behind the personal detail option list for as long as it stays mounted, so the memoized
 * list survives filter content remounts (Onyx drops a key's cached snapshot with its last subscriber). Renders nothing.
 */
function PersonalDetailOptionsKeepWarm() {
    usePersonalDetailOptions({enabled: false});

    return null;
}

export default PersonalDetailOptionsKeepWarm;
