import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

type PolicySectionProps = {
    policyID: string;
    interactive?: boolean;
};

function PolicySection({policyID, interactive = true}: PolicySectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const parsedRules = policy?.customRules ?? '';
    const rulesDescription = typeof parsedRules === 'string' ? parsedRules : '';

    return (
        <View style={[styles.mt3]}>
            {/* <OfflineWithFeedback
                pendingAction={policy?.pendingFields?.customRules}
                errors={policy?.errors?.customRules}
            > */}
            <MenuItemWithTopDescription
                title={rulesDescription}
                description={translate('workspace.policy.title')}
                shouldShowRightIcon={interactive}
                interactive={interactive}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_POLICY.getRoute(policyID))}
                shouldRenderAsHTML
            />
            {/* </OfflineWithFeedback> */}
        </View>
    );
}

export default PolicySection;
