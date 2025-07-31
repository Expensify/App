import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

function useIsAutoRenewEnabled() {
    const [autoRenew, privateSubscriptionResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {canBeMissing: true, selector: (value) => (value ? (value?.autoRenew ?? true) : false)});

    if (isLoadingOnyxValue(privateSubscriptionResult)) {
        return false;
    }

    return !!autoRenew;
}

export default useIsAutoRenewEnabled;
