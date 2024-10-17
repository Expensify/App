import React, {useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationsProps = {
    transactionID: string;
};

function DebugTransactionViolations({transactionID}: DebugTransactionViolationsProps) {
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [transactionViolationsJSON, setTransactionViolationsJSON] = useState(DebugUtils.onyxDataToString(transactionViolations));
    const numberOfLines = DebugUtils.getNumberOfLinesFromString(transactionViolationsJSON);

    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.pb5, styles.ph5, styles.gap5]}
        >
            {/* <Button
                success
                large
                text={translate('common.create')}
                onPress={() => Navigation.navigate(ROUTES.DEBUG_TRANSACTION.getRoute(transactionID))}
                style={[styles.pb5, styles.ph3]}
            />
            <FlatList
                data={transactionViolations}
                renderItem={renderItem}
            /> */}
            <TextInput
                accessibilityLabel="Text input field"
                defaultValue={transactionViolationsJSON}
                onChangeText={(text) => {
                    setTransactionViolationsJSON(DebugUtils.onyxDataToString(text));
                }}
                multiline={numberOfLines > 1}
                numberOfLines={numberOfLines}
                textInputContainerStyles={[styles.border, styles.borderBottom, styles.p5]}
            />
            <Button
                success
                text={translate('common.save')}
                // isDisabled={!draftReportAction || !!error}
                onPress={() => {
                    // const parsedReportAction = JSON.parse(draftReportAction.replaceAll('\n', '')) as ReportAction;
                    // Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[parsedReportAction.reportActionID]: parsedReportAction});
                    // Navigation.navigate(ROUTES.DEBUG_REPORT_TAB_ACTIONS.getRoute(reportID));
                }}
            />
        </ScrollView>
    );
}

DebugTransactionViolations.displayName = 'DebugTransactionViolations';

export default DebugTransactionViolations;
