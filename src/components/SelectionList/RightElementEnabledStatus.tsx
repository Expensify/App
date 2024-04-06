import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type RightElementEnabledStatusProps = {
    enabled?: boolean;
};

function RightElementEnabledStatus({enabled}: RightElementEnabledStatusProps) {
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

RightElementEnabledStatus.displayName = 'RightElementEnabledStatus';

export default RightElementEnabledStatus;
