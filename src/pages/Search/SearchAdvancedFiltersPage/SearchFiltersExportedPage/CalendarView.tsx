import React, {useState} from 'react';
import Button from '@components/Button';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

type CalendarViewProps = {
    view: SearchDateModifier;
    value: string | null;
    navigateBack: () => void;
    setValue: (key: SearchDateModifier, value: string | null) => void;
};

function SearchFiltersExportedCalendarView({view, value, navigateBack, setValue}: CalendarViewProps) {
    const initialValue = value === CONST.SEARCH.NEVER ? null : value;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [localDateValue, setLocalDateValue] = useState(initialValue);

    const lowerDateModifier = view.toLowerCase() as SearchDateModifierLower;

    const resetChanges = () => {
        setValue(view, null);
        navigateBack();
    };

    const applyChanges = () => {
        setValue(view, localDateValue);
        navigateBack();
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersExportedCalendarView.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(`common.${lowerDateModifier}`)}
                onBackButtonPress={navigateBack}
            />

            <CalendarPicker
                value={localDateValue ?? undefined}
                onSelected={setLocalDateValue}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                minDate={CONST.CALENDAR_PICKER.MIN_DATE}
            />

            <FixedFooter style={styles.mtAuto}>
                <Button
                    large
                    style={[styles.mt4]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    large
                    success
                    pressOnEnter
                    style={[styles.mt4]}
                    text={translate('common.save')}
                    onPress={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFiltersExportedCalendarView.displayName = 'SearchFiltersExportedCalendarView';

export default SearchFiltersExportedCalendarView;
