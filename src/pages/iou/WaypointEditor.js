import React from 'react';
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

    route: PropTypes.shape({
        params: PropTypes.shape({
            /** IOU type */
            iouType: PropTypes.string,

            /** Index of the waypoint being edited */
            waypointIndex: PropTypes.string,
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
        },
    },
};

function WaypointEditor({transactionID, route: {params: {iouType = '', waypointIndex = ''} = {}} = {}, network, translate}) {
    const validate = (values) => {
        const errors = {};
        const waypointValue = values[`waypoint${waypointIndex}`] || '';

        // If the user is offline, they can enter any address they want, so we validate it this way
        if (network.isOffline && !ValidationUtils.isValidAddress(waypointValue)) {
            errors[`waypoint${waypointIndex}`] = 'bankAccount.error.address';
        }

        return errors;
    };

    const onSubmit = (values) => {
        const waypointValue = values[`waypoint${waypointIndex}`] || '';

        // Prevent the user from submitting the form if they are online
        // The only way is to select an address from the auto-complete
        if (!network.isOffline && waypointValue !== '') {
            return;
        }

        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            Transaction.saveWaypoint(transactionID, waypointIndex, null);
        }

        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (network.isOffline && waypointValue) {
            const waypoint = {
                address: waypointValue,
            };

            Transaction.saveWaypoint(transactionID, waypointIndex, waypoint);
        }

        Navigation.navigate(ROUTES.getMoneyRequestDistanceTabRoute(iouType));
    };

    const selectWaypoint = (values) => {
        const waypoint = {
            lat: values.lat,
            lng: values.lng,
            address: values.address,
        };

        Transaction.saveWaypoint(transactionID, waypointIndex, waypoint);
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
                submitButtonText={translate('common.save')}
            >
                <View>
                    <AddressSearch
                        inputID={`waypoint${waypointIndex}`}
                        hint={!network.isOffline ? translate('distance.errors.selectSuggestedAddress') : ''}
                        containerStyles={[styles.mt4]}
                        label={translate('distance.address')}
                        shouldSaveDraft
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
export default compose(withLocalize, withNetwork(), withOnyx({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => (iou && iou.transactionID) || ''},
}))(WaypointEditor);
