import type {RouteProp} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import type {DraggableListData} from '@components/DraggableList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as MapboxToken from '@userActions/MapboxToken';
import * as TransactionUserActions from '@userActions/Transaction';
import * as TransactionEdit from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DistanceRequestFooter from './DistanceRequestFooter';
import DistanceRequestRenderItem from './DistanceRequestRenderItem';

type DistanceRequestOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type DistanceRequestProps = DistanceRequestOnyxProps & {
    /** The TransactionID of this request */
    transactionID?: string;

    /** The report to which the distance request is associated */
    report: OnyxEntry<Report>;

    /** Are we editing an existing distance request, or creating a new one? */
    isEditingRequest?: boolean;

    /** Are we editing the distance while creating a new distance request */
    isEditingNewRequest?: boolean;

    /** Called on submit of this page */
    onSubmit: (waypoints?: WaypointCollection) => void;

    /** React Navigation route */
    route: RouteProp<{
        /** Params from the route */
        params: {
            /** The type of IOU report, i.e. bill, request, send */
            iouType: string;
            /** The report ID of the IOU */
            reportID: string;
        };
    }>;
};

function DistanceRequest({transactionID = '', report, transaction, route, isEditingRequest = false, isEditingNewRequest = false, onSubmit}: DistanceRequestProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection>();
    const [hasError, setHasError] = useState(false);
    const reportID = report?.reportID ?? '';
    const waypoints: WaypointCollection = useMemo(() => optimisticWaypoints ?? transaction?.comment?.waypoints ?? {waypoint0: {}, waypoint1: {}}, [optimisticWaypoints, transaction]);
    const waypointsList = Object.keys(waypoints);
    const iouType = route?.params?.iouType ?? '';
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = Object.keys(waypoints).length;
    const numberOfPreviousWaypoints = Object.keys(previousWaypoints).length;
    const scrollViewRef = useRef<ScrollView>(null);

    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const isLoading = transaction?.isLoading ?? false;
    const hasRouteError = Boolean(transaction?.errorFields?.route);
    const hasRoute = TransactionUtils.hasRoute((transaction ?? {}) as Transaction);
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !lodashIsEqual(previousValidatedWaypoints, validatedWaypoints);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const shouldFetchRoute = (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && Object.keys(validatedWaypoints).length > 1;
    const transactionWasSaved = useRef(false);

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (!isEditingNewRequest && !isEditingRequest) {
            return () => {};
        }
        // This effect runs when the component is mounted and unmounted. It's purpose is to be able to properly
        // discard changes if the user cancels out of making any changes. This is accomplished by backing up the
        // original transaction, letting the user modify the current transaction, and then if the user ever
        // cancels out of the modal without saving changes, the original transaction is restored from the backup.

        // On mount, create the backup transaction.
        TransactionEdit.createBackupTransaction(transaction);

        return () => {
            // If the user cancels out of the modal without without saving changes, then the original transaction
            // needs to be restored from the backup so that all changes are removed.
            if (transactionWasSaved.current) {
                return;
            }
            TransactionEdit.restoreOriginalTransactionFromBackup(transaction?.transactionID ?? '');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const transactionWaypoints = transaction?.comment?.waypoints ?? {};
        if (!transaction?.transactionID || Object.keys(transactionWaypoints).length) {
            return;
        }

        // Create the initial start and stop waypoints
        TransactionUserActions.createInitialWaypoints(transactionID);
        return () => {
            // Whenever we reset the transaction, we need to set errors as empty/false.
            setHasError(false);
        };
    }, [transaction, transactionID]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isOffline || !shouldFetchRoute) {
            return;
        }

        TransactionUserActions.getRoute(transactionID, validatedWaypoints);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline]);

    useEffect(() => {
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: true});
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);

    useEffect(() => {
        // Whenever we change waypoints we need to remove the error or it will keep showing the error.
        if (lodashIsEqual(previousWaypoints, waypoints)) {
            return;
        }
        setHasError(false);
    }, [waypoints, previousWaypoints]);

    const navigateBack = () => {
        Navigation.goBack(isEditingNewRequest ? ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID) : ROUTES.HOME);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     */
    const navigateToWaypointEditPage = (index: number) => {
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(
                CONST.IOU.ACTION.EDIT,
                CONST.IOU.TYPE.REQUEST,
                transactionID,
                report?.reportID ?? '',
                index.toString(),
                Navigation.getActiveRouteWithoutParams(),
            ),
        );
    };

    const getError = useCallback(() => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return ErrorUtils.getLatestErrorField((transaction ?? {}) as Transaction, 'route');
        }

        if (Object.keys(validatedWaypoints).length < 2) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return {0: 'iou.error.atLeastTwoDifferentWaypoints'};
        }

        if (Object.keys(validatedWaypoints).length < Object.keys(waypoints).length) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return {0: translate('iou.error.duplicateWaypointsErrorMessage')};
        }
    }, [translate, transaction, hasRouteError, validatedWaypoints, waypoints]);

    const updateWaypoints = useCallback(
        ({data}: DraggableListData<string>) => {
            if (lodashIsEqual(waypointsList, data)) {
                return;
            }

            const newWaypoints: WaypointCollection = {};
            let emptyWaypointIndex = -1;
            data.forEach((waypoint, index) => {
                newWaypoints[`waypoint${index}`] = waypoints?.[waypoint] ?? {};
                // Find waypoint that BECOMES empty after dragging
                if (isEmptyObject(newWaypoints[`waypoint${index}`]) && !isEmptyObject(waypoints[`waypoint${index}`])) {
                    emptyWaypointIndex = index;
                }
            });

            setOptimisticWaypoints(newWaypoints);
            // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
            Promise.all([TransactionUserActions.removeWaypoint(transaction, emptyWaypointIndex.toString()), TransactionUserActions.updateWaypoints(transactionID, newWaypoints)]).then(() => {
                setOptimisticWaypoints(undefined);
            });
        },
        [transactionID, transaction, waypoints, waypointsList],
    );

    const submitWaypoints = useCallback(() => {
        // If there is any error or loading state, don't let user go to next page.
        if (!isEmptyObject(getError()) || isLoadingRoute || (isLoading && !isOffline)) {
            setHasError(true);
            return;
        }

        if (isEditingNewRequest || isEditingRequest) {
            transactionWasSaved.current = true;
        }

        onSubmit(waypoints);
    }, [onSubmit, setHasError, getError, isLoadingRoute, isLoading, waypoints, isEditingNewRequest, isEditingRequest, isOffline]);

    const content = (
        <>
            <View style={styles.flex1}>
                <DraggableList
                    data={waypointsList}
                    keyExtractor={(item) => item}
                    shouldUsePortal
                    onDragEnd={updateWaypoints}
                    ref={scrollViewRef}
                    renderItem={({item, drag, isActive, getIndex}) => (
                        <DistanceRequestRenderItem
                            waypoints={waypoints}
                            item={item}
                            onSecondaryInteraction={drag}
                            isActive={isActive}
                            getIndex={getIndex as () => number}
                            onPress={navigateToWaypointEditPage}
                            disabled={isLoadingRoute}
                        />
                    )}
                    ListFooterComponent={
                        <DistanceRequestFooter
                            waypoints={waypoints}
                            navigateToWaypointEditPage={navigateToWaypointEditPage}
                            transaction={(transaction ?? {}) as Transaction}
                        />
                    }
                />
            </View>
            <View style={[styles.w100, styles.pt2]}>
                {/* Show error message if there is route error or there are less than 2 routes and user has tried submitting, */}
                {((hasError && !isEmptyObject(getError())) || hasRouteError) && (
                    <DotIndicatorMessage
                        style={[styles.mh4, styles.mv3]}
                        messages={getError() ?? {}}
                        type="error"
                    />
                )}
                <Button
                    success
                    allowBubble
                    large
                    pressOnEnter
                    style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                    onPress={submitWaypoints}
                    text={translate(isEditingRequest ? 'common.save' : 'common.next')}
                    isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}
                />
            </View>
        </>
    );

    if (!isEditingNewRequest) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={DistanceRequest.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('common.distance')}
                            onBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
export default withOnyx<DistanceRequestProps, DistanceRequestOnyxProps>({
    transaction: {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID || 0}`,
    },
})(DistanceRequest);
