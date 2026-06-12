import React from 'react';
import {View} from 'react-native';
import Hoverable from '@components/Hoverable';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type MoreFeatureToggleProps = {
    /** Icon rendered to the left of the title. */
    icon: IconAsset;

    /** Title of the feature (e.g. "Workflows", "Categories"). */
    title: string;

    /** Description rendered below the title; also used as the switch's accessibility label. */
    subtitle: string;

    /** Whether the feature is currently enabled. */
    isActive: boolean;

    /** Pending Onyx action used to render optimistic UI states (e.g. offline pending). */
    pendingAction: PendingAction | undefined;

    /** Called when the user flips the switch. Receives the next enabled state. */
    onToggle: (isEnabled: boolean) => void;

    /**
     * Called when the row body (not the switch) is pressed. When provided the row renders as a clickable
     * navigation row; when omitted the row only responds to switch interactions.
     */
    onPress?: () => void;

    /** When true, the switch is locked: the lock icon replaces it and `disabledAction` runs on press. */
    disabled?: boolean;

    /** Called when a disabled (locked) row is pressed; typically opens an explanatory modal. */
    disabledAction?: () => void | Promise<void>;

    /** Onyx form errors to surface for this feature. */
    errors?: Errors;

    /** Called when the user dismisses the error message. */
    onCloseError?: () => void;
};

function MoreFeatureToggle({icon, title, subtitle, isActive, pendingAction, onToggle, onPress, disabled, disabledAction, errors, onCloseError}: MoreFeatureToggleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <Hoverable>
            {(hovered) => (
                <View
                    style={[
                        styles.workspaceSectionMoreFeaturesItem,
                        shouldUseNarrowLayout && styles.flexBasis100,
                        shouldUseNarrowLayout && StyleUtils.getMinimumWidth(0),
                        hovered && isActive && !!onPress && styles.hoveredComponentBG,
                    ]}
                >
                    <ToggleSettingOptionRow
                        icon={icon}
                        disabled={disabled}
                        disabledAction={disabledAction}
                        title={title}
                        titleStyle={styles.textStrong}
                        subtitle={subtitle}
                        switchAccessibilityLabel={subtitle}
                        isActive={isActive}
                        pendingAction={pendingAction}
                        onToggle={onToggle}
                        showLockIcon={disabled}
                        errors={errors}
                        onCloseError={onCloseError}
                        onPress={onPress}
                    />
                </View>
            )}
        </Hoverable>
    );
}

export default MoreFeatureToggle;
