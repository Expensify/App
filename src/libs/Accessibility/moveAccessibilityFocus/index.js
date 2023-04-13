const moveAccessibilityFocus = (ref) => {
    if (!ref || !ref.current) {
        return;
    }
    ref.current.focus();
};

export default moveAccessibilityFocus;
