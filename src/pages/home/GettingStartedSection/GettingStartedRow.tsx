import Badge from '@components/Badge';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

import type {GettingStartedItem, GettingStartedItemKey} from './hooks/useGettingStartedItems';

/** Sentry labels for the row and its nested controls, one variant per getting-started item */
const SENTRY_LABELS: Record<GettingStartedItemKey, {row: SentryLabel; checkbox: SentryLabel; beginButton: SentryLabel}> = {
    createWorkspace: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CREATE_WORKSPACE,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CREATE_WORKSPACE,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CREATE_WORKSPACE,
    },
    // Keeps the CreateExpense labels from before the step was renamed so its Sentry history carries over.
    addFirstReceipt: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CREATE_EXPENSE,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CREATE_EXPENSE,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CREATE_EXPENSE,
    },
    customizeExpenseCategories: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CUSTOMIZE_EXPENSE_CATEGORIES,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CUSTOMIZE_EXPENSE_CATEGORIES,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CUSTOMIZE_EXPENSE_CATEGORIES,
    },
    customizeSpendCategories: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CUSTOMIZE_SPEND_CATEGORIES,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CUSTOMIZE_SPEND_CATEGORIES,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CUSTOMIZE_SPEND_CATEGORIES,
    },
    customizeCategories: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CUSTOMIZE_CATEGORIES,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CUSTOMIZE_CATEGORIES,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CUSTOMIZE_CATEGORIES,
    },
    linkPersonalCard: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.LINK_PERSONAL_CARD,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.LINK_PERSONAL_CARD,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.LINK_PERSONAL_CARD,
    },
    linkCompanyCards: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.LINK_COMPANY_CARDS,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.LINK_COMPANY_CARDS,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.LINK_COMPANY_CARDS,
    },
    issueExpensifyCards: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.ISSUE_EXPENSIFY_CARDS,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.ISSUE_EXPENSIFY_CARDS,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.ISSUE_EXPENSIFY_CARDS,
    },
    setupTravel: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.SETUP_TRAVEL,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.SETUP_TRAVEL,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.SETUP_TRAVEL,
    },
    inviteAccountant: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.INVITE_ACCOUNTANT,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.INVITE_ACCOUNTANT,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.INVITE_ACCOUNTANT,
    },
    connectAccounting: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CONNECT_ACCOUNTING,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CONNECT_ACCOUNTING,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CONNECT_ACCOUNTING,
    },
    configureApprovals: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.CONFIGURE_APPROVALS,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.CONFIGURE_APPROVALS,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.CONFIGURE_APPROVALS,
    },
    setupRules: {
        row: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_ROW.SETUP_RULES,
        checkbox: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_CHECKBOX.SETUP_RULES,
        beginButton: CONST.SENTRY_LABEL.HOME_PAGE.GETTING_STARTED_BEGIN_BUTTON.SETUP_RULES,
    },
};

type GettingStartedRowProps = {
    item: GettingStartedItem;
};

function GettingStartedRow({item}: GettingStartedRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    const sentryLabels = SENTRY_LABELS[item.key];

    const navigateToItem = () => {
        if (item.onPress) {
            item.onPress();
            return;
        }
        const {route} = item;
        if (!route) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(route));
    };

    return (
        <PressableWithoutFeedback
            onPress={navigateToItem}
            accessibilityLabel={item.label}
            sentryLabel={sentryLabels.row}
        >
            {({hovered}) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, cardPaddingHorizontal, styles.pv3, hovered && styles.hoveredComponentBG]}>
                    <View style={styles.gettingStartedRowIconContainer}>
                        <Checkbox
                            sentryLabel={sentryLabels.checkbox}
                            isChecked={item.isComplete}
                            onPress={navigateToItem}
                            accessibilityLabel={item.label}
                        />
                    </View>
                    <View style={styles.gettingStartedRowTextContainer}>
                        <Text style={[styles.widgetItemTitle, item.isComplete && styles.textSupporting]}>{item.label}</Text>
                        <Text style={styles.widgetItemSubtitle}>{item.subText}</Text>
                    </View>
                    {item.isComplete ? (
                        <Badge
                            text={translate('homePage.gettingStartedSection.done')}
                            icon={icons.Checkmark}
                            badgeStyles={[styles.widgetItemButton, styles.justifyContentCenter]}
                        />
                    ) : (
                        <Button
                            sentryLabel={sentryLabels.beginButton}
                            size={CONST.BUTTON_SIZE.SMALL}
                            variant="success"
                            onPress={navigateToItem}
                            style={styles.widgetItemButton}
                        >
                            <Button.Text>{translate('homePage.gettingStartedSection.begin')}</Button.Text>
                        </Button>
                    )}
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default GettingStartedRow;
