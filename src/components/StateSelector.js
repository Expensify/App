import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import styles from '@styles/styles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useLocalize from '@hooks/useLocalize';
import useGeographicalStateFromRoute from '@hooks/useGeographicalStateFromRoute';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import FormHelpMessage from './FormHelpMessage';
import refPropTypes from './refPropTypes';

const propTypes = {
    /** Form error text. e.g when no country is selected */
    errorText: PropTypes.string,

    /** Callback called when the country changes. */
    onInputChange: PropTypes.func.isRequired,

    /** Current selected country  */
    value: PropTypes.string,

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: PropTypes.string.isRequired,

    /** React ref being forwarded to the MenuItemWithTopDescription */
    forwardedRef: refPropTypes,

    /** Label of state in the url */
    queryParam: PropTypes.string,

    /** Label to display on field */
    label: PropTypes.string,

    /** whether to use state from url, for cases when url value is passed from parent */
    shouldUseStateFromUrl: PropTypes.bool,
};

const defaultProps = {
    errorText: '',
    value: undefined,
    forwardedRef: () => {},
    label: undefined,
    queryParam: 'state',
    shouldUseStateFromUrl: true,
};

function StateSelector({errorText, shouldUseStateFromUrl, value: stateCode, label, queryParam, onInputChange, forwardedRef}) {
    const {translate} = useLocalize();

    const stateFromUrl = useGeographicalStateFromRoute(queryParam);

    const [stateToDisplay, setStateToDisplay] = useState('');

    useEffect(() => {
        if (!shouldUseStateFromUrl || !stateFromUrl) {
            return;
        }

        // This will cause the form to revalidate and remove any error related to country name
        onInputChange(stateFromUrl);
        setStateToDisplay(stateFromUrl);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateFromUrl, shouldUseStateFromUrl]);

    useEffect(() => {
        if (!stateCode) {
            return;
        }

        // This will cause the form to revalidate and remove any error related to country name
        onInputChange(stateCode);
        setStateToDisplay(stateCode);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateCode]);

    const title = stateToDisplay && _.keys(COMMON_CONST.STATES).includes(stateToDisplay) ? translate(`allStates.${stateToDisplay}.stateName`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                descriptionTextStyle={descStyle}
                ref={forwardedRef}
                shouldShowRightIcon
                title={title}
                description={label || translate('common.state')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRoute();
                    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS_STATE.getRoute(stateCode, activeRoute, label, queryParam));
                }}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
}

StateSelector.propTypes = propTypes;
StateSelector.defaultProps = defaultProps;
StateSelector.displayName = 'StateSelector';

const StateSelectorWithRef = React.forwardRef((props, ref) => (
    <StateSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

StateSelectorWithRef.displayName = 'StateSelectorWithRef';

export default StateSelectorWithRef;
