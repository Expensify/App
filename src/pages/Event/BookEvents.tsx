import React, {useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import useThemeStyles from '@hooks/useThemeStyles';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import BookEventsList from './BookEventsList';
import MOCKED_EVENTS from './mock';

function BookEvent() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [isFiltered, setIsFiltered] = useState<boolean>(false);

    const toggleFilter = () => {
        setIsFiltered(!isFiltered);
    }

    const events = useMemo(() => MOCKED_EVENTS, []);

    const [favouriteEvents] = useOnyx(ONYXKEYS.FAVOURITE_EVENTS, {allowDynamicKey: true});

    const filteredEvents = useMemo(() => {
        if (!isFiltered) {return events;}

        return [...events].sort((firstEvent, secondEvent) => {
            const firstIsFavourite = favouriteEvents?.includes(firstEvent.id) ? -1 : 0;
            const secondIsFavourite = favouriteEvents?.includes(secondEvent.id) ? -1 : 0;
            return firstIsFavourite - secondIsFavourite;
        })
    }, [isFiltered, events, favouriteEvents]);

    return (
        <ScreenWrapper
            testID={BookEvent.displayName}
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                title={translate('event.header')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)}
            />
            <RadioButtonWithLabel
                key={translate('event.buttons.filter')}
                isChecked={isFiltered}
                style={[styles.ml5]}
                onPress={toggleFilter}
                label={translate('event.buttons.filter')}
            />
            <BookEventsList favouriteEvents={favouriteEvents ?? []} data={filteredEvents}/>
        </ScreenWrapper>
    );
}

BookEvent.displayName = 'BookEvent';

export default BookEvent;
