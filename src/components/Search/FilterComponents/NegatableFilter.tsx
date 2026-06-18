import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import {NEGATABLE_FILTERS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchNegatableFilterKeys} from '../types';

type NegatableFilterProps = React.PropsWithChildren & {
    isNegated: boolean;
    baseFilterKey: SearchFilter['key'];
    style?: StyleProp<ViewStyle>;
    onNegationChange: (isNegated: boolean) => void;
};

function NegatableFilter({baseFilterKey, isNegated, children, style, onNegationChange}: NegatableFilterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    if (!NEGATABLE_FILTERS.has(baseFilterKey as SearchNegatableFilterKeys)) {
        return children;
    }

    const positive = translate(baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS ? 'search.filters.filterType.has.positive' : 'search.filters.filterType.is.positive');
    const negative = translate(baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS ? 'search.filters.filterType.has.negative' : 'search.filters.filterType.is.negative');

    const handleNegationChange = (isNegated: boolean) => {
        onNegationChange(isNegated);
    };

    return (
        <View style={[styles.flex1, styles.gap3, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.gap2]}>
                <Text style={[styles.textSupporting]}>{translate('search.filters.filterType.label')}</Text>
                <View style={[styles.border, styles.negatableFilterButtons]}>
                    <Button
                        style={[styles.flex1]}
                        innerStyles={[isNegated ? styles.bgTransparent : undefined]}
                        small
                        text={positive}
                        textStyles={[isNegated ? styles.textMicroBoldSupporting : undefined]}
                        onPress={() => handleNegationChange(false)}
                    />
                    <Button
                        style={[styles.flex1]}
                        innerStyles={[isNegated ? undefined : styles.bgTransparent]}
                        small
                        text={negative}
                        textStyles={[isNegated ? undefined : styles.textMicroBoldSupporting]}
                        onPress={() => handleNegationChange(true)}
                    />
                </View>
            </View>
            {children}
        </View>
    );
}

export default NegatableFilter;
