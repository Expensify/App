import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ConfirmModalActions} from '@components/Modal/Global/ConfirmModalWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useLocationBias from '@hooks/useLocationBias';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isValidAddress} from '@libs/ValidationUtils';
import variables from '@styles/variables';
import {removeWaypoint, saveWaypoint} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {RecentWaypoint, Transaction} from '@src/types/onyx';
import type {Waypoint} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

// Only grab the most recent 20 waypoints because that's all that is shown in the UI. This also puts them into the format of data
// that the google autocomplete component expects for it's "predefined places" feature.
function recentWaypointsSelector(waypoints: RecentWaypoint[] = []) {
    return waypoints
        .slice(0, CONST.RECENT_WAYPOINTS_NUMBER)
        .filter((waypoint) => waypoint.keyForList?.includes(CONST.YOUR_LOCATION_TEXT) !== true)
        .map((waypoint) => ({
            name: waypoint.name,
            description: waypoint.address ?? '',
            geometry: {
                location: {
                    lat: waypoint.lat ?? 0,
                    lng: waypoint.lng ?? 0,
                },
            },
        }));
}

type IOURequestStepWaypointProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT> & {
    transaction: OnyxEntry<Transaction>;
};

function IOURequestStepWaypoint({
    route: {
        params: {action, backTo, iouType, pageIndex, reportID, transactionID},
    },
    transaction,
}: IOURequestStepWaypointProps) {
    const styles = useThemeStyles();
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
    const [caretHidden, setCaretHidden] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION, {canBeMissing: true});
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {selector: recentWaypointsSelector, canBeMissing: true});
    const [allRecentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {canBeMissing: true});

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
        if (isOffline && waypointValue !== '' && !isValidAddress(waypointValue)) {
            addErrorMessage(errors, `waypoint${pageIndex}`, translate('bankAccount.error.address'));
        }

        // If the user is online, and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '' && waypointAddress !== waypointValue) {
            addErrorMessage(errors, `waypoint${pageIndex}`, translate('distance.error.selectSuggestedAddress'));
        }

        return errors;
    };

    const save = (waypoint: FormOnyxValues<'waypointForm'>) => {
        saveWaypoint({transactionID, index: pageIndex, waypoint, isDraft: shouldUseTransactionDraft(action), recentWaypointsList: allRecentWaypoints});
    };

    const submit = (values: FormOnyxValues<'waypointForm'>) => {
        const waypointValue = values[`waypoint${pageIndex}`] ?? '';
        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            removeWaypoint(transaction, pageIndex, shouldUseTransactionDraft(action));
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue,
                name: values.name,
                lat: values.lat,
                lng: values.lng,
                keyForList: `${(values.name ?? 'waypoint') as string}_${Date.now()}`,
            };
            save(waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        goBack();
    };

    const deleteStopAndHideModal = () => {
        removeWaypoint(transaction, pageIndex, shouldUseTransactionDraft(action));
        goBack();
    };

    const handleDeleteWaypoint = async () => {
        const result = await showConfirmModal({
            title: translate('distance.deleteWaypoint'),
            prompt: translate('distance.deleteWaypointConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            shouldEnableNewFocusManagement: true,
            danger: true,
        });
        if (result.action !== ConfirmModalActions.CONFIRM) {
            return;
        }
        deleteStopAndHideModal();
    };

    const selectWaypoint = (values: Waypoint) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
            name: values.name,
            keyForList: `${values.name ?? 'waypoint'}_${Date.now()}`,
        };

        saveWaypoint({transactionID, index: pageIndex, waypoint, isDraft: shouldUseTransactionDraft(action), recentWaypointsList: allRecentWaypoints});
        goBack();
    };

    const onScroll = useCallback(() => {
        if (!isSafari()) {
            return;
        }
        textInput.current?.measureInWindow((x, y) => {
            if (y < variables.contentHeaderHeight) {
                setCaretHidden(true);
            } else {
                setCaretHidden(false);
            }
        });
    }, []);

    const resetCaretHiddenValue = useCallback(() => {
        setCaretHidden(false);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            onEntryTransitionEnd={() => textInput.current?.focus()}
            shouldEnableMaxHeight
            testID="IOURequestStepWaypoint"
        >
            <FullPageNotFoundView shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton
                    title={translate(waypointDescriptionKey)}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    shouldSetModalVisibility={false}
                    threeDotsMenuItems={[
                        {
                            icon: expensifyIcons.Trashcan,
                            text: translate('distance.deleteWaypoint'),
                            onSelected: () => {
                                handleDeleteWaypoint();
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ]}
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
                    shouldHideFixErrorsAlert
                    onScroll={onScroll}
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
                            caretHidden={caretHidden}
                            onValueChange={resetCaretHiddenValue}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepWaypoint), true);
