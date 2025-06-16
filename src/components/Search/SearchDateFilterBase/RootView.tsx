import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDateFilterBaseProps, SearchFiltersDatePageValues} from '.';

type RootViewProps = Pick<SearchDateFilterBaseProps, 'titleKey'> & {
    value: SearchFiltersDatePageValues;
    applyChanges: () => void;
    resetChanges: () => void;
    setView: (view: SearchDateModifier) => void;
};

function SearchDateFilterBaseRootView({titleKey, value, applyChanges, resetChanges, setView}: RootViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const unformattedDateOn = value?.[CONST.SEARCH.DATE_MODIFIERS.ON];
    const unformattedDateAfter = value?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const unformattedDateBefore = value?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

    const dateOn = unformattedDateOn ?? undefined;
    const dateAfter = unformattedDateAfter ?? undefined;
    const dateBefore = unformattedDateBefore ?? undefined;

    return (
        <ScreenWrapper
            testID={SearchDateFilterBaseRootView.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
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

SearchDateFilterBaseRootView.displayName = 'SearchDateFilterBaseRootView';

export default SearchDateFilterBaseRootView;
