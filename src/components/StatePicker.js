import lodashGet from 'lodash/get';
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import withNavigation from './withNavigation';
import sizes from '../styles/variables';
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
    const stateISO = props.stateISO;
    const [stateTitle, setStateTitle] = useState(stateISO);
    const paramStateISO = lodashGet(route, 'params.stateISO');
    const navigation = props.navigation;
    const onInputChange = props.onInputChange;
    const defaultValue = props.defaultValue;
    const translate = props.translate;

    useEffect(() => {
        if (!paramStateISO || paramStateISO === stateTitle) {
            return;
        }

        setStateTitle(paramStateISO);

        // Needed to call onInputChange, so Form can update the validation and values
        onInputChange(paramStateISO);

        navigation.setParams({stateISO: null});
    }, [paramStateISO, stateTitle, onInputChange, navigation]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(stateTitle || stateISO, Navigation.getActiveRoute()));
    }, [stateTitle, stateISO]);

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
            <FormHelpMessage message={props.errorText} />
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
