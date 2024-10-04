import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {View} from 'react-native';
import type {Place} from 'react-native-google-places-autocomplete';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type BaseModalProps from '@components/Modal/types';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useLocationBias from '@hooks/useLocationBias';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Waypoint} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepWaypointOnyxProps = {
    /** List of recent waypoints */
    recentWaypoints: OnyxEntry<Place[]>;

    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
};

type IOURequestStepWaypointProps = IOURequestStepWaypointOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT> & {
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

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
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const textInput = useRef<TextInput | null>(null);
    const parsedWaypointIndex = parseInt(pageIndex, 10);
    const allWaypoints = transaction?.comment?.waypoints ?? {};
    const currentWaypoint = allWaypoints[`waypoint${pageIndex}`] ?? {};
    const waypointCount = Object.keys(allWaypoints).length;
    const filledWaypointCount = Object.values(allWaypoints).filter((waypoint) => !isEmptyObject(waypoint)).length;

    const waypointDescriptionKey = useMemo(() => {
        switch (parsedWaypointIndex) {
            case 0:
                return 'distance.waypointDescription.start';
            default:
                return 'distance.waypointDescription.stop';
        }
    }, [parsedWaypointIndex]);

    const locationBias = useLocationBias(allWaypoints, userLocation);
    const waypointAddress = currentWaypoint.address ?? '';
    // Hide the menu when there is only start and finish waypoint
    const shouldShowThreeDotsButton = waypointCount > 2 && !!waypointAddress;
    const shouldDisableEditor =
        isFocused &&
        (Number.isNaN(parsedWaypointIndex) || parsedWaypointIndex < 0 || parsedWaypointIndex > waypointCount || (filledWaypointCount < 2 && parsedWaypointIndex >= waypointCount));

    const goBack = () => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
    };

    const validate = (values: FormOnyxValues<'waypointForm'>): Partial<Record<string, TranslationPaths>> => {
        const errors = {};
        const waypointValue = values[`waypoint${pageIndex}`] ?? '';
        if (isOffline && waypointValue !== '' && !ValidationUtils.isValidAddress(waypointValue)) {
            ErrorUtils.addErrorMessage(errors, `waypoint${pageIndex}`, translate('bankAccount.error.address'));
        }

        // If the user is online, and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '' && waypointAddress !== waypointValue) {
            ErrorUtils.addErrorMessage(errors, `waypoint${pageIndex}`, translate('distance.error.selectSuggestedAddress'));
        }

        return errors;
    };

    const saveWaypoint = (waypoint: FormOnyxValues<'waypointForm'>) => Transaction.saveWaypoint(transactionID, pageIndex, waypoint, IOUUtils.shouldUseTransactionDraft(action));

    const submit = (values: FormOnyxValues<'waypointForm'>) => {
        const waypointValue = values[`waypoint${pageIndex}`] ?? '';
        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.removeWaypoint(transaction, pageIndex, IOUUtils.shouldUseTransactionDraft(action));
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue ?? '',
                name: values.name ?? '',
                lat: values.lat ?? 0,
                lng: values.lng ?? 0,
                keyForList: `${(values.name ?? 'waypoint') as string}_${Date.now()}`,
            };
            saveWaypoint(waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        goBack();
    };

    const deleteStopAndHideModal = () => {
        Transaction.removeWaypoint(transaction, pageIndex, IOUUtils.shouldUseTransactionDraft(action));
        setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        setIsDeleteStopModalOpen(false);
        goBack();
    };

    const selectWaypoint = (values: Waypoint) => {
        const waypoint = {
            lat: values.lat ?? 0,
            lng: values.lng ?? 0,
            address: values.address ?? '',
            name: values.name ?? '',
            keyForList: `${values.name ?? 'waypoint'}_${Date.now()}`,
        };

        Transaction.saveWaypoint(transactionID, pageIndex, waypoint, IOUUtils.shouldUseTransactionDraft(action));
        goBack();
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
                    onBackButtonPress={goBack}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    shouldSetModalVisibility={false}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('distance.deleteWaypoint'),
                            onSelected: () => {
                                setRestoreFocusType(undefined);
                                setIsDeleteStopModalOpen(true);
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ]}
                />
                <ConfirmModal
                    title={translate('distance.deleteWaypoint')}
                    isVisible={isDeleteStopModalOpen}
                    onConfirm={deleteStopAndHideModal}
                    onCancel={() => setIsDeleteStopModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('distance.deleteWaypointConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    shouldEnableNewFocusManagement
                    danger
                    restoreFocusType={restoreFocusType}
                />
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
                            InputComponent={AddressSearch}
                            locationBias={locationBias}
                            canUseCurrentLocation
                            inputID={`waypoint${pageIndex}`}
                            ref={(e: HTMLElement | null) => {
                                textInput.current = e as unknown as TextInput;
                            }}
                            hint={!isOffline ? translate('distance.error.selectSuggestedAddress') : ''}
                            containerStyles={[styles.mt4]}
                            label={translate('distance.address')}
                            defaultValue={waypointAddress}
                            onPress={selectWaypoint}
                            maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                            renamedInputKeys={{
                                address: `waypoint${pageIndex}`,
                                city: '',
                                country: '',
                                street: '',
                                street2: '',
                                zipCode: '',
                                lat: '',
                                lng: '',
                                state: '',
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

export default withWritableReportOrNotFound(
    withFullTransactionOrNotFound(
        withOnyx<IOURequestStepWaypointProps, IOURequestStepWaypointOnyxProps>({
            userLocation: {
                key: ONYXKEYS.USER_LOCATION,
            },
            recentWaypoints: {
                key: ONYXKEYS.NVP_RECENT_WAYPOINTS,

                // Only grab the most recent 20 waypoints because that's all that is shown in the UI. This also puts them into the format of data
                // that the google autocomplete component expects for it's "predefined places" feature.
                selector: (waypoints) =>
                    (waypoints ? waypoints.slice(0, CONST.RECENT_WAYPOINTS_NUMBER as number) : [])
                        .filter((waypoint) => waypoint.keyForList?.includes(CONST.YOUR_LOCATION_TEXT) !== true)
                        .map((waypoint) => ({
                            name: waypoint.name,
                            description: waypoint.address ?? '',
                            geometry: {
                                location: {
                                    lat: waypoint.lat ?? 0,
                                    lng: waypoint.lng ?? 0,
                                    latitude: waypoint.lat ?? 0,
                                    longtitude: waypoint.lng ?? 0,
                                },
                            },
                        })),
            },
        })(IOURequestStepWaypoint),
    ),
    true,
);
