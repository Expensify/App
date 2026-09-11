import type {WindowLayoutPolicy} from '@libs/Navigation/AppNavigator/getNavigationLayoutPolicy';

function useNavigationLayoutPolicy(isEnabled = true): WindowLayoutPolicy | undefined {
    if (!isEnabled) {
        return undefined;
    }
    return undefined;
}

export default useNavigationLayoutPolicy;
