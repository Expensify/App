import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {SearchQueryString} from '@components/Search/types';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

type InsightsDetailsSectionHeaderProps = {
    title: string;

    /** Spend page query the View all link opens, which hides the link when omitted */
    viewAllQuery?: SearchQueryString;

    viewAllSentryLabel: SentryLabel;
};

/** Title row of a Details panel section, with a View all link to the Spend page on the right. */
function InsightsDetailsSectionHeader({title, viewAllQuery, viewAllSentryLabel}: InsightsDetailsSectionHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpRight']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.p4, styles.borderBottom]}>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {title}
            </Text>
            {!!viewAllQuery && (
                <PressableWithoutFeedback
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: viewAllQuery}))}
                    accessibilityRole={CONST.ROLE.LINK}
                    accessibilityLabel={translate('insightsPage.viewAll')}
                    sentryLabel={viewAllSentryLabel}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                >
                    <Text
                        variant="label"
                        style={styles.link}
                    >
                        {translate('insightsPage.viewAll')}
                    </Text>
                    <Icon
                        src={icons.ArrowUpRight}
                        fill={theme.link}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                </PressableWithoutFeedback>
            )}
        </View>
    );
}

export default InsightsDetailsSectionHeader;
