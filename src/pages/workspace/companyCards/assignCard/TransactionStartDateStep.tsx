import {format, subDays} from 'date-fns';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

type TransactionStartDateStepProps = {
    policyID: string | undefined;
    feed: CompanyCardFeed;
    backTo?: Route;
};

type TransactionStartDateSelectionListFooterProps = TransactionStartDateStepProps & {
    dateOptionSelected: string;
    startDate: string;
};

function TransactionStartDateSelectionListFooter({dateOptionSelected, startDate, policyID, feed, backTo}: TransactionStartDateSelectionListFooterProps) {
    const {translate} = useLocalize();

    if (dateOptionSelected !== CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM) {
        return null;
    }

    const onPress = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_TRANSACTION_START_DATE.getRoute(policyID, feed, backTo));
    };

    return (
        <MenuItemWithTopDescription
            description={translate('common.date')}
            title={startDate}
            shouldShowRightIcon
            onPress={onPress}
        />
    );
}

function TransactionStartDateStep({policyID, feed, backTo}: TransactionStartDateStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const isEditing = assignCard?.isEditing;
    const data = assignCard?.data;
    const assigneeDisplayName = getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? '';

    const [dateOptionSelected, setDateOptionSelected] = useState(data?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING);
    const startDate = assignCard?.startDate ?? data?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING);

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CARD});
    };

    const handleSelectDateOption = (dateOption: string) => {
        setDateOptionSelected(dateOption);
    };

    const submit = () => {
        const date90DaysBack = format(subDays(new Date(), 90), CONST.DATE.FNS_FORMAT_STRING);

        setAssignCardStepAndData({
            currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
            data: {
                dateOption: dateOptionSelected,
                startDate: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? date90DaysBack : startDate,
            },
            isEditing: false,
        });
    };

    const dateOptions = useMemo(
        () => [
            {
                value: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
                text: translate('workspace.companyCards.fromTheBeginning'),
                keyForList: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
                isSelected: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
            },
            {
                value: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
                text: translate('workspace.companyCards.customStartDate'),
                keyForList: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
                isSelected: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
            },
        ],
        [dateOptionSelected, translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID={TransactionStartDateStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={assigneeDisplayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseTransactionStartDate')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.startDateDescription')}</Text>
            <View style={styles.flex1}>
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => handleSelectDateOption(value)}
                    data={dateOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={dateOptionSelected}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    footerContent={
                        <Button
                            success
                            large
                            pressOnEnter
                            text={translate(isEditing ? 'common.confirm' : 'common.next')}
                            onPress={submit}
                        />
                    }
                    listFooterContent={
                        <TransactionStartDateSelectionListFooter
                            dateOptionSelected={dateOptionSelected}
                            startDate={startDate}
                            policyID={policyID}
                            feed={feed}
                            backTo={backTo}
                        />
                    }
                />
            </View>
        </InteractiveStepWrapper>
    );
}

TransactionStartDateStep.displayName = 'TransactionStartDateStep';

export default TransactionStartDateStep;
