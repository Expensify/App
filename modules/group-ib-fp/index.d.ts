declare module 'group-ib-fp' {
    export enum FPAttributeFormat { ClearText = 1, Hashed = 2 }
    export enum Capability {
      BatteryStatus = 0,
      Cellular = 1,
      Call = 2,
      Passcode = 3,
      WebView = 4,
      Network = 5,
      Motion = 6,
      Swizzle = 7,
      Location = 8,
      Audio = 9,
      CloudIdentifier = 10,
      DeviceStatus = 11,
      Capture = 12,
      Apps = 13,
      Proxy = 14,
      Keyboard = 15,
      Behavior = 16,
      PreventScreenshots = 17,
      Security = 18,
      Advertise = 19,
      PortScan = 20,
      GlobalId = 21,
    }
    export enum AndroidCapability {
        CellsCollection = 0,
        AccessPointsCollection = 1,
        Location = 2,
        GlobalIdentification = 3,
        CloudIdentification = 4,
        CallIdentification = 5,
        ActivityCollection = 6,
        MotionCollection = 7,
        PackageCollection = 8,
    }
    export class FP {
      static getInstance(): FP;
      enableDebugLogs(): void;
      enableCapability(capability: Capability, callback: (e: string, isRun: boolean) => void): void;
      enableAndroidCapability(capability: AndroidCapability, callback: (e: string, isRun: boolean) => void): void;
      setCustomerId(iOSCustomerId: string, androidCustomerId: string, errorCallback: (e: string) => void): void;
      setTargetURL(url: string, errorCallback: (e: string) => void): void;
      setGlobalIdURL(url: string, errorCallback: (e: string) => void): void;
      setSessionId(id: string, errorCallback: (e: string) => void): void;
      setAttributeTitle(key: string, value: string, format: FPAttributeFormat, isSendOnce: boolean, errorCallback: (e: string) => void): void;
      run(errorCallback?: (e: string) => void): void;
    }
  }