import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptyRequestReport() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[{minWidth: 335}, styles.alignItemsCenter, styles.highlightBG, styles.ml0, styles.mr0, styles.gap4, styles.pb4, styles.reportContainerBorderRadius]}>
            <View style={[styles.emptyStateMoneyRequestPreviewReport, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={[{margin: 4}, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ImageSVG
                        fill={theme.border}
                        height={64}
                        width={64}
                        src={Expensicons.Folder}
                    />
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>This report has no expenses</Text>
                </View>
            </View>
            <Button
                success
                text="PLACEHOLDER BUTTON"
                style={[{width: 303, height: 40}]}
                onPress={() => {}}
                isDisabled={false}
            />
        </View>
    );
}

EmptyRequestReport.displayName = 'EmptyRequestReport';

export default EmptyRequestReport;
