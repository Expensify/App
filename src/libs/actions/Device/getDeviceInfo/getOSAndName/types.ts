// Parameter names are predefined and we don't choose it here
// eslint-disable-next-line @typescript-eslint/naming-convention
type GetOSAndName = () => {device_name: string | undefined; os_version: string | undefined};
export default GetOSAndName;
