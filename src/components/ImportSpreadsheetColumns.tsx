import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Button from './Button';
import FixedFooter from './FixedFooter';
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
    headerText: string;
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
    headerText,
}: ImportSpreadsheetColumnsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    return (
        <>
            <ScrollView style={styles.mh5}>
                <View>
                    <RenderHTML html={Parser.replace(headerText)} />

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
            </ScrollView>
            <FixedFooter style={styles.mt6}>
                <OfflineWithFeedback
                    shouldDisplayErrorAbove
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
                        large
                    />
                </OfflineWithFeedback>
            </FixedFooter>
        </>
    );
}

export default ImportSpreeadsheetColumns;
