import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function WorkspaceCardListHeader() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.appBG, styles.mh5, styles.gap5, styles.p4]}>
            <View style={[styles.flexRow, styles.flex5, styles.gap2, styles.alignItemsCenter]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {translate('workspace.expensifyCard.name')}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {translate('workspace.expensifyCard.lastFour')}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {translate('workspace.expensifyCard.limit')}
                </Text>
            </View>
        </View>
    );
}

WorkspaceCardListHeader.displayName = 'WorkspaceCardListHeader';

export default WorkspaceCardListHeader;
