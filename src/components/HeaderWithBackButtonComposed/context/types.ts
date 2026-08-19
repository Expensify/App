/** Values published by the parent `Header` for its child blocks (BackButton/Icon/Title/ProgressBar/action buttons/...) to consume via `useHeaderContext`. */
type HeaderContextValue = {
    /** Whether the header uses the headline style — `Header.Title` uses it to pick the taller title font. */
    shouldUseHeadlineHeader: boolean;
};

export default HeaderContextValue;
