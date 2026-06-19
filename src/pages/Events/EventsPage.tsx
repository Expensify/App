import {FlashList} from '@shopify/flash-list';
import type {ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo} from 'react';
import {RefreshControl, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {fetchEvents, toggleFavoriteEvent} from '@userActions/Events';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Event} from '@src/types/onyx';
import EventCard from './EventCard';

function EventsPage() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [eventsCollection] = useOnyx(ONYXKEYS.COLLECTION.EVENT);
    const [meta] = useOnyx(ONYXKEYS.EVENTS_FETCH_METADATA);
    const [favorites] = useOnyx(ONYXKEYS.FAVORITE_EVENT_IDS);
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateTravel'] as const);

    const isLoading = !!meta?.loading;
    const hasCompletedInitialFetch = !!meta?.hasCompletedInitialFetch;
    const hasEvents = Object.values(eventsCollection ?? {}).some((event) => !!event);
    const hasError = !isLoading && !!meta?.errors && Object.keys(meta.errors).length > 0;
    const isInitialLoading = isLoading && !hasCompletedInitialFetch;
    const isRefreshing = isLoading && hasCompletedInitialFetch;

    // Sync persisted events with the current mock source when the screen opens.
    useEffect(() => {
        fetchEvents();
    }, []);

    // Favorites first sort, preserves original order within each group.
    const sortedEvents = useMemo(() => {
        const list = Object.values(eventsCollection ?? {}).filter((event): event is Event => !!event);
        return list.sort((a, b) => Number(!!favorites?.[b.id]) - Number(!!favorites?.[a.id]));
    }, [eventsCollection, favorites]);

    const isEmpty = !isInitialLoading && !hasError && sortedEvents.length === 0;

    // FlashList may not re-render visible cells when favorite state changes inside row components.
    const extraData = useMemo(() => [favorites], [favorites]);

    const renderItem: ListRenderItem<Event> = useCallback(
        ({item}) => (
            <EventCard
                event={item}
                isFavorite={!!favorites?.[item.id]}
                onToggleFavorite={toggleFavoriteEvent}
            />
        ),
        [favorites],
    );

    const keyExtractor = useCallback((item: Event) => item.id, []);

    const onRefresh = useCallback(() => {
        fetchEvents();
    }, []);

    const refreshControl = useMemo(
        () => (
            <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.spinner}
                colors={[theme.spinner]}
            />
        ),
        [isRefreshing, onRefresh, theme.spinner],
    );

    return (
        <ScreenWrapper testID={EventsPage.displayName}>
            <HeaderWithBackButton
                title={translate('events.title')}
                onBackButtonPress={Navigation.goBack}
            />
            {isInitialLoading && (
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator
                        size="large"
                        reasonAttributes={{context: 'EventsPage'}}
                    />
                </View>
            )}
            {hasError && (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap3, styles.ph5]}>
                    <Text style={styles.textLabel}>{translate('events.error')}</Text>
                    <Button
                        text={translate('events.retry')}
                        isLoading={isLoading}
                        onPress={onRefresh}
                        sentryLabel={CONST.SENTRY_LABEL.EVENTS.RETRY}
                    />
                </View>
            )}
            {!isInitialLoading && isEmpty && (
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1]}
                    refreshControl={refreshControl}
                >
                    <GenericEmptyStateComponent
                        headerMedia={illustrations.EmptyStateTravel}
                        title={translate('events.emptyTitle')}
                        subtitle={translate('events.emptySubtitle')}
                    />
                </ScrollView>
            )}
            {!isInitialLoading && !isEmpty && !hasError && hasEvents && (
                <View style={styles.flex1}>
                    <FlashList
                        data={sortedEvents}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        extraData={extraData}
                        contentContainerStyle={styles.pb5}
                        refreshControl={refreshControl}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

EventsPage.displayName = 'EventsPage';
export default EventsPage;
