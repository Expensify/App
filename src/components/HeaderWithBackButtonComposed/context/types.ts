/** Values published by the parent `Header` for its child blocks (BackButton/Icon/Title/ProgressBar/action buttons/...) to consume via `useHeaderContext`. */
type HeaderContextValue = {
    /** Shared fallback fill color for the header icons (each block resolves `iconFill ?? theme.icon`). */
    iconFill?: string;

    /** Whether the header uses the headline style — `Header.Title` uses it to pick the taller title font. */
    shouldUseHeadlineHeader: boolean;
};

export default HeaderContextValue;
