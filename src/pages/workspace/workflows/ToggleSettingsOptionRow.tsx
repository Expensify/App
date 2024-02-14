import Switch from "@components/Switch";
import Text from "@components/Text";
import useThemeStyles from "@hooks/useThemeStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { SvgProps } from "react-native-svg";

export type OptionType = {
    Illustration: React.ElementType<SvgProps>;
    title: string;
    subtitle: string;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
};

const ToggleSettingOptionRow = ({ Illustration, title, subtitle, onToggle, subMenuItems }: OptionType) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const styles = useThemeStyles();
  
    const toggleSwitch = () => {
      setIsEnabled(previousState => !previousState);
      onToggle(!isEnabled);
    };
  
    return (
    <View style={styles.workspaceWorkflowContainer}>        
        <View style={styles.workspaceWorkflowContent}>
            <View style={styles.workspaceWorkflowsIllustrationContainer}>
                <Illustration style={styles.workspaceWorkflowsIcon} />
            </View>
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
            {isEnabled && subMenuItems}
    </View>
    );
  };

  export default ToggleSettingOptionRow;