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
        <View
            style={[
                {minWidth: 335, backgroundColor: theme.highlightBG, marginLeft: 0, marginRight: 0, gap: 16, paddingBottom: 16},
                styles.alignItemsCenter,
                styles.reportContainerBorderRadius,
            ]}
        >
            <View
                style={[
                    {
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 16,
                        height: 168,
                        width: 303,
                    },
                    styles.justifyContentCenter,
                    styles.alignItemsCenter,
                ]}
            >
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
