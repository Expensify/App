import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {DateSelectPopupValue} from '.';

type RootViewProps = {
    value: DateSelectPopupValue;
    applyChanges: () => void;
    resetChanges: () => void;
    setView: (view: ValueOf<typeof CONST.SEARCH.DATE_FILTERS>) => void;
};

function RootView({value, applyChanges, resetChanges, setView}: RootViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const label = translate('common.date');

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}

            <View>
                {Object.values(CONST.SEARCH.DATE_FILTERS).map((dateType) => {
                    const dateValue = value[dateType];
                    const description = dateValue ? DateUtils.extractDate(dateValue) : undefined;

                    return (
                        <MenuItem
                            shouldShowRightIcon
                            onPress={() => setView(dateType)}
                            title={translate(`common.${dateType}`)}
                            description={description}
                        />
                    );
                })}
            </View>

            <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

RootView.displayName = 'RootView';
export default RootView;
