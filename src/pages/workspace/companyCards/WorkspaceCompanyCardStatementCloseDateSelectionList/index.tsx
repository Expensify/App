import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useState} from 'react';
import {View} from 'react-native';

import CustomCloseDateSelectionList from './CustomCloseDateSelectionList';

type CompanyCardStatementCloseDate = ValueOf<typeof CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE>;

type StatementCloseDateListItem = ListItem & {
    value: CompanyCardStatementCloseDate;
};

type WorkspaceCompanyCardStatementCloseDateSelectionListProps = {
    confirmText: string;
    onSubmit: (statementPeriodEnd: StatementPeriodEnd | undefined, statementPeriodEndDay: StatementPeriodEndDay | undefined) => void;
    onBackButtonPress: () => void;
    enabledWhenOffline: boolean;
    defaultStatementPeriodEnd?: StatementPeriodEnd;
    defaultStatementPeriodEndDay?: StatementPeriodEndDay;
    pendingAction?: PendingAction;
    errors?: Errors | null;
    onCloseError?: () => void;
};

function WorkspaceCompanyCardStatementCloseDateSelectionList({
    confirmText,
    onSubmit,
    onBackButtonPress,
    enabledWhenOffline,
    defaultStatementPeriodEnd,
    defaultStatementPeriodEndDay,
    pendingAction,
    errors,
    onCloseError,
}: WorkspaceCompanyCardStatementCloseDateSelectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    const [selectedDate, setSelectedDate] = useState<CompanyCardStatementCloseDate | undefined>(() => {
        if (defaultStatementPeriodEndDay) {
            return CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH;
        }
        return defaultStatementPeriodEnd;
    });
    const [selectedCustomDate, setSelectedCustomDate] = useState<number | undefined>(defaultStatementPeriodEndDay);
    const [isChoosingCustomDate, setIsChoosingCustomDate] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const {isLoading, startWithLoading} = usePressLoading();

    const title = isChoosingCustomDate ? translate('workspace.companyCards.customCloseDate') : translate('workspace.moreFeatures.companyCards.statementCloseDateTitle');

    const goBack = () => {
        if (isChoosingCustomDate) {
            setIsChoosingCustomDate(false);
            return;
        }

        onBackButtonPress();
    };

    const selectDateAndClearError = (item: StatementCloseDateListItem) => {
        setSelectedDate(item.value);
        setError(undefined);
    };

    const selectCustomDateAndClearError = (day: number) => {
        setSelectedCustomDate(day);
        setError(undefined);
        goBack();
    };

    const submit = () => {
        if (!selectedDate) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        if (selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && !selectedCustomDate) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        startWithLoading(() => {
            if (selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH) {
                onSubmit(undefined, selectedCustomDate);
                return;
            }

            onSubmit(selectedDate, undefined);
        });
    };

    return (
        <ScreenWrapper
            testID="WorkspaceCompanyCardStatementCloseDateSelectionList"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen={!enabledWhenOffline}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={goBack}
            />
            {isChoosingCustomDate ? (
                <CustomCloseDateSelectionList
                    initiallySelectedDay={selectedCustomDate}
                    onConfirmSelectedDay={selectCustomDateAndClearError}
                />
            ) : (
                <>
                    <ScrollView contentContainerStyle={[styles.gap7, styles.flexGrow1]}>
                        <Text style={[styles.ph5]}>{translate('workspace.moreFeatures.companyCards.statementCloseDateDescription')}</Text>
                        <OfflineWithFeedback
                            errors={errors}
                            errorRowStyles={[styles.mt2, styles.pl5, styles.pr3]}
                            onClose={onCloseError}
                            pendingAction={pendingAction}
                        >
                            <View>
                                {Object.values(CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE)?.map((option) => (
                                    <SingleSelectListItem
                                        wrapperStyle={[styles.flexReset]}
                                        key={option}
                                        showTooltip
                                        item={{
                                            value: option,
                                            text: translate(`workspace.companyCards.statementCloseDate.${option}`),
                                            isSelected: selectedDate === option,
                                            keyForList: option,
                                        }}
                                        onSelectRow={selectDateAndClearError}
                                    />
                                ))}
                                {selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && (
                                    <MenuItem.Root
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.STATEMENT_CLOSE_CUSTOM_DATE}
                                        onPress={callIfAuthenticated(() => setIsChoosingCustomDate(true), session)}
                                        isCompact
                                    >
                                        <MenuItemField.Row
                                            name={translate('workspace.companyCards.customCloseDate')}
                                            value={selectedCustomDate?.toString()}
                                        >
                                            {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                                            <MenuItem.Chevron />
                                        </MenuItemField.Row>
                                    </MenuItem.Root>
                                )}
                            </View>
                        </OfflineWithFeedback>
                    </ScrollView>
                    <FixedFooter
                        style={styles.gap3}
                        addBottomSafeAreaPadding
                    >
                        {!!error && (
                            <FormHelpMessage
                                isError
                                message={error}
                            />
                        )}
                        <FormAlertWithSubmitButton
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.STATEMENT_CLOSE_DATE_SAVE}
                            buttonText={confirmText}
                            onSubmit={submit}
                            enabledWhenOffline={enabledWhenOffline}
                            shouldShowLoadingImmediatelyOnPress={false}
                            isLoading={isLoading}
                        />
                    </FixedFooter>
                </>
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceCompanyCardStatementCloseDateSelectionList;
