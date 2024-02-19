import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Icon from '@components/Icon';

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

    const toggleSwitch = () => {
        setIsEnabled((previousState) => !previousState);
        onToggle(!isEnabled);
    };
    const { isSmallScreenWidth } = useWindowDimensions();

    // Define dot style for menu items based on screen width
    const getDynamicDotStyle = (enabled: boolean) => ({
        position: 'absolute',
        width: 6,
        backgroundImage: 'radial-gradient(circle at 2.5px, #1A3D32 1.25px, rgba(255, 255, 255, 0) 2.5px)',
        backgroundSize: '5px 15px',
        backgroundRepeat: 'repeat-y',
        top: isSmallScreenWidth ? '32%' : '12%',
        bottom: enabled ? '-180%' : '-100%',
        left: isSmallScreenWidth ? '6%' : '2.45%',
    } as ViewStyle);

    useEffect(() => {
        setIsEnabled(hasBeenToggled);
    }, [hasBeenToggled]);

    return (
        <View style={styles.pRelative}>
            <View style={styles.workspaceWorkflowContainer}>
                <View style={styles.workspaceWorkflowContent}>
                    <Icon src={icon} height={48} width={48} additionalStyles={styles.workspaceWorkflowsIcon} />
                    <View style={styles.workspaceWorkflowsTimelineOverride} />
                    {!isEndOptionRow && <View style={getDynamicDotStyle(isEnabled)} />}
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
