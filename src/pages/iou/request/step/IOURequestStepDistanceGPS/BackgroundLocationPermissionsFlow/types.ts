type BackgroundLocationPermissionsFlowProps = {
    startPermissionsFlow: boolean;
    setStartPermissionsFlow: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldShowPermissionsError: React.Dispatch<React.SetStateAction<boolean>>;
    onGrant: () => void;
    onDeny: () => void;
};

export default BackgroundLocationPermissionsFlowProps;
