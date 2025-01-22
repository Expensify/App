import type {NavigationBarType} from './types';

function getNavigationBarType(): NavigationBarType {
    // On web, there is no navigation bar.
    return 'hidden-soft-keys-or-none';
}

export default getNavigationBarType;
