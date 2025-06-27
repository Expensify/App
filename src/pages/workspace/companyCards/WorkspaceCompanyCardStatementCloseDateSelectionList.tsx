import React, {useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {translate} from '@libs/Localize';
import styles from '@styles/index';
import CONST from '@src/CONST';

function WorkspaceCompanyCardStatementCloseDateSelectionList() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedOption, setSelectedOption] = useState(undefined);
    const [customCloseDate, setCustomCloseDate] = useState(undefined);

    const isCustomCloseDate = selectedOption === CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH;
    const closeDate = isCustomCloseDate ? customCloseDate : selectedOption;

    // s77rt handle error and brick road indicator (on both options selection and custom day selection)
    // s77rt fix size (and add compact option)

    return (
        <ScreenWrapper
            testID={WorkspaceCompanyCardStatementCloseDateSelectionList.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.companyCards.statementCloseDateTitle')}
                onBackButtonPress={() => {}} // s77rt
            />

            <View style={[styles.gap7, styles.flexGrow1]}>
                <Text style={[styles.ph5]}>{translate('workspace.moreFeatures.companyCards.statementCloseDateDescription')}</Text>

                <View>
                    {Object.values(CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE)?.map((option) => (
                        <SingleSelectListItem
                            key={option}
                            showTooltip
                            item={{
                                text: translate(`workspace.companyCards.statementCloseDate.${option}`),
                                isSelected: selectedOption === option,
                            }}
                            onSelectRow={() => setSelectedOption(option)}
                        />
                    ))}
                    {isCustomCloseDate && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            //brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} // s77rt
                            // errorText={'errorText'} // s77rt
                            //title={'test'}
                            description="123"
                        />
                    )}
                </View>
            </View>

            <FormAlertWithSubmitButton
                buttonText={translate('common.submit')}
                containerStyles={[styles.m4, styles.mb5]}
                onSubmit={() => {}} // s77rt
                enabledWhenOffline
            />

            {/*
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={() => {}} // s77rt
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={addNewCard?.data.selectedBank}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={() => {}} // s77rt
                confirmButtonStyles={!hasError && styles.mt5}
                addBottomSafeAreaPadding
            >
                {hasError && (
                    <View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBank')}
                        />
                    </View>
                )}
            </SelectionList>
            */}
        </ScreenWrapper>
    );
}

WorkspaceCompanyCardStatementCloseDateSelectionList.displayName = 'WorkspaceCompanyCardStatementCloseDateSelectionList';

export default WorkspaceCompanyCardStatementCloseDateSelectionList;
