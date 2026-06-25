import React from 'react';
import {View} from 'react-native';
import Section from '@components/Section';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type MoreFeaturesSectionProps = {
    /** Section heading rendered above the toggles (e.g. "Spend", "Manage"). */
    title: string;

    /**
     * Toggle rows belonging to this section. An invisible filler row is appended automatically when
     * an odd number of children is provided, so the wide-layout two-column grid stays aligned.
     */
    children: React.ReactNode;
};

function MoreFeaturesSection({title, children}: MoreFeaturesSectionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const needsFiller = React.Children.toArray(children).length % 2 === 1;

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : {}]}>
            <Section
                containerStyles={[styles.ph1, styles.pv0, styles.bgTransparent, styles.noBorderRadius]}
                childrenStyles={[styles.flexRow, styles.flexWrap, styles.columnGap3]}
                renderTitle={() => (
                    <Text
                        style={styles.mutedNormalTextLabel}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {title}
                    </Text>
                )}
                subtitleMuted
            >
                {children}
                {needsFiller && (
                    <View
                        aria-hidden
                        accessibilityElementsHidden
                        style={[
                            styles.workspaceSectionMoreFeaturesItem,
                            shouldUseNarrowLayout && StyleUtils.getMinimumWidth(0),
                            styles.p0,
                            styles.mt0,
                            styles.visibilityHidden,
                            styles.bgTransparent,
                        ]}
                    />
                )}
            </Section>
        </View>
    );
}

export default MoreFeaturesSection;
