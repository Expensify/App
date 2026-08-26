type WideRHPOverlayWrapperProps = {
    children: React.ReactNode;
    shouldWrap?: boolean;
};

// Overlays aren't displayed on native platforms.
export default function WideRHPOverlayWrapper({children, shouldWrap: _shouldWrap}: WideRHPOverlayWrapperProps) {
    return children;
}
