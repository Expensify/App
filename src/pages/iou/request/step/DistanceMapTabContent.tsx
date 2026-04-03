import React from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import DistanceRequestFooter from '@components/DistanceRequest/DistanceRequestFooter';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Transaction from '@src/types/onyx/Transaction';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

type DistanceMapTabContentProps = {
    waypointItems: string[];
    waypoints: WaypointCollection;
    extractKey: (key: string) => string;
    updateWaypoints: (data: {data: string[]}) => void;
    scrollViewRef: React.RefObject<RNScrollView | null>;
    renderItem: (params: RenderItemParams<string>) => React.JSX.Element;
    navigateToWaypointEditPage: (index: number) => void;
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    shouldShowAtLeastTwoDifferentWaypointsError: boolean;
    atLeastTwoDifferentWaypointsError: boolean;
    duplicateWaypointsError: boolean;
    hasRouteError: boolean;
    getError: () => Errors;
    submitWaypoints: () => void;
    buttonText: string;
    isOffline: boolean;
    isLoadingRoute: boolean;
    shouldFetchRoute: boolean;
    isLoading: boolean;
};

function DistanceMapTabContent({
    waypointItems,
    waypoints,
    extractKey,
    updateWaypoints,
    scrollViewRef,
    renderItem,
    navigateToWaypointEditPage,
    transaction,
    policy,
    shouldShowAtLeastTwoDifferentWaypointsError,
    atLeastTwoDifferentWaypointsError,
    duplicateWaypointsError,
    hasRouteError,
    getError,
    submitWaypoints,
    buttonText,
    isOffline,
    isLoadingRoute,
    shouldFetchRoute,
    isLoading,
}: DistanceMapTabContentProps) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={styles.flex1}>
                <DraggableList
                    data={waypointItems}
                    keyExtractor={extractKey}
                    onDragEnd={updateWaypoints}
                    ref={scrollViewRef}
                    renderItem={renderItem}
                    ListFooterComponent={
                        <DistanceRequestFooter
                            waypoints={waypoints}
                            navigateToWaypointEditPage={navigateToWaypointEditPage}
                            transaction={transaction}
                            policy={policy}
                        />
                    }
                />
            </View>
            <View style={[styles.w100, styles.pt2]}>
                {((shouldShowAtLeastTwoDifferentWaypointsError && atLeastTwoDifferentWaypointsError) || duplicateWaypointsError || hasRouteError) && (
                    <DotIndicatorMessage
                        style={[styles.mh4, styles.mv3]}
                        messages={getError()}
                        type="error"
                    />
                )}
                <Button
                    success
                    allowBubble
                    pressOnEnter
                    large
                    style={[styles.w100, styles.mb5, styles.ph5, styles.flexShrink0]}
                    onPress={submitWaypoints}
                    text={buttonText}
                    isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}
                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_NEXT_BUTTON}
                />
            </View>
        </>
    );
}

DistanceMapTabContent.displayName = 'DistanceMapTabContent';

export default DistanceMapTabContent;
