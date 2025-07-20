import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';
import CustomCloseDateSelectionList from './CustomCloseDateSelectionList';

type StatementCloseDateListItem = ListItem & {
    value: CompanyCardStatementCloseDate;
};

type WorkspaceCompanyCardStatementCloseDateSelectionListProps = {
    confirmText: string;
    onSubmit: (statementCloseDate: CompanyCardStatementCloseDate, statementCustomCloseDate: number | undefined) => void;
    onBackButtonPress: () => void;
    enabledWhenOffline: boolean;
    defaultDate?: CompanyCardStatementCloseDate;
};

function WorkspaceCompanyCardStatementCloseDateSelectionList({
    confirmText,
    onSubmit,
    onBackButtonPress,
    enabledWhenOffline,
    defaultDate,
}: WorkspaceCompanyCardStatementCloseDateSelectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedDate, setSelectedDate] = useState<CompanyCardStatementCloseDate | undefined>(defaultDate);
    const [selectedCustomDate, setSelectedCustomDate] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    const [isChoosingCustomDate, setIsChoosingCustomDate] = useState(false);

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
        if (!selectedDate || (selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && !selectedCustomDate)) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        onSubmit(selectedDate, selectedDate === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH ? selectedCustomDate : undefined);
    }, [selectedDate, selectedCustomDate, onSubmit, translate]);

    return (
        <ScreenWrapper
            testID={WorkspaceCompanyCardStatementCloseDateSelectionList.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
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
                                    }}
                                    onSelectRow={selectDateAndClearError}
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

WorkspaceCompanyCardStatementCloseDateSelectionList.displayName = 'WorkspaceCompanyCardStatementCloseDateSelectionList';

export default WorkspaceCompanyCardStatementCloseDateSelectionList;
