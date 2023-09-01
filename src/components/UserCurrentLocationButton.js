import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {Text} from 'react-native';
import getCurrentPosition from '../libs/getCurrentPosition';
import * as User from '../libs/actions/User';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import LocationErrorMessage from './LocationErrorMessage';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import colors from '../styles/colors';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** Callback that runs when location data is fetched */
    onLocationFetched: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {};

function UserCurrentLocationButton({onLocationFetched, translate}) {
    const isFetchingLocation = useRef(false);

    /**
     * handles error when failed to get user's current location
     * @param {Object} errorData
     * @param {Number} errorData.code
     */
    const onError = (errorData) => {
        isFetchingLocation.current = false;

        User.setLocationError(errorData.code);
    };

    /**
     * handles success after getting user's current location
     * @param {Object} successData
     * @param {Object} successData.coords
     * @param {Number} successData.coords.longitude
     * @param {Number} successData.coords.latitude
     * @param {Number} successData.timestamp
     */
    const onSuccess = (successData) => {
        isFetchingLocation.current = false;

        User.clearLocationError();

        onLocationFetched(successData);
    };

    /** Gets the user's current location and registers success/error callbacks */
    const useCurrentLocation = () => {
        if (isFetchingLocation.current) return;

        isFetchingLocation.current = true;

        getCurrentPosition(onSuccess, onError);
    };

    useEffect(() => {
        // clear location errors on mount
        User.clearLocationError();
    }, []);

    return (
        <>
            <PressableWithFeedback
                style={[styles.flexRow, styles.mt4]}
                onPress={useCurrentLocation}
                accessibilityLabel={translate('location.useCurrent')}
            >
                <Icon
                    src={Expensicons.Location}
                    fill={colors.green}
                />
                <Text style={[styles.textLabel, styles.mh2]}>{translate('location.useCurrent')}</Text>
            </PressableWithFeedback>
            <LocationErrorMessage />
        </>
    );
}

UserCurrentLocationButton.displayName = 'UserCurrentLocationButton';
UserCurrentLocationButton.propTypes = propTypes;
UserCurrentLocationButton.defaultProps = defaultProps;
export default withLocalize(UserCurrentLocationButton);
