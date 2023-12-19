import {useNavigation} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AddressSearch from '@components/AddressSearch';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx props */
    /** The optimistic transaction for this request */
    transaction: transactionPropTypes,

    /** Recent waypoints that the user has selected */
    recentWaypoints: PropTypes.arrayOf(
        PropTypes.shape({
            /** The name of the location */
            name: PropTypes.string,

            /** A description of the location (usually the address) */
            description: PropTypes.string,

            /** Data required by the google auto complete plugin to know where to put the markers on the map */
            geometry: PropTypes.shape({
                /** Data about the location */
                location: PropTypes.shape({
                    /** Latitude of the location */
                    lat: PropTypes.number,

                    /** Longitude of the location */
                    lng: PropTypes.number,
                }),
            }),
        }),
    ),
};

const defaultProps = {
    recentWaypoints: [],
    transaction: {},
};

function IOURequestStepWaypoint({
    recentWaypoints,
    route: {
        params: {iouType, pageIndex, reportID, transactionID},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const [isDeleteStopModalOpen, setIsDeleteStopModalOpen] = useState(false);
    const navigation = useNavigation();
    const isFocused = navigation.isFocused();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const textInput = useRef(null);
    const parsedWaypointIndex = parseInt(pageIndex, 10);
    const allWaypoints = lodashGet(transaction, 'comment.waypoints', {});
    const currentWaypoint = lodashGet(allWaypoints, `waypoint${pageIndex}`, {});

    const waypointCount = _.size(allWaypoints);
    const filledWaypointCount = _.size(_.filter(allWaypoints, (waypoint) => !_.isEmpty(waypoint)));

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

    const waypointAddress = lodashGet(currentWaypoint, 'address', '');
    // Hide the menu when there is only start and finish waypoint
    const shouldShowThreeDotsButton = waypointCount > 2;
    const shouldDisableEditor =
        isFocused &&
        (Number.isNaN(parsedWaypointIndex) || parsedWaypointIndex < 0 || parsedWaypointIndex > waypointCount || (filledWaypointCount < 2 && parsedWaypointIndex >= waypointCount));

    const validate = (values) => {
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

    const saveWaypoint = (waypoint) => Transaction.saveWaypoint(transactionID, pageIndex, waypoint, false);

    const submit = (values) => {
        const waypointValue = values[`waypoint${pageIndex}`] || '';

        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.removeWaypoint(transaction, pageIndex, true);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                lat: null,
                lng: null,
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

    /**
     * @param {Object} values
     * @param {String} values.lat
     * @param {String} values.lng
     * @param {String} values.address
     */
    const selectWaypoint = (values) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
            name: values.name,
        };
        Transaction.saveWaypoint(transactionID, pageIndex, waypoint, false);
        Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(iouType, transactionID, reportID));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => textInput.current && textInput.current.focus()}
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
                            canUseCurrentLocation
                            inputID={`waypoint${pageIndex}`}
                            ref={(e) => (textInput.current = e)}
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
IOURequestStepWaypoint.propTypes = propTypes;
IOURequestStepWaypoint.defaultProps = defaultProps;

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        recentWaypoints: {
            key: ONYXKEYS.NVP_RECENT_WAYPOINTS,

            // Only grab the most recent 5 waypoints because that's all that is shown in the UI. This also puts them into the format of data
            // that the google autocomplete component expects for it's "predefined places" feature.
            selector: (waypoints) =>
                _.map(waypoints ? waypoints.slice(0, 5) : [], (waypoint) => ({
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
    }),
)(IOURequestStepWaypoint);
