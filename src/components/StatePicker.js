import React, {useState, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import useNavigationStorage from '../hooks/useNavigationStorage';
import compose from '../libs/compose';
import withNavigation from './withNavigation';
import sizes from '../styles/variables';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Current State from user address  */
    stateISO: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Default value to display */
    defaultValue: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    stateISO: '',
    errorText: '',
    defaultValue: '',
};

function BaseStatePicker(props) {
    const route = useRoute();
    const defaultValue = props.defaultValue;
    const [collect] = useNavigationStorage(props.inputID, defaultValue);
    const stateISO = props.stateISO;
    const paramStateISO = collect();
    const [stateTitle, setStateTitle] = useState(stateISO || paramStateISO);
    const onInputChange = props.onInputChange;
    const translate = props.translate;

    useFocusEffect(
        useCallback(() => {
            const collectedState = collect();
            if (collectedState && collectedState !== stateTitle) {
                setStateTitle(collectedState);
                // Needed to call onInputChange, so Form can update the validation and values
                onInputChange(paramStateISO);
            }
            // onInputChange isn't a stable function, so we can't add it to the dependency array
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collect, stateTitle]),
    );

    const navigateToCountrySelector = useCallback(() => {
        // Try first using the route.path so I can keep any query params
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(stateTitle || stateISO, props.inputID, route.path || Navigation.getActiveRoute()));
    }, [stateTitle, stateISO, route.path, props.inputID]);

    const title = useMemo(() => {
        const allStates = translate('allStates');
        if (!stateTitle) {
            return defaultValue ? allStates[defaultValue].stateName : '';
        }
        if (allStates[stateTitle]) {
            return allStates[stateTitle].stateName;
        }

        return stateTitle;
    }, [translate, stateTitle, defaultValue]);
    const descStyle = title.length === 0 ? {fontSize: sizes.fontSizeNormal} : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                shouldShowRightIcon
                title={title}
                description={props.translate('common.state')}
                descriptionTextStyle={descStyle}
                onPress={navigateToCountrySelector}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={props.errorText} />
            </View>
        </View>
    );
}

BaseStatePicker.propTypes = propTypes;
BaseStatePicker.defaultProps = defaultProps;

const StatePicker = React.forwardRef((props, ref) => (
    <BaseStatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

StatePicker.displayName = 'StatePicker';

export default compose(withLocalize, withNavigation)(StatePicker);
