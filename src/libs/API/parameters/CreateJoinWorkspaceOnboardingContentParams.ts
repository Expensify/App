type CreateJoinWorkspaceOnboardingContentParams = {
    contentType: 'task' | 'message';
    data: string;
    task?: string;
    domain: string;
};

export default CreateJoinWorkspaceOnboardingContentParams;
