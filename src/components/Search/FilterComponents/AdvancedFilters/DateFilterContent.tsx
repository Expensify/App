import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDateFilterKeys} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateModifierTitle} from '@libs/SearchQueryUtils';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';

type DateFilterContentProps = {
    baseFilterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    selectedDateModifier: SearchDateModifier | null;
    hasFeed: boolean;
    largeButton?: boolean;
    style?: StyleProp<ViewStyle>;
    onDateModifierSelected: (modifier: SearchDateModifier | null) => void;
    onChange: (values: SearchDateValues) => void;
};

function DateFilterContent({baseFilterKey, value, selectedDateModifier, hasFeed, largeButton, style, onDateModifierSelected, onChange}: DateFilterContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const dateFilterRef = useRef<DateFilterBaseHandle>(null);

    return (
        <>
            {!!selectedDateModifier && (
                <HeaderWithBackButton
                    style={[styles.h10]}
                    subtitle={getDateModifierTitle(selectedDateModifier, '', translate)}
                    onBackButtonPress={() => dateFilterRef.current?.goBack()}
                />
            )}
            <DateFilterBase
                ref={dateFilterRef}
                style={style}
                shouldShowHeader={false}
                onDateValuesChange={(values) => {
                    if (selectedDateModifier) {
                        return;
                    }
                    onChange(values);
                }}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={onDateModifierSelected}
                defaultDateValues={value}
                presets={getDatePresets(baseFilterKey, hasFeed)}
                onSubmit={onChange}
                shouldShowActionButtons={false}
            />
            {!!selectedDateModifier && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3]}
                    text={translate('common.apply')}
                    success
                    large={largeButton}
                    pressOnEnter
                    onPress={() => dateFilterRef.current?.save()}
                />
            )}
        </>
    );
}

export default DateFilterContent;
export type {DateFilterContentProps};
