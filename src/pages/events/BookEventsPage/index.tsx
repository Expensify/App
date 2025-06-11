import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
import Events from '../../../libs/actions/Events';
import EventsList from './EventsList';

function BookEventsPage() {
    const {translate} = useLocalize();

    useEffect(() => {
        Events.fetchEvents();
    }, []);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={BookEventsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('events.bookEvents')}
                shouldShowBackButton
            />
            <EventsList />
        </ScreenWrapper>
    );
}

BookEventsPage.displayName = 'BookEventsPage';

export default BookEventsPage;
