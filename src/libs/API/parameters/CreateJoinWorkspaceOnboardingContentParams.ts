type CreateJoinWorkspaceOnboardingContentParams = {
    event: 'validateEmail' | 'joinWorkspace' | 'noJoinableWorkspacesMessage';
    data: string;
};

export default CreateJoinWorkspaceOnboardingContentParams;
