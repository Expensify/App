type BackgroundLocationPermissionsFlowProps = {
    startPermissionsFlow: boolean;
    setStartPermissionsFlow: React.Dispatch<React.SetStateAction<boolean>>;
    onError: () => void;
    onGrant: () => void;
    onDeny: () => void;
};

export default BackgroundLocationPermissionsFlowProps;
