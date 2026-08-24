import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import Navigation from '@libs/Navigation/Navigation';

// Neutral placeholder shown under the RHP while a destination is pre-mounted. A native
// swipe-dismiss reveals this instead of the pre-inserted destination. Not reachable via a URL/deep link.
function PreMountBufferPage() {
    return (
        <FullscreenLoadingIndicator
            shouldUseGoBackButton
            onGoBack={Navigation.recoverFromPreMountBuffer}
            extraLoadingContext={{context: 'PreMountBufferPage'}}
        />
    );
}

export default PreMountBufferPage;
