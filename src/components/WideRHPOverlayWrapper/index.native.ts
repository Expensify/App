type WideRHPOverlayWrapperProps = {
    children: React.ReactNode;
};

// Overlays aren't displayed on native platforms.
export default function WideRHPOverlayWrapper({children}: WideRHPOverlayWrapperProps) {
    return children;
}
