import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useMemo, useRef, useState} from 'react';
import {TextInput} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as OnyxTypes from '@src/types/onyx';
import {Waypoint} from '@src/types/onyx/Transaction';
import {isNotEmptyObject} from '@src/types/utils/EmptyObject';

type Location = {
    lat: number;
    lng: number;
};

type Geometry = {
    location: Location;
};

type MappedWaypoint = {
    name?: string;
    description: string;
    geometry: Geometry;
};

type WaypointEditorOnyxProps = {
    /** The optimistic transaction for this request */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** List of recent waypoints */
    recentWaypoints: OnyxEntry<MappedWaypoint[]>;
};

type WaypointEditorProps = {route: RouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.EDIT_WAYPOINT>} & WaypointEditorOnyxProps;

function WaypointEditor({
    route: {
        params: {iouType = '', transactionID = '', waypointIndex = '', threadReportID = ''},
    },
    transaction,
    recentWaypoints = [],
}: WaypointEditorProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const [isDeleteStopModalOpen, setIsDeleteStopModalOpen] = useState(false);
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const textInput = useRef<TextInput | null>(null);
    const parsedWaypointIndex = parseInt(waypointIndex, 10);
    const allWaypoints = transaction?.comment.waypoints ?? {};
    const currentWaypoint = allWaypoints[`waypoint${waypointIndex}`] ?? {};

    const waypointCount = Object.keys(allWaypoints).length;
    const filledWaypointCount = Object.values(allWaypoints).filter((waypoint) => isNotEmptyObject(waypoint)).length;

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

    const waypointAddress = currentWaypoint.address ?? '';
    const isEditingWaypoint = !!threadReportID;
    // Hide the menu when there is only start and finish waypoint
    const shouldShowThreeDotsButton = waypointCount > 2;
    const shouldDisableEditor =
        isFocused &&
        (Number.isNaN(parsedWaypointIndex) || parsedWaypointIndex < 0 || parsedWaypointIndex > waypointCount || (filledWaypointCount < 2 && parsedWaypointIndex >= waypointCount));

    const validate = (values: Record<string, string>) => {
        const errors = {};
        const waypointValue = values[`waypoint${waypointIndex}`] || '';
        if (isOffline && waypointValue !== '' && !ValidationUtils.isValidAddress(waypointValue)) {
            ErrorUtils.addErrorMessage(errors, `waypoint${waypointIndex}`, 'bankAccount.error.address');
        }

        // If the user is online, and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '' && waypointAddress !== waypointValue) {
            ErrorUtils.addErrorMessage(errors, `waypoint${waypointIndex}`, 'distance.errors.selectSuggestedAddress');
        }

        return errors;
    };

    const saveWaypoint = (waypoint: OnyxTypes.RecentWaypoint) => Transaction.saveWaypoint(transactionID, waypointIndex, waypoint, isEditingWaypoint);

    const submit = (values: Record<string, string>) => {
        const waypointValue = values[`waypoint${waypointIndex}`] || '';

        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.removeWaypoint(transaction, waypointIndex);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                lat: -1,
                lng: -1,
                address: waypointValue,
                name: undefined,
            };
            saveWaypoint(waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
    };

    const deleteStopAndHideModal = () => {
        Transaction.removeWaypoint(transaction, waypointIndex);
        setIsDeleteStopModalOpen(false);
        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
    };

    const selectWaypoint = (values: Waypoint) => {
        const waypoint = {
            lat: values.lat ?? -1,
            lng: values.lng ?? -1,
            address: values.address ?? '',
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            name: values.name,
        };
        saveWaypoint(waypoint);

        if (isEditingWaypoint) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(threadReportID));
            return;
        }
        Navigation.goBack(ROUTES.MONEY_REQUEST_DISTANCE_TAB.getRoute(iouType));
    };

    return (
        /* @ts-expect-error TODO: Remove this once ScreenWrapper (https://github.com/Expensify/App/issues/25109) is migrated to TypeScript. */
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => {
                textInput.current?.focus();
            }}
            shouldEnableMaxHeight
            testID={WaypointEditor.displayName}
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
                    <InputWrapper
                        /* @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/25109) is migrated to TypeScript. */
                        InputComponent={AddressSearch}
                        canUseCurrentLocation
                        inputID={`waypoint${waypointIndex}`}
                        ref={(e) => {
                            textInput.current = e;
                        }}
                        hint={!isOffline ? 'distance.errors.selectSuggestedAddress' : ''}
                        containerStyles={[styles.mt3]}
                        label={translate('distance.address')}
                        defaultValue={waypointAddress}
                        onPress={selectWaypoint}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        renamedInputKeys={{
                            address: `waypoint${waypointIndex}`,
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
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WaypointEditor.displayName = 'WaypointEditor';

export default withOnyx<WaypointEditorProps, WaypointEditorOnyxProps>({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID}`,
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
})(WaypointEditor);
