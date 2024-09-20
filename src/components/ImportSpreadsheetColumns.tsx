import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {setContainsHeader} from '@libs/actions/ImportSpreadsheet';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Button from './Button';
import FixedFooter from './FixedFooter';
import type {ColumnRole} from './ImportColumn';
import ImportColumn from './ImportColumn';
import OfflineWithFeedback from './OfflineWithFeedback';
import ScrollView from './ScrollView';
import Switch from './Switch';
import Text from './Text';
import TextLink from './TextLink';

type ImportSpreadsheetColumnsProps = {
    // An array of arrays containing strings, representing the spreadsheet data.
    spreadsheetColumns: string[][];

    // An array of strings representing the names of the columns.
    columnNames: string[];

    // An array of column roles to define the role of each column.
    columnRoles: ColumnRole[];

    // A function to perform the import operation.
    importFunction: () => void;

    // An optional Errors object containing any errors that may have occurred.
    errors?: Errors | null;

    // An optional boolean indicating whether the import button is in a loading state.
    isButtonLoading?: boolean;

    // Link to learn more about the file preparation for import.
    learnMoreLink?: string;
};

function ImportSpreeadsheetColumns({spreadsheetColumns, columnNames, columnRoles, errors, importFunction, isButtonLoading, learnMoreLink}: ImportSpreadsheetColumnsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const {containsHeader = true} = spreadsheet ?? {};

    return (
        <>
            <ScrollView>
                <View style={styles.mh5}>
                    <Text>
                        {translate('spreadsheet.importDescription')}
                        <TextLink href={learnMoreLink ?? ''}>{` ${translate('common.learnMore')}`}</TextLink>
                    </Text>

                    <View style={[styles.mt7, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text>{translate('spreadsheet.fileContainsHeader')}</Text>

                        <Switch
                            accessibilityLabel={translate('spreadsheet.fileContainsHeader')}
                            isOn={containsHeader}
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onToggle={setContainsHeader}
                        />
                    </View>

                    {spreadsheetColumns.map((column, index) => {
                        return (
                            <ImportColumn
                                key={columnNames.at(index)}
                                column={column}
                                columnName={columnNames.at(index) ?? ''}
                                columnRoles={columnRoles}
                                columnIndex={index}
                            />
                        );
                    })}
                </View>
            </ScrollView>
            <FixedFooter>
                <OfflineWithFeedback
                    shouldDisplayErrorAbove
                    errors={errors}
                    errorRowStyles={styles.mv2}
                    canDismissError={false}
                >
                    <Button
                        text={translate('common.import')}
                        onPress={importFunction}
                        isLoading={isButtonLoading}
                        isDisabled={isOffline}
                        success
                        large
                    />
                </OfflineWithFeedback>
            </FixedFooter>
        </>
    );
}

ImportSpreeadsheetColumns.displayName = 'ImportSpreeadsheetColumns';

export default ImportSpreeadsheetColumns;
