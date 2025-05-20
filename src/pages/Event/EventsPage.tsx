import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import CONFIG from '@src/CONFIG';
import EventsList from './EventsList';

function EventsPage() {
    const {translate} = useLocalize();
    // TODO: implement permissions
    const canBookEvents = true

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={EventsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!canBookEvents && !CONFIG.IS_HYBRID_APP}
            >
                <HeaderWithBackButton
                    title={translate('event.bookEvent')}
                    shouldShowBackButton
                />
                <EventsList />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

EventsPage.displayName = 'EventsPage';

export default EventsPage;
