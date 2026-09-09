type CreateJoinWorkspaceOnboardingContentParams = {
    event: 'validateEmail' | 'joinWorkspace' | 'noWorkspaces';
    data: string;
    domain?: string;
};

export default CreateJoinWorkspaceOnboardingContentParams;
