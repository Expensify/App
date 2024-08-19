import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function HighResolutionInfo({isUploaded}: {isUploaded: boolean}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const stylesUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.justifyContentCenter, stylesUtils.getHighResolutionInfoWrapperStyle(isUploaded)]}>
            <Icon
                src={Expensicons.Info}
                height={variables.iconSizeExtraSmall}
                width={variables.iconSizeExtraSmall}
                fill={theme.icon}
                additionalStyles={styles.p1}
            />
            <Text style={[styles.textLabelSupporting]}>{isUploaded ? translate('attachmentPicker.attachmentImageResized') : translate('attachmentPicker.attachmentImageTooLarge')}</Text>
        </View>
    );
}

export default HighResolutionInfo;
