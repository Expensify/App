declare module 'group-ib-fp' {
    export enum FPAttributeFormat { ClearText = 1 }
    export class FP {
      static getInstance(): FP;
      setCustomerId(iOSCustomerId: string, androidCustomerId: string, errorCallback?: (e: string) => void): void;
      setTargetURL(url: string, errorCallback?: (e: string) => void): void;
      setSessionId(id: string, errorCallback?: (e: string) => void): void;
      setAttributeTitle(key: string, value: string, format: FPAttributeFormat, errorCallback?: (e: string) => void): void;
      run(errorCallback?: (e: string) => void): void;
    }
  }