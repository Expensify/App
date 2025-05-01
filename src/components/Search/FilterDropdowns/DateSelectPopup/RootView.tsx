import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
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

    return (
        <View style={[styles.pv4, styles.gap4]}>
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
