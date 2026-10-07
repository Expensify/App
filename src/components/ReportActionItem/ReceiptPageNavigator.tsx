import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

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
    const styles = useThemeStyles();
    const theme = useTheme();
    const {hovered, bind} = useHover();

    // Static: icon color. Hover: text color, to read as more prominent/active. Disabled: icon color, dimmed.
    const iconFill = !isDisabled && hovered ? theme.text : theme.icon;

    return (
        <Tooltip
            text={label}
            shouldRender={!isDisabled}
        >
            {/* A real tap target around the glyph: react-native-web's Pressable doesn't support hitSlop */}
            <PressableWithoutFeedback
                style={[styles.receiptPageNavigatorButton, isDisabled && styles.opacitySemiTransparent]}
                disabled={isDisabled}
                onPress={onPress}
                accessibilityLabel={label}
                role={CONST.ROLE.BUTTON}
                sentryLabel={sentryLabel}
                {...bind}
            >
                <Icon
                    src={icon}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                    fill={iconFill}
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
    const labelStyle = [styles.badgeText, styles.textStrong, styles.badgeDefaultText, styles.textNoWrap, styles.receiptPageNavigatorLabel];

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
            <Text style={labelStyle}>{translate('receipt.pageCount', {page, pageCount})}</Text>
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
