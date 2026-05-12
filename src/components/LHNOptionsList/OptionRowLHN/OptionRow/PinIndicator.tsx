import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';

type PinIndicatorProps = {
    /** Whether the report row is pinned. */
    isPinned: boolean | undefined;

    /** Brick road indicator for the row. When set (error/info), the pin icon is hidden so the brick-road badge can take its place. */
    brickRoadIndicator: OptionData['brickRoadIndicator'];
};

function PinIndicator({isPinned, brickRoadIndicator}: PinIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {Pin} = useMemoizedLazyExpensifyIcons(['Pin']);

    if (!isPinned || brickRoadIndicator) {
        return null;
    }

    return (
        <View
            style={styles.ml2}
            accessibilityLabel={translate('sidebarScreen.chatPinned')}
        >
            <Icon
                testID="Pin Icon"
                fill={theme.icon}
                src={Pin}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
        </View>
    );
}

PinIndicator.displayName = 'OptionRow.PinIndicator';

export default PinIndicator;
