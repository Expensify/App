import UsePermissions from '@hooks/usePermissions';

/**
 * @returns {UsePermissions} A mock of the usePermissions hook.
 */
const usePermissions = (): typeof UsePermissions => () => ({
    canUseViolations: true,
});
export default usePermissions;
