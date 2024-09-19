import React from 'react';
import Button from '@components/Button';
import * as Illustrations from '@components/Icon/Illustrations';
import Section, {CARD_LAYOUT} from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as App from '@userActions/App';

function WorkspaceCardCreateAWorkspace() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('workspace.emptyWorkspace.title')}
            icon={Illustrations.HotDogStand}
            cardLayout={CARD_LAYOUT.ICON_ON_TOP}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            subtitleMuted
            containerStyles={[styles.highlightBG, styles.mv2]}
        >
            <Button
                onPress={() => {
                    App.createWorkspaceWithPolicyDraftAndNavigateToIt();
                }}
                text={translate('workspace.emptyWorkspace.createAWorkspaceCTA')}
                style={styles.mt5}
                success
            />
        </Section>
    );
}

WorkspaceCardCreateAWorkspace.displayName = 'WorkspaceCardNoVBAView';

export default WorkspaceCardCreateAWorkspace;
