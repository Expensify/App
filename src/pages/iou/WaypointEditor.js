import React, {useRef} from 'react';
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
import compose from '../../libs/compose';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as Transaction from '../../libs/actions/Transaction';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ROUTES from '../../ROUTES';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

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

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        /** The transactionID of this request */
        transactionID: PropTypes.string,

        /** The comment object on the transaction */
        comment: PropTypes.shape({
            /** The waypoints defining the distance request */
            waypoints: PropTypes.shape({
                /** The latitude of the waypoint */
                lat: PropTypes.number,

                /** The longitude of the waypoint */
                lng: PropTypes.number,

                /** The address of the waypoint */
                address: PropTypes.string,
            }),
        }),
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {
            waypointIndex: '',
        },
    },
    transaction: {},
};

function WaypointEditor({transactionID, route: {params: {iouType = '', waypointIndex = ''} = {}} = {}, network, translate, transaction}) {
    const textInput = useRef(null);
    const currentWaypoint = lodashGet(transaction, `comment.waypoints.waypoint${waypointIndex}`, {});
    const waypointAddress = lodashGet(currentWaypoint, 'address', '');

    const validate = (values) => {
        const errors = {};
        const waypointValue = values[`waypoint${waypointIndex}`] || '';
        if (network.isOffline && waypointValue !== '' && !ValidationUtils.isValidAddress(waypointValue)) {
            errors[`waypoint${waypointIndex}`] = 'bankAccount.error.address';
        }

        // If the user is online and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!network.isOffline && waypointValue !== '') {
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
        if (network.isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue,
            };

            Transaction.saveWaypoint(transactionID, waypointIndex, waypoint);
        }

        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
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
                        hint={!network.isOffline ? translate('distance.errors.selectSuggestedAddress') : ''}
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
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

WaypointEditor.displayName = 'WaypointEditor';
WaypointEditor.propTypes = propTypes;
WaypointEditor.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        transaction: {
            key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
            selector: (transaction) => (transaction ? {transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}} : null),
        },
    }),
)(WaypointEditor);
