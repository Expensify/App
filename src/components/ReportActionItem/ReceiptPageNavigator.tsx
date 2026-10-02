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
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {StyleSheet, View} from 'react-native';

const PAGE_BUTTON_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};

type PageButtonProps = {
    /** Arrow icon to show */
    icon: IconAsset;

    /** Tooltip and accessibility label */
    label: string;

    /** Whether the button can be pressed */
    isDisabled: boolean;

    /** Called when the button is pressed */
    onPress: () => void;

    /** Label used to identify the button in Sentry */
    sentryLabel: string;
};

function PageButton({icon, label, isDisabled, onPress, sentryLabel}: PageButtonProps) {
    const theme = useTheme();

    return (
        <Tooltip
            text={label}
            shouldRender={!isDisabled}
        >
            <PressableWithoutFeedback
                disabled={isDisabled}
                onPress={onPress}
                accessibilityLabel={label}
                role={CONST.ROLE.BUTTON}
                sentryLabel={sentryLabel}
                hitSlop={PAGE_BUTTON_HIT_SLOP}
            >
                <Icon
                    src={icon}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                    fill={isDisabled ? theme.icon : theme.text}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

type ReceiptPageNavigatorProps = {
    /** The 1-indexed page currently shown */
    page: number;

    /** Total number of pages in the receipt */
    pageCount: number;

    /** Whether the PDF is still loading, which keeps both buttons disabled */
    isLoading: boolean;

    /** Called with the page to show when a navigation button is pressed */
    onChangePage: (page: number) => void;
};

/** "Page X of N" pill with previous/next buttons for flipping through a multi-page PDF receipt. */
function ReceiptPageNavigator({page, pageCount, isLoading, onChangePage}: ReceiptPageNavigatorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
    const labelStyle = [styles.badgeText, styles.textStrong, styles.badgeDefaultText];

    return (
        <View
            style={styles.receiptPageNavigator}
            dataSet={{[CONST.RECEIPT.HOVER_ZOOM_EXCLUDED_ELEMENT]: true}}
        >
            <PageButton
                icon={icons.BackArrow}
                label={translate('common.previous')}
                isDisabled={isLoading || page <= CONST.RECEIPT.FIRST_PDF_PAGE}
                onPress={() => onChangePage(page - 1)}
                sentryLabel={CONST.SENTRY_LABEL.RECEIPT.PREVIOUS_PAGE_BUTTON}
            />
            {/* The hidden widest label reserves the pill's width, so the buttons stay put as the page number changes */}
            <View>
                <Text
                    style={[labelStyle, styles.opacity0]}
                    numberOfLines={1}
                    aria-hidden
                >
                    {translate('receipt.pageCount', {page: pageCount, pageCount})}
                </Text>
                <View style={[StyleSheet.absoluteFill, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Text
                        style={labelStyle}
                        numberOfLines={1}
                    >
                        {translate('receipt.pageCount', {page, pageCount})}
                    </Text>
                </View>
            </View>
            <PageButton
                icon={icons.ArrowRight}
                label={translate('common.next')}
                isDisabled={isLoading || page >= pageCount}
                onPress={() => onChangePage(page + 1)}
                sentryLabel={CONST.SENTRY_LABEL.RECEIPT.NEXT_PAGE_BUTTON}
            />
        </View>
    );
}

export default ReceiptPageNavigator;
