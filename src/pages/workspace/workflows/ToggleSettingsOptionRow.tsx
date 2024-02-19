import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type OptionType = {
    icon: React.FC<SvgProps>;
    title: string;
    subtitle: string;
    hasBeenToggled: boolean;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
    isEndOptionRow?: boolean;
};

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, isEndOptionRow, hasBeenToggled}: OptionType) {
    const [isEnabled, setIsEnabled] = useState(false);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        onToggle(!isEnabled);
    };
    const {isSmallScreenWidth} = useWindowDimensions();


    useEffect(() => {
        setIsEnabled(hasBeenToggled);
    }, [hasBeenToggled]);

    return (
        <View style={styles.pRelative}>
            <View style={styles.workspaceWorkflowContainer}>
                <View style={styles.workspaceWorkflowContent}>
                    <Icon
                        src={icon}
                        height={48}
                        width={48}
                        additionalStyles={styles.workspaceWorkflowsIcon}
                    />
                    <View style={styles.workspaceWorkflowsTimelineOverride} />
                    {!isEndOptionRow && <View style={StyleUtils.getWorkspaceWorkflowsDotStyle(isEnabled, isSmallScreenWidth) as ViewStyle} />}
                    <View style={styles.workspaceWorkflowsWrapperText}>
                        <Text style={styles.workspaceWorkflowsHeading}>{title}</Text>
                        <Text style={styles.workspaceWorkflowsSubtitle}>{subtitle}</Text>
                    </View>
                </View>
                <View>
                    <Switch
                        accessibilityLabel={subtitle}
                        onToggle={toggleSwitch}
                        isOn={isEnabled}
                    />
                </View>
            </View>
            {isEnabled && subMenuItems}
        </View>
    );
}

export type {OptionType};
export default ToggleSettingOptionRow;
