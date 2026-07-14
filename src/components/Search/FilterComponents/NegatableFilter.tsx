import Button from '@components/Button';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {FilterComponentsProps} from '.';
import type {TextInputFilterContentProps} from './AdvancedFilters/TextInputFilterContent';

type NegatableFilterProps = React.PropsWithChildren & {
    isNegated: boolean;
    baseFilterKey: FilterComponentsProps['baseFilterKey'] | TextInputFilterContentProps['baseFilterKey'];
    style?: StyleProp<ViewStyle>;
    onNegationChange: (isNegated: boolean) => void;
};

function NegatableFilter({baseFilterKey, isNegated, children, style, onNegationChange}: NegatableFilterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    if (!isFilterNegatable(baseFilterKey)) {
        return children;
    }

    const positive = translate(baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS ? 'search.filters.filterType.has.positive' : 'search.filters.filterType.is.positive');
    const negative = translate(baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS ? 'search.filters.filterType.has.negative' : 'search.filters.filterType.is.negative');

    return (
        <View style={[styles.flex1, styles.gap3, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.gap2]}>
                <Text style={[styles.textLabelSupporting]}>{translate('search.filters.filterType.label')}</Text>
                <View style={[styles.border, styles.negatableFilterButtons]}>
                    <Button
                        style={[styles.flex1]}
                        innerStyles={[isNegated ? styles.bgTransparent : undefined]}
                        small
                        text={positive}
                        textStyles={[isNegated ? styles.textMicroBoldSupporting : undefined]}
                        onPress={() => onNegationChange(false)}
                    />
                    <Button
                        style={[styles.flex1]}
                        innerStyles={[isNegated ? undefined : styles.bgTransparent]}
                        small
                        text={negative}
                        textStyles={[isNegated ? undefined : styles.textMicroBoldSupporting]}
                        onPress={() => onNegationChange(true)}
                    />
                </View>
            </View>
            {children}
        </View>
    );
}

export default NegatableFilter;
