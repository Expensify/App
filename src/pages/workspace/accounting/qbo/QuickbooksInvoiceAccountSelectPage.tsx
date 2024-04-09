import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

type CustomSelectorTypes = ValueOf<typeof CONST.QBO_ONLINE_ACCOUNT_SELECTOR_OPTIONS>;

type SelectorType = {
    value: CustomSelectorTypes;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

function QuickbooksInvoiceAccountSelectPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();

    const [selectedAccount, setSelectedAccount] = useState('Croissant Co Payroll Account');

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            Object.entries(CONST.QBO_ONLINE_ACCOUNT_SELECTOR_OPTIONS).map(([key, value]) => ({
                value,
                text: value,
                keyForList: key,
                isSelected: selectedAccount === value,
            })),
        [selectedAccount],
    );

    const showQBOOnlineSelectorOptions = useCallback(
        () =>
            qboOnlineSelectorOptions.map((item) => (
                <OfflineWithFeedback key={item.keyForList.toString()}>
                    <RadioListItem
                        item={item}
                        onSelectRow={() => setSelectedAccount(item.value)}
                        showTooltip={false}
                        isFocused={item.isSelected}
                    />
                </OfflineWithFeedback>
            )),
        [qboOnlineSelectorOptions, setSelectedAccount],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksInvoiceAccountSelectPage.displayName}
        >
            <HeaderWithBackButton title="Invoice Collection Account" />

            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>
                    If you are exporting Invoices from Expensify to Quickbooks Online, this is the account the Invoice will appear against once marked as Paid.
                </Text>
            </View>
            <ScrollView>{showQBOOnlineSelectorOptions()}</ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksInvoiceAccountSelectPage.displayName = 'QuickbooksInvoiceAccountSelectPage';

export default withPolicy(QuickbooksInvoiceAccountSelectPage);
