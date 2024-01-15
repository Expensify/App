import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TextInput} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AddressSearch from '@components/AddressSearch';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useLocationBias from '@hooks/useLocationBias';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AllRoutes} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Waypoint} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type Location = {
    lat?: number;
    lng?: number;
};

type Geometry = {
    location: Location;
};

type WaypointValues = Record<string, string>;

type MappedWaypoint = {
    /** Waypoint name */
    name?: string;

    /** Waypoint description */
    description: string;

    /** Waypoint geometry object cointaing coordinates */
    geometry: Geometry;
};

type IOURequestStepWaypointOnyxProps = {
    /** List of recent waypoints */
    recentWaypoints: OnyxEntry<MappedWaypoint[]>;

    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
};

type IOURequestStepWaypointProps = {
    route: {
        params: {
            iouType: ValueOf<typeof CONST.IOU.TYPE>;
            transactionID: string;
            reportID: string;
            backTo: AllRoutes | undefined;
            action: ValueOf<typeof CONST.IOU.ACTION>;
            pageIndex: string;
        };
    };
    transaction: OnyxEntry<OnyxTypes.Transaction>;
} & IOURequestStepWaypointOnyxProps;

function IOURequestStepWaypoint({
    route: {
        params: {action, backTo, iouType, pageIndex, reportID, transactionID},
    },
    transaction,
    recentWaypoints = [],
    userLocation,
}: IOURequestStepWaypointProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const [isDeleteStopModalOpen, setIsDeleteStopModalOpen] = useState(false);
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const textInput = useRef<TextInput | null>(null);
    const parsedWaypointIndex = parseInt(pageIndex, 10);
    const allWaypoints = transaction?.comment.waypoints ?? {};
    const currentWaypoint = allWaypoints[`waypoint${pageIndex}`] ?? {};
    const waypointCount = Object.keys(allWaypoints).length;
    const filledWaypointCount = Object.values(allWaypoints).filter((waypoint) => !isEmptyObject(waypoint)).length;

    const waypointDescriptionKey = useMemo(() => {
        switch (parsedWaypointIndex) {
            case 0:
                return 'distance.waypointDescription.start';
            case waypointCount - 1:
                return 'distance.waypointDescription.finish';
            default:
                return 'distance.waypointDescription.stop';
        }
    }, [parsedWaypointIndex, waypointCount]);

    const locationBias = useLocationBias(allWaypoints, userLocation);
    const waypointAddress = currentWaypoint.address ?? '';
    // Hide the menu when there is only start and finish waypoint
    const shouldShowThreeDotsButton = waypointCount > 2;
    const shouldDisableEditor =
        isFocused &&
        (Number.isNaN(parsedWaypointIndex) || parsedWaypointIndex < 0 || parsedWaypointIndex > waypointCount || (filledWaypointCount < 2 && parsedWaypointIndex >= waypointCount));

    const validate = (values: WaypointValues): ErrorUtils.ErrorsList => {
        const errors = {};
        const waypointValue = values[`waypoint${pageIndex}`] || '';
        if (isOffline && waypointValue !== '' && !ValidationUtils.isValidAddress(waypointValue)) {
            ErrorUtils.addErrorMessage(errors, `waypoint${pageIndex}`, 'bankAccount.error.address');
        }

        // If the user is online, and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '' && waypointAddress !== waypointValue) {
            ErrorUtils.addErrorMessage(errors, `waypoint${pageIndex}`, 'distance.errors.selectSuggestedAddress');
        }

        return errors;
    };

    const saveWaypoint = (waypoint: OnyxTypes.RecentWaypoint) => Transaction.saveWaypoint(transactionID, pageIndex, waypoint, action === CONST.IOU.ACTION.CREATE);

    const submit = (values: WaypointValues) => {
        const waypointValue = values[`waypoint${pageIndex}`] || '';

        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.removeWaypoint(transaction, pageIndex, true);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue,
                name: values.name,
            };
            saveWaypoint(waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
    };

    const deleteStopAndHideModal = () => {
        Transaction.removeWaypoint(transaction, pageIndex, true);
        setIsDeleteStopModalOpen(false);
        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
    };

    const selectWaypoint = (values: Waypoint) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address ?? '',
            name: values.name,
        };
        Transaction.saveWaypoint(transactionID, pageIndex, waypoint, action === CONST.IOU.ACTION.CREATE);
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(iouType, transactionID, reportID));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => textInput.current?.focus()}
            shouldEnableMaxHeight
            testID={IOURequestStepWaypoint.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton
                    title={translate(waypointDescriptionKey)}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
                    }}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('distance.deleteWaypoint'),
                            onSelected: () => setIsDeleteStopModalOpen(true),
                        },
                    ]}
                />
                <ConfirmModal
                    title={translate('distance.deleteWaypoint')}
                    isVisible={isDeleteStopModalOpen}
                    onConfirm={deleteStopAndHideModal}
                    onCancel={() => setIsDeleteStopModalOpen(false)}
                    prompt={translate('distance.deleteWaypointConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {/* @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/25109) is migrated to TypeScript. */}
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.WAYPOINT_FORM}
                    enabledWhenOffline
                    validate={validate}
                    onSubmit={submit}
                    shouldValidateOnChange={false}
                    shouldValidateOnBlur={false}
                    submitButtonText={translate('common.save')}
                >
                    <View>
                        <InputWrapperWithRef
                            /* @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/25109) is migrated to TypeScript. */
                            InputComponent={AddressSearch}
                            locationBias={locationBias}
                            canUseCurrentLocation
                            inputID={`waypoint${pageIndex}`}
                            ref={(e) => {
                                textInput.current = e;
                            }}
                            hint={!isOffline ? 'distance.errors.selectSuggestedAddress' : ''}
                            containerStyles={[styles.mt4]}
                            label={translate('distance.address')}
                            defaultValue={waypointAddress}
                            onPress={selectWaypoint}
                            maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                            renamedInputKeys={{
                                address: `waypoint${pageIndex}`,
                                city: null,
                                country: null,
                                street: null,
                                street2: null,
                                zipCode: null,
                                lat: null,
                                lng: null,
                                state: null,
                            }}
                            predefinedPlaces={recentWaypoints}
                            resultTypes=""
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

IOURequestStepWaypoint.displayName = 'IOURequestStepWaypoint';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepWaypointWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepWaypoint);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepWaypointWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepWaypointWithWritableReportOrNotFound);

export default withOnyx<IOURequestStepWaypointProps, IOURequestStepWaypointOnyxProps>({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    },
    recentWaypoints: {
        key: ONYXKEYS.NVP_RECENT_WAYPOINTS,

        // Only grab the most recent 5 waypoints because that's all that is shown in the UI. This also puts them into the format of data
        // that the google autocomplete component expects for it's "predefined places" feature.
        selector: (waypoints) =>
            (waypoints ? waypoints.slice(0, 5) : []).map((waypoint) => ({
                name: waypoint.name,
                description: waypoint.address,
                geometry: {
                    location: {
                        lat: waypoint.lat,
                        lng: waypoint.lng,
                    },
                },
            })),
    },
    // @ts-expect-error TODO: Remove this once withFullTransactionOrNotFound and IOURequestStepWaypointWithWritableReportOrNotFound  is migrated to TypeScript.
})(IOURequestStepWaypointWithFullTransactionOrNotFound);
