import _ from 'underscore';
import React, {useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import AddressSearch from '../../components/AddressSearch';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';
import styles from '../../styles/styles';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import ConfirmModal from '../../components/ConfirmModal';
import * as Transaction from '../../libs/actions/Transaction';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ROUTES from '../../ROUTES';
import transactionPropTypes from '../../components/transactionPropTypes';

const propTypes = {
    /** The transactionID of the IOU */
    transactionID: PropTypes.string.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** IOU type */
            iouType: PropTypes.string,

            /** Index of the waypoint being edited */
            waypointIndex: PropTypes.string,
        }),
    }),

    recentWaypoints: PropTypes.arrayOf(
        PropTypes.shape({
            /** A description of the location (usually the address) */
            description: PropTypes.string,

            /** Data required by the google auto complete plugin to know where to put the markers on the map */
            geometry: PropTypes.shape({
                /** Data about the location */
                location: PropTypes.shape({
                    /** Lattitude of the location */
                    lat: PropTypes.number,

                    /** Longitude of the location */
                    lng: PropTypes.number,
                }),
            }),
        }),
    ),

    /** The optimistic transaction for this request */
    transaction: transactionPropTypes,
};

const defaultProps = {
    route: {
        params: {
            waypointIndex: '',
        },
    },
    recentWaypoints: [],
    transaction: {},
};

function WaypointEditor({transactionID, route: {params: {iouType = '', waypointIndex = ''} = {}} = {}, transaction, recentWaypoints}) {
    const {windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const textInput = useRef(null);
    const [isDeleteStopModalOpen, setIsDeleteStopModalOpen] = useState(false);
    const currentWaypoint = lodashGet(transaction, `comment.waypoints.waypoint${waypointIndex}`, {});
    const waypointAddress = lodashGet(currentWaypoint, 'address', '');
    const totalWaypoints = _.size(lodashGet(transaction, 'comment.waypoints', {}));
    // Hide the menu when there is only start and finish waypoint
    const shouldShowThreeDotsButton = totalWaypoints > 2;

    const validate = (values) => {
        const errors = {};
        const waypointValue = values[`waypoint${waypointIndex}`] || '';
        if (isOffline && waypointValue !== '' && !ValidationUtils.isValidAddress(waypointValue)) {
            errors[`waypoint${waypointIndex}`] = 'bankAccount.error.address';
        }

        // If the user is online and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '') {
            errors[`waypoint${waypointIndex}`] = 'distance.errors.selectSuggestedAddress';
        }

        return errors;
    };

    const onSubmit = (values) => {
        const waypointValue = values[`waypoint${waypointIndex}`] || '';

        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.removeWaypoint(transactionID, waypointIndex);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue,
            };

            Transaction.saveWaypoint(transactionID, waypointIndex, waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        Navigation.goBack(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    const deleteStopAndHideModal = () => {
        Transaction.removeWaypoint(transactionID, waypointIndex);
        setIsDeleteStopModalOpen(false);
        Navigation.goBack(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    const selectWaypoint = (values) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
        };

        Transaction.saveWaypoint(transactionID, waypointIndex, waypoint);
        Navigation.goBack(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => textInput.current && textInput.current.focus()}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('distance.waypointEditor')}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
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
            <Form
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.WAYPOINT_FORM}
                enabledWhenOffline
                validate={validate}
                onSubmit={onSubmit}
                shouldValidateOnChange={false}
                shouldValidateOnBlur={false}
                submitButtonText={translate('common.save')}
            >
                <View>
                    <AddressSearch
                        inputID={`waypoint${waypointIndex}`}
                        ref={(e) => (textInput.current = e)}
                        hint={!isOffline ? translate('distance.errors.selectSuggestedAddress') : ''}
                        containerStyles={[styles.mt4]}
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
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

WaypointEditor.displayName = 'WaypointEditor';
WaypointEditor.propTypes = propTypes;
WaypointEditor.defaultProps = defaultProps;
export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        selector: (transaction) => (transaction ? {transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}} : null),
    },
    recentWaypoints: {
        key: ONYXKEYS.NVP_RECENT_WAYPOINTS,

        // Only grab the most recent 5 waypoints because that's all that is shown in the UI. This also puts them into the format of data
        // that the google autocomplete component expects for it's "predefined places" feature.
        selector: (waypoints) =>
            _.map(waypoints ? waypoints.slice(0, 5) : [], (waypoint) => ({
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
