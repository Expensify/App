import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ReceiptPageNavigatorProps = {
    /** The 1-indexed page currently shown */
    page: number;

    /** Total number of pages in the receipt */
    pageCount: number;

    /** Called with the page to show when a navigation button is pressed */
    onChangePage: (page: number) => void;
};

/** "Page X of N" pill with previous/next buttons for flipping through a multi-page PDF receipt. */
function ReceiptPageNavigator({page, pageCount, onChangePage}: ReceiptPageNavigatorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
    const isFirstPage = page <= 1;
    const isLastPage = page >= pageCount;

    return (
        <View
            style={styles.receiptPageNavigator}
            dataSet={{[CONST.RECEIPT.HOVER_ZOOM_EXCLUDED_ELEMENT]: true}}
        >
            <Tooltip text={translate('common.previous')}>
                <PressableWithoutFeedback
                    disabled={isFirstPage}
                    onPress={() => onChangePage(page - 1)}
                    accessibilityLabel={translate('common.previous')}
                    role={CONST.ROLE.BUTTON}
                    sentryLabel={CONST.SENTRY_LABEL.RECEIPT.PREVIOUS_PAGE_BUTTON}
                >
                    <Icon
                        src={icons.BackArrow}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        fill={isFirstPage ? theme.icon : theme.text}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
            <Text style={[styles.badgeText, styles.textStrong, styles.badgeDefaultText]}>{translate('receipt.pageCount', {page, pageCount})}</Text>
            <Tooltip text={translate('common.next')}>
                <PressableWithoutFeedback
                    disabled={isLastPage}
                    onPress={() => onChangePage(page + 1)}
                    accessibilityLabel={translate('common.next')}
                    role={CONST.ROLE.BUTTON}
                    sentryLabel={CONST.SENTRY_LABEL.RECEIPT.NEXT_PAGE_BUTTON}
                >
                    <Icon
                        src={icons.ArrowRight}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        fill={isLastPage ? theme.icon : theme.text}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
        </View>
    );
}

export default ReceiptPageNavigator;
