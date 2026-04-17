import Navigation from '@libs/Navigation/Navigation';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

function dismissModalForCurrentContext(reportID?: string) {
    if (isSearchTopmostFullScreenRoute()) {
        Navigation.dismissModal();
        return;
    }

    if (!reportID) {
        Navigation.dismissModal();
        return;
    }

    Navigation.dismissModalWithReport({reportID});
}

export default dismissModalForCurrentContext;
