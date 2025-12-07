import { NativeModules, Platform, NativeEventEmitter, EmitterSubscription } from 'react-native';

const LINKING_ERROR =
  `The package 'group-ib-fp' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: '- You have run \'pod install\'\n', default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

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
  GlobalId = 21
}

export enum FPAttributeFormat {
  ClearText = (1 << 0),
  Hashed = (1 << 1),
  Encrypted = (1 << 2)
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
  PackageCollection = 8
}

export type FPErrorHandler = (error: string) => void;
export type FPSessionHandler = (cfids: string | null) => void;
export type FPCookiesHandler = (cookies: Record<string, string> | null) => void;

const EVENT_SESSION_OPENED = "onSessionOpened";
const EVENT_RECEIVE_SESSION = "onReceiveSession";

const ModuleFhpIos = NativeModules.ModuleFhpIos
  ? NativeModules.ModuleFhpIos
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    },
  );

export class FP {
  private static instance: FP | null = null;
  private readonly emitter: NativeEventEmitter | null;
  private readonly activeSubs = new Set<EmitterSubscription>();
  
  private constructor() {
    if (!NativeModules.ModuleFhpIos) {
      console.warn(LINKING_ERROR);
      this.emitter = null;
    } else {
      if (Platform.OS === 'android') {
        this.emitter = new NativeEventEmitter(ModuleFhpIos);
      } else if (Platform.OS === 'ios') {
        this.emitter = new NativeEventEmitter(NativeModules.FPEventEmitter);
      } else {
        this.emitter = null;
      }
    }
  }

  private remove(subscription: EmitterSubscription) {
    try {
      subscription.remove();
    } finally {
      this.activeSubs.delete(subscription);
    }
  }

  public static getInstance(): FP {
    if (!FP.instance) {
      FP.instance = new FP();
    }
    return FP.instance;
  }

  enableCapability(capability: Capability, responseHandler: Function) {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.enableCapability(capability, responseHandler);
    }
  }

  enableAndroidCapability(capability: AndroidCapability, responseHandler: Function) {
    if (Platform.OS === 'android') {
      return ModuleFhpIos.enableAndroidCapability(capability, responseHandler);
    }
  }

  disableCapability(capability: Capability, responseHandler: Function) {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.disableCapability(capability, responseHandler);
    }
  }

  disableAndroidCapability(capability: AndroidCapability, responseHandler: Function) {
    if (Platform.OS === 'android') {
      return ModuleFhpIos.disableAndroidCapability(capability, responseHandler);
    }
  }

  setLogURL(url: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setLogURL(url, errorCallback);
  }

  setTargetURL(url: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setTargetURL(url, errorCallback);
  }

  setCustomerId(iOSCustomerId: string, androidCustomerId: string, errorCallback: FPErrorHandler) {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.setCustomerId(iOSCustomerId, errorCallback);
    } else if (Platform.OS === 'android') {
      return ModuleFhpIos.setCustomerId(androidCustomerId, errorCallback);
    }
  }

  run(errorCallback: FPErrorHandler) {
    return ModuleFhpIos.run(errorCallback);
  }

  stop(errorCallback: FPErrorHandler) {
    return ModuleFhpIos.stop(errorCallback);
  }

  enableDebugLogs() {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.enableDebugLogs();
    }
  }

  setPublicKeyForPinning(publicKey: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setPublicKeyForPinning(publicKey, errorCallback);
  }

  setPublicKeysForPinning(publicKeys: string[], errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setPublicKeysForPinning(publicKeys, errorCallback);
  }

  setUserAgent(userAgent: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setUserAgent(userAgent, errorCallback);
  }

  setSharedKeychainIdentifier(identifier: string) {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.setSharedKeychainIdentifier(identifier);
    }
  }

  setKeepAliveTimeout(sec: number, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setKeepAliveTimeout(sec, errorCallback);
  }

  setHeaderValue(value: string, key: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setHeaderValue(value, key, errorCallback);
  }

  setLogin(login: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setLogin(login, errorCallback);
  }

  setSessionId(sessionId: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setSessionId(sessionId, errorCallback);
  }

  setCustomEvent(event: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setCustomEvent(event, errorCallback);
  }

  setAttributeTitle(title: string, value: string, format: FPAttributeFormat, isSendOnce: boolean, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setAttributeTitle(title, value, format, isSendOnce, errorCallback);
  }

  setGlobalIdURL(url: string, errorCallback: FPErrorHandler) {
    if (Platform.OS === 'android') {
      return ModuleFhpIos.setGlobalIdURL(url, errorCallback);
    }
  }

  getCookies(cookiesCallback: FPCookiesHandler) {
    return ModuleFhpIos.getCookies(cookiesCallback);
  }

  changeBehaviorExtendedData(isExtendedData: boolean) {
    if (Platform.OS === 'ios') {
      return ModuleFhpIos.changeBehaviorExtendedData(isExtendedData);
    }
  }

  setPubKey(pubKey: string, errorCallback: FPErrorHandler) {
    return ModuleFhpIos.setPubKey(pubKey, errorCallback);
  }

  sessionDidOpen(callback: FPSessionHandler): () => void {
    if (!this.emitter) return () => {};
    const subscription = this.emitter.addListener(
      EVENT_SESSION_OPENED,
      (cfids: string) => callback(cfids),
    );
    this.activeSubs.add(subscription);
    return () => this.remove(subscription);
  }

  sessionDidGetId(callback: FPSessionHandler): () => void {
    if (!this.emitter) return () => {};
    const subscription = this.emitter.addListener(
      EVENT_RECEIVE_SESSION,
      (cfids: string) => callback(cfids),
    );
    this.activeSubs.add(subscription);
    return () => this.remove(subscription);
  }
}