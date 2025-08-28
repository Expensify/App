declare module 'group-ib-fp' {
    export enum FPAttributeFormat { ClearText = 1 }
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
      enableAndroidCapability(capability: AndroidCapability, callback?: (e: any, isRun: boolean) => void): void;
      setCustomerId(iOSCustomerId: string, androidCustomerId: string, errorCallback?: (e: string) => void): void;
      setTargetURL(url: string, errorCallback?: (e: string) => void): void;
      setGlobalIdURL(url: string, errorCallback?: (e: string) => void): void;
      setSessionId(id: string, errorCallback?: (e: string) => void): void;
      setAttributeTitle(key: string, value: string, format: FPAttributeFormat, errorCallback?: (e: string) => void): void;
      run(errorCallback?: (e: string) => void): void;
    }
  }