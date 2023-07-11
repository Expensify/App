import React, {useCallback, useMemo, useEffect} from 'react';
import {View} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import useNavigationStorage from '../hooks/useNavigationStorage';
import styles from '../styles/styles';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import useLocalize from '../hooks/useLocalize';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Error text to display */
    errorText: PropTypes.string,

    /** Default value to display */
    defaultValue: PropTypes.string,

    /** State to display */
    // eslint-disable-next-line react/require-default-props
    value: PropTypes.string,

    /** ID of the input */
    inputID: PropTypes.string.isRequired,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    errorText: '',
    defaultValue: '',
    onInputChange: () => {},
};

const StatePicker = React.forwardRef(({value, defaultValue, inputID, errorText, onInputChange}, ref) => {
    const route = useRoute();
    const {translate} = useLocalize();
    const formValue = value || defaultValue || '';
    const [collect, save] = useNavigationStorage(inputID, formValue);

    useEffect(() => {
        const collectedState = collect();
        if (!formValue || collectedState === formValue) {
            return;
        }
        save(formValue);
    }, [formValue, collect, save]);

    useFocusEffect(
        useCallback(() => {
            const collectedState = collect();
            if (collectedState && collectedState !== formValue) {
                save(collectedState);
                // Needed to call onInputChange, so Form can update the validation and values
                onInputChange(collectedState);
            }
            // onInputChange isn't a stable function, so we can't add it to the dependency array
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collect, formValue]),
    );

    const navigateToCountrySelector = () => {
        // Try first using the route.path so I can keep any query params
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(inputID, route.path || Navigation.getActiveRoute()));
    };

    const title = useMemo(() => {
        const allStates = translate('allStates');

        if (allStates[formValue]) {
            return allStates[formValue].stateName;
        }

        return '';
    }, [translate, formValue]);

    const descStyle = title.length === 0 ? styles.addressPickerDescription : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={title}
                description={translate('common.state')}
                descriptionTextStyle={descStyle}
                onPress={navigateToCountrySelector}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
});

StatePicker.propTypes = propTypes;
StatePicker.defaultProps = defaultProps;
StatePicker.displayName = 'StatePicker';

export default StatePicker;
