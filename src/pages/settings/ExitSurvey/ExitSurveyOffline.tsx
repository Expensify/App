import React, {memo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {ToddBehindCloud} from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function ExitSurveyOffline() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <Icon
                width={variables.modalTopIconWidth}
                height={variables.modalTopIconHeight}
                src={ToddBehindCloud}
            />
            <Text style={[styles.headerAnonymousFooter, styles.textAlignCenter]}>{translate('exitSurvey.offlineTitle')}</Text>
            <Text style={[styles.mt2, styles.textAlignCenter]}>{translate('exitSurvey.offline')}</Text>
        </View>
    );
}

ExitSurveyOffline.displayName = 'ExitSurveyOffline';

export default memo(ExitSurveyOffline);
