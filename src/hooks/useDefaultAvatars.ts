import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';

export default function useDefaultAvatars() {
    return useMemoizedLazyExpensifyIcons(['ConciergeAvatar', 'NotificationsAvatar', 'FallbackAvatar']);
}
