import Section from '@components/Section';

import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import WorkspaceRow from './WorkspaceRow';

type WorkspaceSectionProps = {
    title: string;

    /** Workspaces to list, in the order the policy diff returned them. Nothing is rendered when empty. */
    policyIDs: string[];

    policies: OnyxCollection<Policy>;
};

function WorkspaceSection({title, policyIDs, policies}: WorkspaceSectionProps) {
    const styles = useThemeStyles();

    if (policyIDs.length === 0) {
        return null;
    }

    return (
        <Section
            title={title}
            titleStyles={[styles.sectionTitle, styles.ph5, styles.w100, styles.borderBottom]}
            containerStyles={[styles.p0, styles.mh0, styles.mt5]}
        >
            {policyIDs.map((policyID, index) => (
                <WorkspaceRow
                    key={policyID}
                    policyID={policyID}
                    policy={policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]}
                    shouldShowSeparator={index < policyIDs.length - 1}
                />
            ))}
        </Section>
    );
}

WorkspaceSection.displayName = 'WorkspaceSection';

export default WorkspaceSection;
