import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {CompanyCardStatementCloseDate} from '@src/types/onyx/CardFeeds';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import CustomCloseDateSelectionList from './CustomCloseDateSelectionList';

type StatementCloseDateListItem = ListItem & {
    value: CompanyCardStatementCloseDate;
};

type WorkspaceCompanyCardStatementCloseDateSelectionListProps = {
    confirmText: string;
    onSubmit: (statementCloseDate: CompanyCardStatementCloseDate) => void;
    onBackButtonPress: () => void;
    enabledWhenOffline: boolean;
    defaultDate?: CompanyCardStatementCloseDate;
    pendingAction?: PendingAction;
    errors?: Errors | null;
    onCloseError?: () => void;
};

function WorkspaceCompanyCardStatementCloseDateSelectionList({
    confirmText,
    onSubmit,
    onBackButtonPress,
    enabledWhenOffline,
    defaultDate,
    pendingAction,
    errors,
    onCloseError,
}: WorkspaceCompanyCardStatementCloseDateSelectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedDate, setSelectedDate] = useState<CompanyCardStatementCloseDate | undefined>(defaultDate);
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

    const submit = useCallback(() => {
        if (!selectedDate) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }

        onSubmit(selectedDate);
    }, [selectedDate, onSubmit, translate]);

    const options = useMemo(() => {
        return Object.values(CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE)?.map((option) => {
            let value: CompanyCardStatementCloseDate;
            let isSelected: boolean;

            if (option === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH) {
                if (typeof selectedDate === 'number') {
                    value = selectedDate;
                } else if (typeof defaultDate === 'number') {
                    value = defaultDate;
                } else {
                    value = NaN;
                }
                isSelected = typeof selectedDate === 'number';
            } else {
                value = option;
                isSelected = selectedDate === option;
            }

            return (
                <SingleSelectListItem
                    wrapperStyle={[styles.flexReset]}
                    key={option}
                    showTooltip
                    item={{
                        text: translate(`workspace.companyCards.statementCloseDate.${option}`),
                        value,
                        isSelected,
                    }}
                    onSelectRow={(item: StatementCloseDateListItem) => {
                        setSelectedDate(item.value);
                        setError(undefined);
                    }}
                />
            );
        });
    }, [translate, defaultDate, selectedDate, styles.flexReset]);

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
                    initiallySelectedDay={typeof selectedDate === 'number' && selectedDate ? selectedDate : undefined}
                    onConfirmSelectedDay={(day) => {
                        setSelectedDate(day);
                        setError(undefined);
                        goBack();
                    }}
                />
            ) : (
                <>
                    <ScrollView contentContainerStyle={[styles.gap7, styles.flexGrow1]}>
                        <Text style={[styles.ph5]}>{translate('workspace.moreFeatures.companyCards.statementCloseDateDescription')}</Text>
                        <OfflineWithFeedback
                            errors={errors}
                            errorRowStyles={[styles.mb2, styles.pl5, styles.pr3]}
                            onClose={onCloseError}
                            pendingAction={pendingAction}
                            shouldDisplayErrorAbove
                        >
                            <View>
                                {options}
                                {typeof selectedDate === 'number' && (
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        brickRoadIndicator={error ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        title={selectedDate ? selectedDate.toString() : undefined}
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

WorkspaceCompanyCardStatementCloseDateSelectionList.displayName = 'WorkspaceCompanyCardStatementCloseDateSelectionList';

export default WorkspaceCompanyCardStatementCloseDateSelectionList;
