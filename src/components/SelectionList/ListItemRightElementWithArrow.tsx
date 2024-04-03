import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as Expensicons from '@components/Icon/Expensicons';

type ListItemRightElementWithArrowProps = {
    enabled?: boolean;
};

function ListItemRightElementWithArrow({enabled}: ListItemRightElementWithArrowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View style={styles.flexRow}>
            <Text style={[styles.alignSelfCenter, styles.textSupporting, styles.pl2, styles.label]}>
                {enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}
            </Text>
            <View style={[styles.p1, styles.pl2]}>
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={theme.icon}
                />
            </View>
        </View>
    );
}

ListItemRightElementWithArrow.displayName = 'ListItemRightElementWithArrow';

export default ListItemRightElementWithArrow;
