// Helper function to determine if wide or super wide RHP is displayed below the currently focused route
export default function getIsRHPDisplayedBelow(focusedRouteKey: string | undefined, visibleSuperWideRHPRouteKeys: string[], visibleWideRHPRouteKeys: string[]) {
    if (!focusedRouteKey) {
        return {
            isWideRHPBelow: false,
            isSuperWideRHPBelow: false,
        };
    }

    return {
        isWideRHPBelow: visibleWideRHPRouteKeys.length > 0 && !visibleWideRHPRouteKeys.includes(focusedRouteKey),
        isSuperWideRHPBelow: visibleSuperWideRHPRouteKeys.length > 0 && !visibleSuperWideRHPRouteKeys.includes(focusedRouteKey),
    };
}
