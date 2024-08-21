import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Button from './Button';
import type {ColumnRole} from './ImportColumn';
import ImportColumn from './ImportColumn';
import OfflineWithFeedback from './OfflineWithFeedback';
import RenderHTML from './RenderHTML';
import ScrollView from './ScrollView';
import Switch from './Switch';
import Text from './Text';

type ImportSpreadsheetColumnsProps = {
    spreadsheetColumns: string[][];
    containsHeader: boolean;
    setContainsHeader: (containsHeader: boolean) => void;
    columnNames: string[];
    columnRoles: ColumnRole[];
    importFunction: () => void;
    errors?: Errors | null;
    isButtonLoading?: boolean;
};

function ImportSpreeadsheetColumns({
    spreadsheetColumns,
    containsHeader,
    setContainsHeader,
    columnNames,
    columnRoles,
    errors,
    importFunction,
    isButtonLoading,
}: ImportSpreadsheetColumnsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    return (
        <ScrollView
            contentContainerStyle={[styles.h100, styles.flexColumn, styles.justifyContentBetween, {alignContent: 'space-between'}]}
            style={styles.mh5}
        >
            <View>
                <RenderHTML html={Parser.replace(translate('workspace.categories.importedCategoriesMessage', spreadsheetColumns?.length))} />

                <View style={[styles.mt7, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Text>{translate('spreadsheet.fileContainsHeader')}</Text>

                    <Switch
                        accessibilityLabel={translate('spreadsheet.fileContainsHeader')}
                        isOn={containsHeader}
                        onToggle={setContainsHeader}
                    />
                </View>

                {spreadsheetColumns.map((column, index) => {
                    return (
                        <ImportColumn
                            key={columnNames[index]}
                            column={column}
                            containsHeader={containsHeader}
                            columnName={columnNames[index]}
                            columnRoles={columnRoles}
                            columnIndex={index}
                        />
                    );
                })}
            </View>

            <OfflineWithFeedback
                style={styles.mt6}
                errorAboveChildren
                errors={errors}
                canDismissError={false}
            >
                <Button
                    style={styles.mv2}
                    text={translate('common.import')}
                    onPress={importFunction}
                    isLoading={isButtonLoading}
                    isDisabled={isOffline}
                    success
                />
            </OfflineWithFeedback>
        </ScrollView>
    );
}

export default ImportSpreeadsheetColumns;
