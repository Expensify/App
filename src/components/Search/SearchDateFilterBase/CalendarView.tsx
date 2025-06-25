import React, {useState} from 'react';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
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

function SearchDateFilterBaseCalendarView({view, value, navigateBack, setValue}: CalendarViewProps) {
    const initialValue = value === CONST.SEARCH.DATE_PRESETS.NEVER ? null : value;

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
            testID={SearchDateFilterBaseCalendarView.displayName}
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
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchDateFilterBaseCalendarView.displayName = 'SearchDateFilterBaseCalendarView';

export default SearchDateFilterBaseCalendarView;
