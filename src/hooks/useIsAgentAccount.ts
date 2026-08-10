import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useIsAgentAccount(): boolean {
    return !!useCurrentUserPersonalDetails().isCustomAgent;
}

export default useIsAgentAccount;
