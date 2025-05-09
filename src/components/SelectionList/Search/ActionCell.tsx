import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethodType} from '@components/KYCWall/types';
import SettlementButton from '@components/SettlementButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {payMoneyRequest} from '@libs/actions/IOU';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    review: 'common.review',
    submit: 'common.submit',
    approve: 'iou.approve',
    pay: 'iou.pay',
    done: 'common.done',
    paid: 'iou.settledExpensify',
};

type ActionCellProps = {
    action?: SearchTransactionAction;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
    goToItem: () => void;
    isChildListItem?: boolean;
    parentAction?: string;
    isLoading?: boolean;
    policyID?: string;
    bankAccountRoute?: Route;
    reportID?: string;
};

function ActionCell({
    action = CONST.SEARCH.ACTION_TYPES.VIEW,
    isLargeScreenWidth = true,
    isSelected = false,
    goToItem,
    isChildListItem = false,
    parentAction = '',
    isLoading = false,
    policyID = '',
    bankAccountRoute = ROUTES.BANK_ACCOUNT as Route,
    reportID = '',
}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const text = isChildListItem ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);
    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});

    const confirmPayment = useCallback(
        (type: PaymentMethodType | undefined) => {
            if (!type || !chatReport) {
                return;
            }

            payMoneyRequest(type, chatReport, iouReport);
        },
        [chatReport, iouReport],
    );

    if ((parentAction !== CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID) || (action === CONST.SEARCH.ACTION_TYPES.DONE && !isChildListItem)) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    text={text}
                    icon={action === CONST.SEARCH.ACTION_TYPES.DONE ? Expensicons.Checkbox : Expensicons.Checkmark}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                    textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                    iconStyles={styles.mr0}
                    success
                />
            </View>
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.REVIEW || shouldUseViewAction || (action === CONST.SEARCH.ACTION_TYPES.DONE && isChildListItem)) {
        const buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};

        return isLargeScreenWidth ? (
            <Button
                text={text}
                onPress={goToItem}
                small
                style={[styles.w100]}
                innerStyles={buttonInnerStyles}
                link={isChildListItem}
                shouldUseDefaultHover={!isChildListItem}
                icon={!isChildListItem && action === CONST.SEARCH.ACTION_TYPES.REVIEW ? Expensicons.DotIndicator : undefined}
                iconFill={theme.danger}
                iconHoverFill={theme.dangerHover}
                isNested
            />
        ) : null;
    }

    if (action === CONST.SEARCH.ACTION_TYPES.PAY) {
        return (
            <SettlementButton
                shouldUseShortForm
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                currency={iouReport?.currency}
                policyID={policyID}
                iouReport={iouReport}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                onPress={confirmPayment}
                style={[styles.w100]}
                shouldShowPersonalBankAccountOption={!policyID}
            />
        );
    }

    return (
        <Button
            text={text}
            onPress={goToItem}
            small
            style={[styles.w100]}
            isLoading={isLoading}
            success
            isDisabled={isOffline}
            isNested
        />
    );
}

ActionCell.displayName = 'ActionCell';

export default ActionCell;
