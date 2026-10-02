import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import type {PaymentHistoryRow} from '@libs/PaymentHistoryUtils';
import {getBadgeAppearance, getPaymentHistoryRows, getStateTranslationKey} from '@libs/PaymentHistoryUtils';

import {lineHeightScale} from '@styles/typography';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const SKELETON_ROWS = [0, 1, 2, 3];
const SKELETON_TITLE_WIDTH = 180;
const SKELETON_SUBTITLE_WIDTH = 120;

// The payment details page is a later change, so pressing a row does nothing yet.
function ignorePaymentRowPress() {}

function PaymentHistoryTable() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const [purchaseList] = useOnyx(ONYXKEYS.PURCHASE_LIST);
    const isLoading = purchaseList === undefined;
    const rows = getPaymentHistoryRows(purchaseList);

    return (
        <Section
            isCentralPane
            containerStyles={styles.borderRadiusComponentNormal}
            centralPaneContainerStyle={styles.p0}
            renderTitle={() => (
                <View style={[styles.p4, styles.borderBottom]}>
                    <Text
                        variant="micro"
                        style={[styles.textSupporting, styles.userSelectText]}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('subscription.paymentHistory.payments')}
                    </Text>
                </View>
            )}
        >
            {isLoading && <PaymentHistorySkeleton />}
            {!isLoading && rows.length === 0 && (
                <Text style={[styles.textNormal, styles.textSupporting, styles.userSelectText, styles.p4]}>{translate('subscription.paymentHistory.empty')}</Text>
            )}
            {!isLoading &&
                rows.map((row, index) => (
                    <PaymentHistoryTableRow
                        key={row.purchaseID}
                        row={row}
                        dateLabel={DateUtils.formatInUTCToLong(row.created, preferredLocale) || row.created}
                        shouldShowDivider={index < rows.length - 1}
                    />
                ))}
        </Section>
    );
}

type PaymentHistoryTableRowProps = {
    row: PaymentHistoryRow;
    dateLabel: string;
    shouldShowDivider: boolean;
};

function PaymentHistoryTableRow({row, dateLabel, shouldShowDivider}: PaymentHistoryTableRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const stateLabel = translate(getStateTranslationKey(row.state));
    const amountLabel = convertAmountToDisplayString(row.amount, row.currency);
    const activeUserLabel = row.activeUserCount ? translate('subscription.paymentHistory.activeUsers', {count: row.activeUserCount}) : undefined;
    const taxLabel = row.showsTax ? translate('subscription.paymentHistory.inclTax') : undefined;
    const {success, error} = getBadgeAppearance(row.state);

    return (
        <MenuItem.Root
            onPress={ignorePaymentRowPress}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_HISTORY_ROW}
            accessibilityLabel={[dateLabel, stateLabel, activeUserLabel, amountLabel, taxLabel].filter(Boolean).join(', ')}
            style={[styles.ph4, styles.pv4, shouldShowDivider && styles.borderBottom]}
        >
            <MenuItem.Row>
                <MenuItem.Content>
                    <Text
                        variant="text"
                        style={[styles.popoverMenuText, styles.userSelectText]}
                        numberOfLines={1}
                    >
                        {dateLabel}
                    </Text>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Badge
                            text={stateLabel}
                            success={success}
                            error={error}
                            isCondensed
                            badgeStyles={styles.ml0}
                            textStyles={styles.userSelectText}
                        />
                        {!!activeUserLabel && <Text style={[styles.textLabelSupporting, styles.userSelectText]}>{activeUserLabel}</Text>}
                    </View>
                </MenuItem.Content>
                <View style={[styles.menuItemTrailing, styles.gap3]}>
                    <View style={styles.alignItemsEnd}>
                        <Text
                            variant="text"
                            style={[styles.popoverMenuText, styles.userSelectText]}
                        >
                            {amountLabel}
                        </Text>
                        {!!taxLabel && <Text style={[styles.textLabelSupporting, styles.userSelectText]}>{taxLabel}</Text>}
                    </View>
                    <MenuItem.Chevron />
                </View>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

function PaymentHistorySkeleton() {
    const styles = useThemeStyles();

    return (
        <View style={[styles.gap4, styles.p4]}>
            {SKELETON_ROWS.map((row) => (
                <View
                    key={row}
                    style={styles.gap1}
                >
                    <SkeletonTextLine
                        lineHeight={lineHeightScale.text}
                        barWidth={SKELETON_TITLE_WIDTH}
                    />
                    <SkeletonTextLine
                        lineHeight={lineHeightScale.label}
                        barWidth={SKELETON_SUBTITLE_WIDTH}
                    />
                </View>
            ))}
        </View>
    );
}

export default PaymentHistoryTable;
