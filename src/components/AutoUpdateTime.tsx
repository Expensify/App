import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import type {Timezone} from '@src/types/onyx/PersonalDetails';

/**
 * Displays the user's local time and updates it every minute.
 * The time auto-update logic is extracted to this component to avoid re-rendering a more complex component, e.g. DetailsPage.
 */
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';

type AutoUpdateTimeProps = {
    /** Timezone of the user from their personal details */
    timezone: Timezone;
};

function AutoUpdateTime({timezone}: AutoUpdateTimeProps) {
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();

    const [, setTick] = useState(0);
    const minuteRef = useRef(new Date().getMinutes());
    const currentUserLocalTime = getLocalDateFromDatetime(undefined, timezone.selected);
    const timezoneName = timezone.selected ? DateUtils.getZoneAbbreviation(currentUserLocalTime, timezone.selected) : '';

    useEffect(() => {
        const interval = setInterval(() => {
            if (new Date().getMinutes() === minuteRef.current) {
                return;
            }
            setTick((t) => t + 1);
            minuteRef.current = new Date().getMinutes();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={[styles.w100, styles.detailsPageSectionContainer]}>
            <MenuItem.Root style={[styles.ph0]}>
                <MenuItemField.Row
                    name={translate('detailsPage.localTime')}
                    value={`${DateUtils.formatToLocalTime(currentUserLocalTime, dateFnsLocale)} ${timezoneName}`}
                />
            </MenuItem.Root>
        </View>
    );
}

export default AutoUpdateTime;
