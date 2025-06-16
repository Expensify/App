import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchFiltersExportedPageValues} from '.';

type RootViewProps = {
    value: SearchFiltersExportedPageValues;
    applyChanges: () => void;
    resetChanges: () => void;
    setView: (view: SearchDateModifier) => void;
    setValue: (key: SearchDateModifier, value: string | null) => void;
};

function SearchFiltersExportedRootView({value, applyChanges, resetChanges, setView, setValue}: RootViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const unformattedDateOn = value?.[CONST.SEARCH.DATE_MODIFIERS.ON];
    const unformattedDateAfter = value?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const unformattedDateBefore = value?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

    const dateAfter = unformattedDateAfter ?? undefined;
    const dateBefore = unformattedDateBefore ?? undefined;

    // We only want to show the date selected if there is a DATE
    const dateOn = useMemo(() => {
        if (!unformattedDateOn || unformattedDateOn === CONST.SEARCH.NEVER) {
            return undefined;
        }

        return unformattedDateOn;
    }, [unformattedDateOn]);

    return (
        <ScreenWrapper
            testID={SearchFiltersExportedRootView.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.exported')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />

            <SingleSelectListItem
                showTooltip
                item={{
                    text: translate(`common.never`),
                    isSelected: unformattedDateOn === CONST.SEARCH.NEVER,
                }}
                onSelectRow={() => setValue(CONST.SEARCH.DATE_MODIFIERS.ON, CONST.SEARCH.NEVER)}
            />

            <View>
                <MenuItem
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    title={translate('common.on')}
                    description={dateOn}
                    onPress={() => setView(CONST.SEARCH.DATE_MODIFIERS.ON)}
                />
                <MenuItem
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    title={translate('common.after')}
                    description={dateAfter}
                    onPress={() => setView(CONST.SEARCH.DATE_MODIFIERS.AFTER)}
                />
                <MenuItem
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    title={translate('common.before')}
                    description={dateBefore}
                    onPress={() => setView(CONST.SEARCH.DATE_MODIFIERS.BEFORE)}
                />
            </View>

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

SearchFiltersExportedRootView.displayName = 'SearchFiltersExportedRootView';

export default SearchFiltersExportedRootView;
