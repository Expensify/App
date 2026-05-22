import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SingleSelectItem} from './FilterComponents/SingleSelect';
import DropdownButton from './FilterDropdowns/DropdownButton';
import type {DropdownButtonProps} from './FilterDropdowns/DropdownButton';
import GroupCurrencyPopup from './FilterDropdowns/GroupCurrencyPopup';

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
type TotalButtonProps = React.ComponentProps<NonNullable<DropdownButtonProps['ButtonComponent']>>;

function SearchPageFooter({count, total, currency, defaultCurrency, isTotalLoading, onCurrencyChange}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

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

    const renderCurrencyPopup: DropdownButtonProps['PopoverComponent'] = useCallback(
        ({closeOverlay, isExpanded}) => (
            <GroupCurrencyPopup
                value={currency}
                closeOverlay={closeOverlay}
                onChange={handleCurrencyChange}
                searchPlaceholder={translate('common.search')}
                defaultValue={defaultCurrency}
                shouldShowList={isExpanded}
            />
        ),
        [currency, defaultCurrency, handleCurrencyChange, translate],
    );

    const totalButton: DropdownButtonProps['ButtonComponent'] = useCallback(
        (props: TotalButtonProps) => (
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
