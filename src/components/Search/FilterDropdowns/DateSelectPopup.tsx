import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type DateSelectPopupProps = {
    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;
};

const DATE_VIEWS = {
    ON: 'on' as const,
    BEFORE: 'before' as const,
    AFTER: 'after' as const,
};

function DateSelectPopup({closeOverlay}: DateSelectPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [dateType, setDateType] = useState<ValueOf<typeof DATE_VIEWS> | null>(null);

    return (
        <View style={[styles.pv4, styles.gap2]}>
            {/* Initial View */}
            {!dateType && (
                <>
                    {Object.values(DATE_VIEWS).map((view) => (
                        <MenuItem
                            shouldShowRightIcon
                            onPress={() => setDateType(view)}
                            title={translate(`common.${view}`)}
                        />
                    ))}

                    <Button
                        medium
                        style={[styles.flex1, styles.ph5]}
                        text={translate('common.reset')}
                    />
                </>
            )}

            {/* Date Picker View */}
        </View>
    );
}

DateSelectPopup.displayName = 'DateSelectPopup';
export default DateSelectPopup;
