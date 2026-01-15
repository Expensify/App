import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {StatementPeriodEnd, StatementPeriodEndDay} from '@src/types/onyx/CardFeeds';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
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

    const [selectedDate, setSelectedDate] = useState<CompanyCardStatementCloseDate | undefined>(() => {
        if (defaultStatementPeriodEndDay) {
            return CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH;
        }
        return defaultStatementPeriodEnd;
    });
    const [selectedCustomDate, setSelectedCustomDate] = useState<number | undefined>(defaultStatementPeriodEndDay);
    const [isChoosingCustomDate, setIsChoosingCustomDate] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const title = useMemo(
        () => (isChoosingCustomDate ? translate('workspace.companyCards.customCloseDate') : translate('workspace.moreFeatures.companyCards.statementCloseDateTitle')),
        [translate, isChoosingCustomDate],
    );

    const goBack = useCallback(() => {
        if (isChoosingCustomDate) {
            setIsChoosingCustomDate(false);
            return;
        }

        onBackButtonPress();
    }, [isChoosingCustomDate, onBackButtonPress]);

    const selectDateAndClearError = useCallback((item: StatementCloseDateListItem) => {
        setSelectedDate(item.value);
        setError(undefined);
    }, []);

    const selectCustomDateAndClearError = useCallback(
        (day: number) => {
            setSelectedCustomDate(day);
            setError(undefined);
            goBack();
        },
        [goBack],
    );

    const submit = useCallback(() => {
        if (!selectedDate) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        if (selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH) {
            if (!selectedCustomDate) {
                setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
                return;
            }

            onSubmit(undefined, selectedCustomDate);
            return;
        }

        onSubmit(selectedDate, undefined);
    }, [selectedDate, selectedCustomDate, onSubmit, translate]);

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
                                        keyForList={option}
                                    />
                                ))}
                                {selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && (
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        brickRoadIndicator={error ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        title={selectedCustomDate?.toString()}
                                        description={translate('workspace.companyCards.customCloseDate')}
                                        onPress={() => setIsChoosingCustomDate(true)}
                                        viewMode={CONST.OPTION_MODE.COMPACT}
                                    />
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
                            buttonText={confirmText}
                            onSubmit={submit}
                            enabledWhenOffline={enabledWhenOffline}
                        />
                    </FixedFooter>
                </>
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceCompanyCardStatementCloseDateSelectionList;
