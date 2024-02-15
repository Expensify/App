import type {ReactElement} from 'react';
import React, {useCallback, memo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import OptionRowLHNData from './OptionRowLHNData';
import type {LHNOptionsListProps, RenderItemProps} from './types';
import { OrderedReports } from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import { FlashList } from '@shopify/flash-list';

const keyExtractor = (item: OrderedReports) => `report_${item?.reportID}`;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    shouldDisableFocusOptions = false,
    currentReportID = '',
    optionMode,
    onFirstItemRendered = () => {},
}: LHNOptionsListProps) {
    const styles = useThemeStyles();

    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    const hasCalledOnLayout = React.useRef(false);
    const onLayoutItem = useCallback(() => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;

        onFirstItemRendered();
    }, [onFirstItemRendered]);

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item}: RenderItemProps): ReactElement => {

            return (
                <OptionRowLHNData
                    reportID={item?.reportID}
                    isFocused={!shouldDisableFocusOptions && item?.reportID === currentReportID}
                    onSelectRow={onSelectRow}
                    comment={item?.comment}
                    optionItem={item?.optionItem}
                    onLayout={onLayoutItem}
                />
            );
        },
        [
            currentReportID,
            onSelectRow,
            onLayoutItem,
        ],
    );

    return (
        <View style={style ?? styles.flex1}>
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                // estimatedItemSize={optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight}
                // extraData={[currentReportID]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default memo(LHNOptionsList);

export type {LHNOptionsListProps};
