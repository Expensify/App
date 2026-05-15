import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import Text from '@components/Text';
import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchPageFooterProps = {
    count: number | undefined;
    total: number | undefined;
    currency: string | undefined;
    defaultCurrency: string | undefined;
    isTotalLoading: boolean;
    onCurrencyChange: (currency: string | undefined) => void;
};

const TOTAL_SKELETON_WIDTH = 72;
const TOTAL_SKELETON_HEIGHT = 8;

function SearchPageFooter({count, total, currency, defaultCurrency, isTotalLoading, onCurrencyChange}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {convertToDisplayString, getCurrencySymbol} = useCurrencyListActions();
    const {currencyList} = useCurrencyListState();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);
    const currencyOptions = useMemo(() => getCurrencyOptions(currencyList, getCurrencySymbol), [currencyList, getCurrencySymbol]);
    const selectedCurrencyOption = useMemo(() => currencyOptions.find((option) => option.value === currency), [currencyOptions, currency]);

    const handleCurrencyChange = useCallback(
        (item: SingleSelectItem<string> | undefined) => {
            const nextCurrency = item?.value ?? defaultCurrency;
            if (!nextCurrency) {
                return;
            }
            onCurrencyChange(nextCurrency === defaultCurrency ? undefined : nextCurrency);
        },
        [defaultCurrency, onCurrencyChange],
    );

    const renderCurrencyPopup = useCallback(
        ({closeOverlay, isExpanded}: {closeOverlay: () => void; isExpanded: boolean}) => (
            <SingleSelectPopup
                items={currencyOptions}
                value={selectedCurrencyOption}
                closeOverlay={closeOverlay}
                onChange={handleCurrencyChange}
                isSearchable
                searchPlaceholder={translate('common.search')}
                defaultValue={defaultCurrency}
                shouldShowList={isExpanded}
            />
        ),
        [currencyOptions, defaultCurrency, handleCurrencyChange, selectedCurrencyOption, translate],
    );

    const totalButton: DropdownButtonProps['ButtonComponent'] = useCallback(
        (props) => (
            <PressableWithFeedback
                ref={props.ref}
                accessibilityLabel={translate('common.totalSpend')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                hoverStyle={styles.buttonHoveredBG}
                disabled={isTotalLoading}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY}
                onPress={props.onPress}
            >
                {isTotalLoading ? (
                    <SkeletonViewContentLoader
                        animate
                        width={TOTAL_SKELETON_WIDTH}
                        height={TOTAL_SKELETON_HEIGHT}
                        backgroundColor={theme.skeletonLHNIn}
                        foregroundColor={theme.skeletonLHNOut}
                    >
                        <SkeletonRect
                            width={TOTAL_SKELETON_WIDTH}
                            height={TOTAL_SKELETON_HEIGHT}
                        />
                    </SkeletonViewContentLoader>
                ) : (
                    <Text style={valueTextStyle}>{convertToDisplayString(total, currency)}</Text>
                )}
                <Icon
                    src={icons.DownArrow}
                    fill={theme.icon}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                />
            </PressableWithFeedback>
        ),
        [convertToDisplayString, currency, icons.DownArrow, isTotalLoading, styles, theme, total, translate, valueTextStyle],
    );

    return (
        <View
            style={[
                shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd,
                styles.borderTop,
                styles.ph5,
                styles.pv3,
                styles.flexRow,
                styles.gap3,
                StyleUtils.getBackgroundColorStyle(theme.appBG),
            ]}
        >
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.expenses')}:`}</Text>
                <Text style={valueTextStyle}>{count}</Text>
            </View>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                <DropdownButton
                    label={translate('common.currency')}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_GROUP_CURRENCY}
                    value={currency ?? null}
                    PopoverComponent={renderCurrencyPopup}
                    ButtonComponent={totalButton}
                />
            </View>
        </View>
    );
}

export default SearchPageFooter;
