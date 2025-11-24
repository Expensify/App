import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type RepliesDividerProps = {
    /** Whether we should hide thread divider line */
    shouldHideThreadDividerLine: boolean;
};

function RepliesDivider({shouldHideThreadDividerLine}: RepliesDividerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Thread'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View
            style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mt3, styles.mb1, styles.userSelectNone]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            <Icon
                src={icons.Thread}
                fill={theme.icon}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
            <Text style={[styles.threadDividerText, styles.textSupporting, styles.ml1, styles.userSelectNone]}>{translate('threads.replies')}</Text>
            {!shouldHideThreadDividerLine && <View style={[styles.threadDividerLine]} />}
        </View>
    );
}

RepliesDivider.displayName = 'RepliesDivider';
export default RepliesDivider;
