import Button from '@components/ButtonComposed';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {TextInputFilterContentProps} from './AdvancedFilters/TextInputFilterContent';
import type {ListFilterContentProps} from './ListFilterContent';

type NegatableFilterProps = React.PropsWithChildren & {
    isNegated: boolean;
    baseFilterKey: ListFilterContentProps['baseFilterKey'] | TextInputFilterContentProps['baseFilterKey'];
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
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => onNegationChange(false)}
                    >
                        <Button.Text style={[isNegated ? styles.textMicroBoldSupporting : undefined]}>{positive}</Button.Text>
                    </Button>
                    <Button
                        style={[styles.flex1]}
                        innerStyles={[isNegated ? undefined : styles.bgTransparent]}
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => onNegationChange(true)}
                    >
                        <Button.Text style={[isNegated ? undefined : styles.textMicroBoldSupporting]}>{negative}</Button.Text>
                    </Button>
                </View>
            </View>
            {children}
        </View>
    );
}

export default NegatableFilter;
