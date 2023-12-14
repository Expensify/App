import React from 'react';
import Button from '@components/Button';
import * as Illustrations from '@components/Icon/Illustrations';
import Section, {CARD_LAYOUT} from '@components/Section';
import withLocalize, {WithLocalizeProps} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type WorkspaceCardCreateAWorkspaceProps = WithLocalizeProps;

function WorkspaceCardCreateAWorkspace({translate}: WorkspaceCardCreateAWorkspaceProps) {
    const styles = useThemeStyles();

    return (
        <Section
            title={translate('workspace.emptyWorkspace.title')}
            icon={Illustrations.HotDogStand}
            cardLayout={CARD_LAYOUT.ICON_ON_TOP}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            subtitleMuted
            containerStyles={[styles.highlightBG]}
        >
            <Button
                text={translate('workspace.emptyWorkspace.createAWorkspaceCTA')}
                style={styles.mt5}
                success
                medium
            />
        </Section>
    );
}

WorkspaceCardCreateAWorkspace.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardCreateAWorkspace);
