// to keep same behavior from before migration
// eslint-disable-next-line @typescript-eslint/naming-convention
type GetOSAndName = () => {device_name: string | undefined; os_version: string | undefined};
export default GetOSAndName;
