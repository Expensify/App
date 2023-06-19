import React, {useCallback, useRef, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import sizes from '../styles/variables';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** The ISO code of the country */
    countryISO: PropTypes.string,

    /** The ISO selected from CountrySelector */
    selectedCountryISO: PropTypes.string,

    /** Form Error description */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    countryISO: '',
    selectedCountryISO: undefined,
    errorText: '',
};

function BaseCountryPicker(props) {
    const countryTitle = useRef({title: '', iso: ''});
    const countryISO = props.countryISO;
    const selectedCountryISO = props.selectedCountryISO;
    const onInputChange = props.onInputChange;

    useEffect(() => {
        if (!selectedCountryISO || selectedCountryISO === countryTitle.current.iso) {
            return;
        }
        countryTitle.current = {title: PersonalDetails.getCountryNameBy(selectedCountryISO || countryISO), iso: selectedCountryISO || countryISO};

        // Needed to call onInputChange, so Form can update the validation and values
        onInputChange(countryTitle.current.iso);
    }, [countryISO, selectedCountryISO, onInputChange]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getCountrySelectionRoute(selectedCountryISO || countryISO, Navigation.getActiveRoute()));
    }, [countryISO, selectedCountryISO]);
    const descStyle = countryTitle.current.title.length === 0 ? {fontSize: sizes.fontSizeNormal} : null;
    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                shouldShowRightIcon
                title={countryTitle.current.title}
                descriptionTextStyle={descStyle}
                description={props.translate('common.country')}
                onPress={navigateToCountrySelector}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={props.errorText} />
            </View>
        </View>
    );
}

BaseCountryPicker.propTypes = propTypes;
BaseCountryPicker.defaultProps = defaultProps;

const CountryPicker = React.forwardRef((props, ref) => (
    <BaseCountryPicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

CountryPicker.displayName = 'CountryPicker';

export default withLocalize(CountryPicker);
