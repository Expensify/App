import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {useEffect, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import useGeographicalStateFromRoute from '@hooks/useGeographicalStateFromRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MaybePhraseKey} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import FormHelpMessage from './FormHelpMessage';
import type {MenuItemProps} from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type State = keyof typeof COMMON_CONST.STATES;

type StateSelectorProps = {
    /** Form error text. e.g when no country is selected */
    errorText?: MaybePhraseKey;

    /** Current selected state  */
    value?: State;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    /** Label to display on field */
    label?: string;

    /** Any additional styles to apply */
    wrapperStyle?: MenuItemProps['wrapperStyle'];

    /** whether to use state from url, for cases when url value is passed from parent */
    shouldUseStateFromUrl?: boolean;
};

function StateSelector({errorText, shouldUseStateFromUrl = true, value: stateCode, label, onInputChange, wrapperStyle}: StateSelectorProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const stateFromUrl = useGeographicalStateFromRoute();
    const [stateToDisplay, setStateToDisplay] = useState<State | ''>('');

    useEffect(() => {
        if (!shouldUseStateFromUrl || !stateFromUrl) {
            return;
        }

        // This will cause the form to revalidate and remove any error related to country name
        if (onInputChange) {
            onInputChange(stateFromUrl);
        }
        setStateToDisplay(stateFromUrl);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateFromUrl, shouldUseStateFromUrl]);

    useEffect(() => {
        if (!stateCode) {
            return;
        }

        if (onInputChange) {
            // This will cause the form to revalidate and remove any error related to state name
            onInputChange(stateCode);
        }
        setStateToDisplay(stateCode);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateCode]);

    const title = stateToDisplay && Object.keys(COMMON_CONST.STATES).includes(stateToDisplay) ? translate(`allStates.${stateToDisplay}.stateName`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                descriptionTextStyle={descStyle}
                ref={ref}
                shouldShowRightIcon
                title={title}
                // Label can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                description={label || translate('common.state')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRoute();
                    // @ts-expect-error Navigation.navigate does take a param
                    Navigation.navigate(ROUTES.SETTINGS_ADDRESS_STATE.getRoute(stateCode, activeRoute, label));
                }}
                wrapperStyle={wrapperStyle}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
}

StateSelector.displayName = 'StateSelector';

export default React.forwardRef(StateSelector);
