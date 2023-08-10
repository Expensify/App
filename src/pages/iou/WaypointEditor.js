import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
import DistanceRequest from '../../libs/actions/DistanceRequest';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ROUTES from '../../ROUTES';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            waypointIndex: PropTypes.string,
            transactionID: PropTypes.string,
        }),
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            waypointIndex: '',
            transactionID: '',
        },
    },
};

function WaypointEditor(props) {
    const waypointIndex = lodashGet(props.route.params, 'waypointIndex');
    const transactionID = lodashGet(props.route.params, 'transactionID');
    const iouType = lodashGet(props.route.params, 'iouType');

    const validate = (values) => {
        const errors = {};

        // The address can only be empty (removes the value), or auto-selected which goes through the onPress method
        const waypointValue = values[`waypoint${waypointIndex}`];
        if (!props.network.isOffline && waypointValue) {
            errors[`waypoint${waypointIndex}`] = 'distance.errors.selectSuggestedAddress';
        }

        // When the user is offline, we can't use auto-complete to validate the address so we will just save the address
        // Otherwise, we require the user to select an address from the auto-complete
        if (props.network.isOffline && waypointValue && ValidationUtils.isValidAddress(waypointValue)) {
            errors[`waypoint${waypointIndex}`] = 'bankAccount.error.address';
        }

        return errors;
    };

    const onSubmit = (values) => {
        // Allows letting you set a waypoint to an empty value
        if (!values[`waypoint${waypointIndex}`]) {
            DistanceRequest.saveWaypoint(transactionID, waypointIndex, null);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (props.network.isOffline && values[`waypoint${waypointIndex}`]) {
            const waypoint = {
                address: values[`waypoint${waypointIndex}`],
            };

            DistanceRequest.saveWaypoint(transactionID, waypointIndex, waypoint);
        }

        Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    const onPress = (values) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
        };

        DistanceRequest.saveWaypoint(transactionID, waypointIndex, waypoint);
        Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Waypoint Editor"
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
                }}
            />
            <Form
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.WAYPOINT_FORM}
                enabledWhenOffline
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText=""
                isSubmitButtonVisible={false}
            >
                <View>
                    <AddressSearch
                        inputID={`waypoint${waypointIndex}`}
                        containerStyles={[styles.mt4]}
                        label={props.translate('distance.address')}
                        shouldSaveDraft
                        onPress={onPress}
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
export default compose(withLocalize, withNetwork(), withOnyx({}))(WaypointEditor);
