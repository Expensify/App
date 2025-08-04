import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

function usePrivateSubscription() {
    const [privateSubscription, privateSubscriptionResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true});

    if (isLoadingOnyxValue(privateSubscriptionResult)) {
        return undefined;
    }

    return privateSubscription
        ? {
              ...privateSubscription,
              autoRenew: privateSubscription.autoRenew ?? true,
          }
        : undefined;
}

export default usePrivateSubscription;
