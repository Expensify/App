// Only Android needs to recreate the map after Location services come back, see index.android.ts
function useLocationServicesRemountKey(): number {
    return 0;
}

export default useLocationServicesRemountKey;
