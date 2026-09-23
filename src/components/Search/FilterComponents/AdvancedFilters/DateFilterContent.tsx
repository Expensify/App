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

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useRef} from 'react';

type DateFilterContentProps = {
    baseFilterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    selectedDateModifier: SearchDateModifier | null;
    hasFeed: boolean;
    size?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;
    style?: StyleProp<ViewStyle>;
    onDateModifierSelected: (modifier: SearchDateModifier | null) => void;
    onChange: (values: SearchDateValues) => void;
};

function DateFilterContent({baseFilterKey, value, selectedDateModifier, hasFeed, size, style, onDateModifierSelected, onChange}: DateFilterContentProps) {
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
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={size}
                    onPress={() => dateFilterRef.current?.save()}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.apply')}</Button.Text>
                </Button>
            )}
        </>
    );
}

export default DateFilterContent;
export type {DateFilterContentProps};
