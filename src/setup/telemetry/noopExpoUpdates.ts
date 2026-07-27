/**
 * Metro resolves Sentry's optional expo-updates import to this stub. Expensify does not use
 * Expo Updates, so this keeps native bundles from failing resolution without adding that native dependency.
 */
type Subscription = {
    remove: () => void;
};

const noopSubscription: Subscription = {
    remove: () => {},
};

const addListener = (): Subscription => noopSubscription;
const isEnabled = false;
const isEmbeddedLaunch = false;
const isEmergencyLaunch = false;
const isUsingEmbeddedAssets = false;
const updateId = null;
const channel = null;
const runtimeVersion = null;
const checkAutomatically = null;
const emergencyLaunchReason = null;
const launchDuration = null;
const createdAt = null;

export {
    addListener,
    isEnabled,
    isEmbeddedLaunch,
    isEmergencyLaunch,
    isUsingEmbeddedAssets,
    updateId,
    channel,
    runtimeVersion,
    checkAutomatically,
    emergencyLaunchReason,
    launchDuration,
    createdAt,
};
