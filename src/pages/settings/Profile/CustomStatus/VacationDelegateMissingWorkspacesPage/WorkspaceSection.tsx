import Section from '@components/Section';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import WorkspaceRow from './WorkspaceRow';

type WorkspaceSectionProps = {
    title: string;

    /** Workspaces to list, sorted alphabetically by the name they display. Nothing is rendered when empty. */
    policyIDs: string[];

    policies: OnyxCollection<Policy>;
};

function WorkspaceSection({title, policyIDs, policies}: WorkspaceSectionProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    if (policyIDs.length === 0) {
        return null;
    }

    const workspaces = policyIDs
        .map((policyID) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            // A workspace missing from Onyx is not available to the current user and is listed as such
            return {policyID, avatarURL: policy?.avatarURL, title: policy?.name ?? translate('workspace.common.unavailable')};
        })
        .sort((firstWorkspace, secondWorkspace) => localeCompare(firstWorkspace.title, secondWorkspace.title));

    return (
        <Section
            title={title}
            titleStyles={[styles.sectionTitle, styles.ph5, styles.w100, styles.borderBottom]}
            containerStyles={[styles.p0, styles.mh0, styles.mt5]}
        >
            {workspaces.map((workspace, index) => (
                <WorkspaceRow
                    key={workspace.policyID}
                    policyID={workspace.policyID}
                    title={workspace.title}
                    avatarURL={workspace.avatarURL}
                    shouldShowSeparator={index < workspaces.length - 1}
                />
            ))}
        </Section>
    );
}

export default WorkspaceSection;
