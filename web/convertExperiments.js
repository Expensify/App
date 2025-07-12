(function() {
if (typeof window.convert !== "undefined") return;
window.convert = window.convert || {};
const convertData = Object.assign({"device":{"mobile":false,"tablet":false,"desktop":true},"geo":{"country":"IL","city":"TELAVIV","continent":"AS","state":""}}, {
logLevel: 4,
useMutationObserver: true,
usePolling: false,
useSPAOptimizations: true,
version: '1.1.5',
generatedAt: '2025-06-10T10:06:15.189Z'
});
const convertConfig = {"account_id":"10042537","project":{"id":"100413459","name":"Project #100413459","type":"web","utc_offset":"0","domains":[{"tld":"expensify.com","hosts":["expensify.com","new.expensify.com"]}],"global_javascript":null,"settings":{"include_jquery":true,"include_jquery_v1":false,"disable_spa_functionality":false,"do_not_track_referral":false,"allow_crossdomain_tracking":true,"data_anonymization":true,"do_not_track":"OFF","global_privacy_control":"OFF","min_order_value":0,"max_order_value":99999,"version":"2025-06-09T18:41:26+00:00-402","tracking_script":{"current_version":"1.1.5","latest_version":"1.1.5"},"outliers":{"order_value":{"detection_type":"none"},"products_ordered_count":{"detection_type":"none"}},"integrations":{"google_analytics":{"enabled":true,"type":"ga4","measurementId":"G-6BR2QJRCCD","auto_revenue_tracking":false,"no_wait_pageview":false},"kissmetrics":{"enabled":false},"visitor_insights":{"tracking_id":null}}},"custom_domain":null},"experiences":[{"id":"1004144638","name":"g-ex50-toggle-features [PROD]","type":"deploy","status":"active","global_js":null,"global_css":"","environment":"production","settings":{"min_order_value":0,"max_order_value":99999,"matching_options":{"audiences":"any","locations":"any"},"outliers":{"order_value":{"detection_type":"none"},"products_ordered_count":{"detection_type":"none"}}},"key":"g-x33-nbrdng-nw-stp-c-2-cln","version":10,"locations":["1004115649"],"site_area":null,"audiences":[],"goals":["100470997","100470998"],"integrations":[{"provider":"google_analytics","enabled":true,"type":"ga4","measurementId":"G-6BR2QJRCCD"}],"variations":[{"id":"1004341818","name":"Deployment","key":"1004341818-deployment","status":"running","changes":[{"id":1004555452,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004555453,"type":"customCode","data":{"css":"","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function onDomReady(callback) {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function onMutation(cb, target, options) {
    if (!target) throw Error('onMutation: taget must be an element');

    const observer = new MutationObserver(() => { try { cb(); } catch (e) { /* silent */ }});
    observer.observe(target, { subtree: true, childList: true, ...options });
  }

  function whenAllQualified({ conditions, logger }) {
    const conditionsPromised = [];
    const failureReasons = [];

    conditions.forEach(conditionFn => {
      const conditionName = conditionFn.name;
      const saveReason = () => failureReasons.push(conditionName);

      try {
        const result = conditionFn();

        if (typeof result.then !== 'function') {
          conditionsPromised.push(new Promise((resolve, reject) => {
            result ? resolve(result) : (saveReason() && reject(conditionName));
          }));
        } else {
          conditionsPromised.push(new Promise((resolve, reject) => {
            result
              .then(val => { (typeof val === 'undefined' || val)  ? resolve(val) : (saveReason() && reject(conditionName)); })
              .catch(() => { saveReason() && reject(conditionName); });
          }));
        }
      } catch (e) {
        saveReason() && conditionsPromised.push(Promise.reject(conditionName));
      }
    });

    setTimeout(() => {
      Promise.allSettled(conditionsPromised).then(results => {
        const failedConditions = results.map(result => (result.status === 'rejected' && result.reason)).filter(Boolean);
        failedConditions.length > 1 && logger && logger.info('[p]unqualified', 'All failed:', failedConditions);
      });
    }, 0);

    return Promise.all(conditionsPromised).catch((reason) => {
      logger && logger.info('[p]unqualified', 'First failed:', [reason]);
      return Promise.reject(reason);
    });
  }

  class Loader {
    constructor({ name, load }) {
      this.name = name;
      this.load = new Proxy(load, {
        apply: (target, thisArg,  [ settings ]) => {
          const { logger, campaignID, onRepeat } = settings;
          delete settings?.logger; delete settings?.onRepeat;
          const campaignWindowStorage = getWindowStorage(campaignID);

          if (campaignWindowStorage.hasLoadedFlag && onRepeat) { onRepeat(); return Promise.resolve(); }
          campaignWindowStorage.hasLoadedFlag = true;

          const loadSmart =  (new Promise(resolve => {
            if (campaignWindowStorage.isLoadedLocallyFlag) {
              logger?.ok('[p]loading...', 'locally');
              campaignWindowStorage.loadLocally();
              resolve();
            } else {
              logger?.ok('[p]loading...', { loader: name, ...settings });
              target.apply(thisArg, [ settings ]).then(resolve);
            }
          }));

          return loadSmart.catch(error => {
            logger?.error('[p]loading failed', { loader: name, ...settings, error: error.message });
            return Promise.reject(error);
          });
        }
      });
    }
  }

  function getConvertCampaignLoader() {
    return new Loader({
      name: 'Convert loader',
      load: ({ convertExperienceID, campaignID }) =>  (new Promise((res) => {
        window.lc = window.lc || {};
        window.lc.convert = window.lc.convert || {};
        window.lc.convert[campaignID] = true;

        window._conv_q = window._conv_q || [];
        window._conv_q.push(['executeExperiment', convertExperienceID]);
        res();
      }))
    });
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  function watchCheckResult({ checkWhat, checkWhen, callbacks, skipPreCheckCb = false }) {
    const savedState = { map: new Map(), boolean: false };

    updateFuncState({ isPreCheck: true, skipCallbacks: skipPreCheckCb });

    checkWhen(updateFuncState);

    function updateFuncState(options) {
      const { isPreCheck = false, skipCallbacks = false } = (options || {});
      const funcResult = checkWhat();
      const funcStateDiff = getFuncStateDiff(funcResult, savedState);

      savedState.map = funcStateDiff.map;
      if (typeof funcStateDiff.boolean !== 'undefined') {
        savedState.boolean = funcStateDiff.boolean;
      }

      !skipCallbacks && runCallbacks(funcStateDiff, callbacks, isPreCheck);
    }
  }

  function getFuncStateDiff(funcResult, prevState) {
    const resultIsMap = funcResult instanceof Map;
    const resultIsNodeListOrArray = funcResult instanceof NodeList || Array.isArray(funcResult);

    if (resultIsMap || resultIsNodeListOrArray) {
      let newMap = resultIsMap ? funcResult : new Map(Array.from(funcResult).map(item => [ item, null ]));
      return {
        ...getBooleanStateDiff(Boolean(funcResult), prevState.boolean),
        ...getMapStateDiff(newMap, prevState.map),
        funcResult
      };
    }

    return {
      ...getBooleanStateDiff(Boolean(funcResult), prevState.boolean),
      ...getMapStateDiff(new Map(), prevState.map),
      funcResult
    };
  }

  function runCallbacks(funcStateDiff, callbacks, isPreCheck) {
    const { inList, outList, map, boolean, funcResult } = funcStateDiff;
    const { onIn, onOut, onAllOut, onTrue, onFalse } = callbacks;
    if (inList.length) {
      try { onIn && onIn(inList, isPreCheck); } catch (e) { /* silent */ }
    }

    if (outList.length) {
      try { onOut && onOut(outList); } catch (e) { /* silent */ }

      if (!map.size) {
        try { onAllOut && onAllOut(outList); } catch (e) { /* silent */ }
      }
    }

    if (boolean === true) {
      try { onTrue && onTrue(funcResult); } catch (e) { /* silent */ }
    }

    if (boolean === false) {
      try { onFalse && onFalse(); } catch (e) { /* silent */ }
    }
  }

  function getBooleanStateDiff(newBoolean, oldBoolean) {
    if (newBoolean !== oldBoolean) {
      return { boolean: newBoolean };
    }

    return {};
  }

  function getMapStateDiff(newMap, oldMap) {
    const inList = [];
    const outList = [];

    newMap.forEach((value, key) => {
      if (!oldMap.has(key) || oldMap.get(key) !== value) {
        inList.push(key);
      }
    });
    oldMap.forEach((value, key) => {
      if (!newMap.has(key) || newMap.get(key) !== value) {
        outList.push(key);
      }
    });

    return { map: newMap, inList, outList };
  }

  function getAllPageMutationsTarget() {
    return document.querySelector('#root') || document.body;
  }

  function getObjectFromIndexedDB(key) {
    return new Promise((res, rej) => {
      const request = indexedDB.open('OnyxDB');

      request.onerror = function(dbEvent) {
        rej(`Error opening database: ${dbEvent.target?.error}`);
      };

      request.onsuccess = function(event) {
        try {
          const db = event.target?.result;

          const transaction = db.transaction('keyvaluepairs', 'readonly');
          const objectStore = transaction.objectStore('keyvaluepairs');

          const getRequest = objectStore.get(key);

          getRequest.onsuccess = function() {
            const {result} = getRequest;
            if (result) {
              res(result);
            } else {
              rej('No data found for key session');
            }
          };

          // eslint-disable-next-line no-shadow
          getRequest.onerror = function(event) {
            rej(`Error retrieving value: ${event.target?.error}`);
          };
        } catch (err) {
          rej(`Error creating request: ${err}`);
        }
      };
    });
  }

  function isNewPage() {
    return window?.location?.host?.includes('new');
  }

  async function isEngLang() {
    const lang = await getObjectFromIndexedDB('nvp_preferredLocale');

    return lang === 'en';
  }

  const CAMPAIGN_ID = 'ex50';
  const CAMPAIGN_PREFIX = 'lc-ex50';

  const HTML = document.documentElement;

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  function runCampaign({ convertExperienceID, logger }) {
    const loader = getConvertCampaignLoader();
    loader.load({
      campaignID: CAMPAIGN_ID,
      convertExperienceID, logger,
      onRepeat: () => campaignPubSub.trigger(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED)
    });
  }

  function revokeCampaign({ reason, logger }) {
    if (isCampaignApplied()) {
      campaignPubSub.trigger(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, reason);
      logger && logger.info('[p]Campaign revoked', reason);
    }
  }

  function isCampaignApplied() {
    return HTML.classList.contains(CAMPAIGN_PREFIX);
  }

  const SCRIPT_NAME = 'targeting';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  const convertExperienceID = '1004144639';

  logger.info('running');
  onDomReady(init);

  async function init() {
    if (campaignWindowStorage.targetingLoaded) return;

    if (await !hasNotCompletedOnboarding()) {
      logger.warn('User completed onboarding, skipping.');
      return;
    }

    watchCheckResult({
      checkWhat: getOnboardingAccounting,
      checkWhen: cb => onMutation(cb, getAllPageMutationsTarget(), {attributes: false}),
      callbacks: {
        onTrue: () => {
          whenAllQualified({ logger: logger.debug, conditions: [isNewPage, isEngLang, hasNotCompletedOnboarding, getOnboardingPurpose, getOnboardingCompanySize],
          })
            .then(() =>  runCampaign({convertExperienceID, logger })
            )
            .catch((reason) =>  revokeCampaign({ logger, reason })
            );
        },
      }
    });
    campaignWindowStorage.targetingLoaded = true;
    logger.info('inited');
  }

  async function hasNotCompletedOnboarding() {
    const entry = await getObjectFromIndexedDB('nvp_onboarding');

    return entry?.hasCompletedGuidedSetupFlow !== true;
  }

  async function getOnboardingPurpose() {
    const entry = await getObjectFromIndexedDB('onboardingPurposeSelected');
    return entry === 'newDotManageTeam';
  }

  async function getOnboardingCompanySize() {
    const entry = await getObjectFromIndexedDB('onboardingCompanySize');
    return entry === '1-10';
  }

  function getOnboardingAccounting() {
    const element = document.querySelector('[data-testid="BaseOnboardingAccounting"]');
    return element;
  }
})();
//# sourceURL=url://LeanConvert/ex50/targeting/js.js
}}}],"traffic_allocation":100}]},{"id":"1004144639","name":"c-ex50-toggle-features [PROD]","type":"a\/b","status":"active","global_js":null,"global_css":"","environment":"production","settings":{"min_order_value":0,"max_order_value":99999,"matching_options":{"audiences":"any","locations":"any"},"outliers":{"order_value":{"detection_type":"none"},"products_ordered_count":{"detection_type":"none"}}},"key":"c-x33-nbrdng-nw-stp-c-2-cln","version":10,"locations":["1004115650"],"site_area":null,"audiences":[],"goals":["100470997","100470998"],"integrations":[{"provider":"google_analytics","enabled":true,"type":"ga4","measurementId":"G-6BR2QJRCCD"}],"variations":[{"id":"1004341819","name":"Original Page","key":"1004341819-original-page","status":"running","changes":[{"id":1004555454,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004555455,"type":"customCode","data":{"css":"","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function waitFor(conditionFn, options = {}) {
    const { signal, stopAfter = 7000 } = options;

    return new Promise((resolve, reject) => {
      const interval = 50;
      let stopByTimeout = false;
      let value;

      if (signal) {
        signal.addEventListener('abort', reject);
      }

      window.setTimeout(() => { stopByTimeout = true; }, stopAfter);

      (function _innerWaitFor() {
        if (stopByTimeout) { reject(Error('waitFor stopped: by timeout')); return; }
        try { value = conditionFn(); } catch (e) { /* silent */ }
        value ? resolve(value) : window.setTimeout(_innerWaitFor, interval);
      })();
    });
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  const CAMPAIGN_ID = 'ex50';
  const CAMPAIGN_PREFIX = 'lc-ex50';

  const HTML = document.documentElement;

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  async function trackFsEvent({eventName, properties = {}, logger}) {
    try {
      const FS = await waitFor(() => window.FS, { stopAfter: 3000 });
      FS('trackEvent', {
        name: eventName,
        properties: properties,
      });
      logger.info(`FS metric sent: ${eventName}`, properties);
    } catch (err) {
      logger.error(err);
    }
  }

  const SCRIPT_NAME = 'control-v0';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  function trackFSMetric(metricName, properties = {}) {
    trackFsEvent({
      eventName: `${CAMPAIGN_PREFIX}-${metricName}`,
      properties: {variant: SCRIPT_NAME, ...properties},
      logger: logger,
    });
  }

  function createAccountSelectionValidator({ logger, useCapture = true }) {
    let hasSelectedAccount = false;
    let container = null;

    function getContainer() {
      const baseElement = document.querySelector('[data-testid="BaseOnboardingAccounting"]');
      return baseElement?.firstElementChild instanceof HTMLElement
        ? baseElement.firstElementChild
        : null;
    }

    function handleClick(ev) {
      if (hasSelectedAccount) {
        return;
      }

      if (!(ev.target instanceof Element)) {
        return;
      }

      const clickedItem = ev.target.closest('[data-testid^="base-list-item"]');
      if (clickedItem) {
        hasSelectedAccount = true;
      }
    }

    function handleKeydown(ev) {
      if (hasSelectedAccount) {
        return;
      }

      if (ev.key !== 'Enter') {
        return;
      }

      const focusedElement = document.activeElement;
      if (!focusedElement || !container.contains(focusedElement)) {
        return;
      }

      const targetElement = ev.target instanceof Element ? ev.target : null;
      if (targetElement && targetElement.contains(focusedElement) &&
        focusedElement.firstChild instanceof HTMLElement &&
        focusedElement.firstChild.dataset?.testid?.startsWith('base-list-item')) {
        hasSelectedAccount = true;
      }
    }

    function initialize() {
      hasSelectedAccount = false;

      container = getContainer();
      if (!container) {
        logger.error('Container not found, cannot add selection listeners.');
        return false;
      }

      container.addEventListener('click', handleClick, useCapture);
      container.addEventListener('keydown', handleKeydown, useCapture);

      return true;
    }

    function cleanup() {
      if (container) {
        container.removeEventListener('click', handleClick, useCapture);
        container.removeEventListener('keydown', handleKeydown, useCapture);
        container = null;
      }
    }

    function reset() {
      hasSelectedAccount = false;
    }

    return {
      initialize,
      cleanup,
      reset,
      get isSelected() {
        return hasSelectedAccount;
      },
      get containerElement() {
        return container;
      }
    };
  }

  const accountValidator = createAccountSelectionValidator({
    logger,
    useCapture: false
  });

  function addAccountingSelectionListeners() {
    accountValidator.initialize();
  }

  function addContinueButtonClickListener(button) {
    const CLICK_LISTENER_ATTR = `data-${CAMPAIGN_PREFIX}-click-listener`;

    if (!button || button.getAttribute(CLICK_LISTENER_ATTR)) {
      return;
    }
    button.addEventListener('click', () => {
      if (accountValidator.isSelected) {
        trackFSMetric('confirm');
      }
    }, true);
    button.setAttribute(CLICK_LISTENER_ATTR, 'true');
  }

  function handleMetric() {
    if (!accountValidator.containerElement) {
      logger.error('Container not found, cannot add selection listeners.');
      return;
    }

    const defaultContinueButton = accountValidator.containerElement.querySelector('button[data-listener="Enter"]');
    addContinueButtonClickListener(defaultContinueButton);
  }

  logger.info('running');
  init();

  function init() {
    if (campaignWindowStorage.contentLoaded) return;

    try {
      applyVariant();
      initVariant();
    } catch (err) {
      logger.error(err);
    }

    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED, applyVariant);
    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, revokeVariant);
  }

  function applyVariant() {
    accountValidator.reset();
    addAccountingSelectionListeners();
    handleMetric();
    HTML.classList.add(CAMPAIGN_PREFIX);
    logger.debug.info('Variant applied');
  }

  function revokeVariant() {
    accountValidator.cleanup();
    HTML.classList.remove(CAMPAIGN_PREFIX);
    logger.debug.info('Variant revoked');
  }

  function initVariant() {
    campaignWindowStorage.contentLoaded = true;
    trackFSMetric('impression');
    logger.debug.info('Variant initialized');
  }
})();
//# sourceURL=url://LeanConvert/ex50/control-v0/js.js
}}}],"traffic_allocation":50},{"id":"1004341820","name":"Variation 1","key":"1004341820-variation-1","status":"running","changes":[{"id":1004555456,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004555457,"type":"customCode","data":{"css":".lc-ex50 div[style*=\"color-scheme: light\"] .lc-ex50-custom-step {\n  --bgColor: rgb(252, 251, 249);\n  --paragraphColor: rgb(0, 46, 34);\n  --textColor: rgb(0, 46, 34);\n  --progressBackgroundColor: rgb(230, 225, 218);\n  --btnTextColor: rgb(255, 255, 255);\n  --featureBgColor: #F8F4F0;\n  --featureSelectedBgColor: #E6E1DA;\n  --featureHoverBgColor: #F2EDE7;\n  --checkboxBorderColor: #D8D1C7;\n}\n.lc-ex50 .lc-ex50-step {\n  transition: transform 250ms;\n  transition-timing-function: cubic-bezier(0.33, 0.96, 0.93, 0.98);\n  transform: translateX(0);\n}\n.lc-ex50 .lc-ex50-step:not(.lc-ex50-active) {\n  display: none;\n}\n.lc-ex50 .lc-ex50-custom-step {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  --bgColor: rgb(6, 27, 9);\n  --textColor: rgb(231, 236, 233);\n  --paragraphColor: #afbbb0;\n  --btnPrimaryColor: rgb(3, 212, 124);\n  --btnPrimaryHoverColor: rgb(0, 194, 113);\n  --progressBackgroundColor: rgb(26, 61, 50);\n  --checkboxBorderColor: #224F41;\n  --btnTextColor: rgb(231, 236, 233);\n  --arrowHoverColor: rgb(231, 236, 233);\n  --featureBgColor: #072419;\n  --featureSelectedBgColor: #1A3D32;\n  --featureHoverBgColor: #0A2E25;\n  --featureHoverBgBoxShadowColor: rgba(3, 212, 124, 0.1);\n  background-color: var(--bgColor);\n  color: var(--textColor);\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  line-height: 20px;\n}\n.lc-ex50 .lc-ex50-custom-step h1 {\n  font-size: 22px;\n  text-align: left;\n  font-family: \"Expensify New Kansas\", \"Segoe UI Emoji\", \"Noto Color Emoji\";\n  font-style: normal;\n  font-weight: 500;\n  line-height: 28px;\n  margin: 0;\n}\n.lc-ex50 .lc-ex50-custom-step p {\n  font-weight: 400;\n  color: var(--paragraphColor);\n  margin: 0;\n}\n.lc-ex50 .lc-ex50-custom-step button {\n  border: none;\n  width: 100%;\n  background-color: var(--btnPrimaryColor);\n  border-radius: 100px;\n  min-height: 52px;\n  min-width: 52px;\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  font-style: normal;\n  font-weight: 700;\n  cursor: pointer;\n  color: var(--btnTextColor);\n}\n.lc-ex50 .lc-ex50-custom-step button:active {\n  opacity: 0.8;\n}\n.lc-ex50 .lc-ex50-custom-step button.lc-ex50-cta-primary:hover {\n  background-color: var(--btnPrimaryHoverColor);\n}\n.lc-ex50 .lc-ex50-header {\n  height: 72px;\n  padding: 0 8px;\n  display: flex;\n  position: relative;\n  align-items: center;\n}\n.lc-ex50 .lc-ex50-back {\n  padding: 10px;\n  cursor: pointer;\n}\n.lc-ex50 .lc-ex50-progressbar {\n  border-radius: 24px;\n  position: absolute;\n  background-color: var(--progressBackgroundColor);\n  height: 4px;\n  width: 48px;\n  overflow: hidden;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.lc-ex50 .lc-ex50-progressbar::after {\n  content: \"\";\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 100%;\n  display: block;\n  width: var(--pbProgress, 80%);\n  background-color: rgb(3, 212, 124);\n}\n.lc-ex50 .lc-ex50-content {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 20px 32px;\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-content {\n    overflow: auto;\n    padding: 20px 16px;\n  }\n}\n.lc-ex50 .lc-ex50-features-container {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 16px;\n}\n.lc-ex50 .lc-ex50-feature {\n  background-color: var(--featureBgColor);\n  border-radius: 8px;\n  padding: 16px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.lc-ex50 .lc-ex50-feature:has(input[type=checkbox]:checked) {\n  background-color: var(--featureSelectedBgColor);\n}\n.lc-ex50 .lc-ex50-feature:hover {\n  cursor: pointer;\n  background-color: var(--featureHoverBgColor);\n  box-shadow: 0 2px 8px var(--featureHoverBgBoxShadowColor);\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-feature {\n    padding: 8px;\n  }\n}\n.lc-ex50 .lc-ex50-feature-locked label:hover {\n  cursor: default;\n}\n.lc-ex50 .lc-ex50-feature-content {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-feature-content {\n    gap: 6px;\n  }\n}\n.lc-ex50 .lc-ex50-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n}\n.lc-ex50 .lc-ex50-feature-title {\n  font-weight: 700 !important;\n  font-size: 15px;\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-feature-title {\n    font-size: 12px;\n  }\n}\n.lc-ex50 .lc-ex50-checkbox {\n  position: relative;\n  width: 16px;\n  height: 16px;\n  margin-left: 8px;\n}\n.lc-ex50 .lc-ex50-checkbox input[type=checkbox] {\n  position: absolute;\n  opacity: 0;\n  cursor: pointer;\n  height: 0;\n  width: 0;\n}\n.lc-ex50 .lc-ex50-checkbox label {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 16px;\n  width: 16px;\n  background-color: transparent;\n  border: 2px solid var(--checkboxBorderColor);\n  border-radius: 4px;\n  cursor: pointer;\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-checkbox label {\n    width: 12px;\n    height: 12px;\n  }\n}\n.lc-ex50 .lc-ex50-checkbox label:after {\n  content: \"\";\n  position: absolute;\n  display: none;\n  left: 4px;\n  top: 0px;\n  width: 6px;\n  height: 10px;\n  border: solid white;\n  border-width: 0 2px 2px 0;\n  transform: rotate(45deg);\n}\n@media screen and (max-width: 768px) {\n  .lc-ex50 .lc-ex50-checkbox label:after {\n    width: 4px;\n    height: 8px;\n    left: 3px;\n  }\n}\n.lc-ex50 .lc-ex50-checkbox input[type=checkbox]:checked ~ label {\n  background-color: var(--btnPrimaryColor);\n  border-color: var(--btnPrimaryColor);\n}\n.lc-ex50 .lc-ex50-checkbox input[type=checkbox]:checked ~ label:after {\n  display: block;\n}\n.lc-ex50 .lc-ex50-subtitle {\n  margin-block: 16px !important;\n}\n.lc-ex50 .lc-ex50-ctas {\n  margin-top: 36px;\n}\n.lc-ex50 .lc-ex50-out {\n  transform: translateX(-30%);\n}\n.lc-ex50 .lc-ex50-in {\n  transform: translateX(100%);\n}\n.lc-ex50 .lc-ex50-cta-primary {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 52px;\n}\n.lc-ex50 .lc-ex50-cta-primary .lc-ex50-btn-text, .lc-ex50 .lc-ex50-cta-primary .lc-ex50-btn-spinner {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  transition: opacity 225ms ease-in-out;\n}\n.lc-ex50 .lc-ex50-cta-primary .lc-ex50-btn-spinner {\n  opacity: 0;\n}\n.lc-ex50 .lc-ex50-cta-primary .lc-ex50-btn-spinner svg {\n  animation: spin 0.8s linear infinite;\n  height: 20px;\n  width: 20px;\n}\n.lc-ex50 .lc-ex50-cta-loading {\n  pointer-events: none;\n}\n.lc-ex50 .lc-ex50-cta-loading .lc-ex50-btn-text {\n  opacity: 0;\n}\n.lc-ex50 .lc-ex50-cta-loading .lc-ex50-btn-spinner {\n  opacity: 1;\n}\n@keyframes spin {\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n\n\/*# sourceURL=url:\/\/LeanConvert\/ex50\/variant-v1\/css.css *\/","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function waitFor(conditionFn, options = {}) {
    const { signal, stopAfter = 7000 } = options;

    return new Promise((resolve, reject) => {
      const interval = 50;
      let stopByTimeout = false;
      let value;

      if (signal) {
        signal.addEventListener('abort', reject);
      }

      window.setTimeout(() => { stopByTimeout = true; }, stopAfter);

      (function _innerWaitFor() {
        if (stopByTimeout) { reject(Error('waitFor stopped: by timeout')); return; }
        try { value = conditionFn(); } catch (e) { /* silent */ }
        value ? resolve(value) : window.setTimeout(_innerWaitFor, interval);
      })();
    });
  }

  function debounce(callbackFn, timeout = 300, settings = {}) {
    const { context, leading = false, trailing = true } = settings;
    let timer; let flag;

    return (...args) => {
      const shouldTrail = leading ? (flag && trailing) : trailing;
      const shouldLead = !flag && leading;

      shouldLead && callbackFn.apply(context || window, args);
      flag = true; clearTimeout(timer);
      timer = setTimeout(() => { shouldTrail && callbackFn.apply(context || window, args); flag = false; }, timeout);
    };
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  const CAMPAIGN_ID = 'ex50';
  const CAMPAIGN_PREFIX = 'lc-ex50';

  const HTML = document.documentElement;

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  function getObjectFromIndexedDB(key) {
    return new Promise((res, rej) => {
      const request = indexedDB.open('OnyxDB');

      request.onerror = function(dbEvent) {
        rej(`Error opening database: ${dbEvent.target?.error}`);
      };

      request.onsuccess = function(event) {
        try {
          const db = event.target?.result;

          const transaction = db.transaction('keyvaluepairs', 'readonly');
          const objectStore = transaction.objectStore('keyvaluepairs');

          const getRequest = objectStore.get(key);

          getRequest.onsuccess = function() {
            const {result} = getRequest;
            if (result) {
              res(result);
            } else {
              rej('No data found for key session');
            }
          };

          // eslint-disable-next-line no-shadow
          getRequest.onerror = function(event) {
            rej(`Error retrieving value: ${event.target?.error}`);
          };
        } catch (err) {
          rej(`Error creating request: ${err}`);
        }
      };
    });
  }

  async function trackFsEvent({eventName, properties = {}, logger}) {
    try {
      const FS = await waitFor(() => window.FS, { stopAfter: 3000 });
      FS('trackEvent', {
        name: eventName,
        properties: properties,
      });
      logger.info(`FS metric sent: ${eventName}`, properties);
    } catch (err) {
      logger.error(err);
    }
  }

  const SCRIPT_NAME = 'variant-v1';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  function trackFSMetric(metricName, properties = {}) {
    trackFsEvent({
      eventName: `${CAMPAIGN_PREFIX}-${metricName}`,
      properties: {variant: SCRIPT_NAME, ...properties},
      logger: logger,
    });
  }

  function createAccountSelectionValidator({ logger, useCapture = true }) {
    let hasSelectedAccount = false;
    let container = null;

    function getContainer() {
      const baseElement = document.querySelector('[data-testid="BaseOnboardingAccounting"]');
      return baseElement?.firstElementChild instanceof HTMLElement
        ? baseElement.firstElementChild
        : null;
    }

    function handleClick(ev) {
      if (hasSelectedAccount) {
        return;
      }

      if (!(ev.target instanceof Element)) {
        return;
      }

      const target = ev.target;

      const ARIA_LABELS = ['QuickBooks Online', 'QuickBooks Desktop', 'Xero', 'NetSuite', 'Sage Intacct', 'SAP', 'Oracle', 'Microsoft Dynamics', 'Other', 'None'];

      const clickedItem = ARIA_LABELS.some(ariaLabel => target?.closest(`[aria-label="${ariaLabel}"]`));

      if (clickedItem) {
        hasSelectedAccount = true;
      }
    }

    function handleKeydown(ev) {
      if (hasSelectedAccount) {
        return;
      }

      if (ev.key !== 'Enter') {
        return;
      }

      const focusedElement = document.activeElement;
      if (!focusedElement || !container.contains(focusedElement)) {
        return;
      }

      const targetElement = ev.target instanceof Element ? ev.target : null;
      if (targetElement && targetElement.contains(focusedElement) &&
        focusedElement.firstChild instanceof HTMLElement &&
        focusedElement.firstChild.dataset?.testid?.startsWith('base-list-item')) {
        hasSelectedAccount = true;
      }
    }

    function initialize() {
      hasSelectedAccount = false;

      container = getContainer();
      if (!container) {
        logger.error('Container not found, cannot add selection listeners.');
        return false;
      }

      container.addEventListener('click', handleClick, useCapture);
      container.addEventListener('keydown', handleKeydown, useCapture);

      return true;
    }

    function cleanup() {
      if (container) {
        container.removeEventListener('click', handleClick, useCapture);
        container.removeEventListener('keydown', handleKeydown, useCapture);
        container = null;
      }
    }

    function reset() {
      hasSelectedAccount = false;
    }

    return {
      initialize,
      cleanup,
      reset,
      get isSelected() {
        return hasSelectedAccount;
      },
      get containerElement() {
        return container;
      }
    };
  }

  var SVG = {
    CATEGORIES: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.6119 29.1333C29.6119 29.1333 30.7393 28.4706 30.7393 27.9392C30.7393 27.4079 32.5295 16.4648 32.5295 16.4648C32.5295 16.4648 32.7275 15.4041 31.4687 15.4041H12.2336C12.2336 15.4041 11.3709 15.4041 11.1062 16.0001C10.8415 16.5962 8.91797 28.8686 8.91797 28.8686L29.6119 29.1333V29.1333Z" fill="#FFD7B0"/>
      <path d="M8.7174 11.0256C8.7174 11.0256 7.05859 11.755 7.05859 12.6844V28.4039C7.05859 28.4039 7.71937 28.8568 7.92133 28.9353C8.12329 29.0137 8.91544 28.8686 8.91544 28.8686L11.1703 15.6687C11.1703 15.6687 12.2978 15.4707 12.5625 15.4707C12.8272 15.4707 29.476 15.1393 29.476 15.1393L29.1446 13.0825C29.1446 13.0825 28.8133 12.6178 28.2152 12.6178C27.6172 12.6178 15.082 12.9491 15.082 12.9491L14.0879 12.2864L12.7605 11.0923L8.71544 11.0256H8.7174Z" fill="#FFC68C"/>
      <path d="M7.12109 12.8274C7.12109 11.8863 7.88383 11.1255 8.82304 11.1255H12.5877C13.0936 11.1255 13.572 11.349 13.8955 11.7372L14.4995 12.4608C14.6347 12.6216 14.8347 12.7157 15.0445 12.7157H28.8307C29.2228 12.7157 29.5405 13.0333 29.5405 13.4255V15.2588" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.83089 29.0118L11.0132 16.1315C11.0897 15.6786 11.4818 15.3492 11.9407 15.3492H31.6111C32.1934 15.3492 32.6346 15.8727 32.5385 16.4472L30.5405 28.2314C30.464 28.6843 30.0719 29.0137 29.613 29.0137H8.12109C7.57208 29.0137 7.12698 28.5686 7.12698 28.0196L7.11914 12.8296" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.31543 26.8784H30.7387" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    ACCOUNTING: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.3624 5.36492V5.29384H28.8238C31.0678 5.18326 32.4184 6.61082 32.4184 8.8874V28.1209C32.4184 29.273 32.0718 30.2079 31.439 30.8358L31.4173 30.8585C30.8013 31.4568 29.9187 31.7697 28.8238 31.7154H17.4686C15.2255 31.826 13.875 30.3984 13.875 28.1219V8.8874C13.875 7.8192 14.1722 6.93858 14.7221 6.31563C15.0222 5.97207 15.3963 5.70848 15.8396 5.53374C16.1851 5.3975 16.5692 5.31654 16.9927 5.29482C17.1457 5.28594 17.3057 5.28594 17.4686 5.29384H17.8516" fill="#4ED7DE"/>
      <path d="M19.7741 5.29392H19.391C19.2281 5.28602 19.0682 5.28602 18.9152 5.2949C18.4917 5.31662 18.6052 5.14484 18.2606 5.28207L17.7285 5.39955V4.75587C17.7285 3.45765 18.5479 2.83667 19.8422 2.83667H23.1712C24.4664 2.83667 25.2849 3.45765 25.2849 4.75587V10.5688C25.2849 11.0298 24.8752 11.3122 24.4655 10.9785L23.1455 9.77896C22.6736 9.34359 22.3725 9.34359 21.9134 9.77896L20.5915 10.9785C20.1818 11.3122 19.7721 11.0298 19.7721 10.5688V5.29392H19.7741Z" fill="#D18000"/>
      <path d="M13.875 28.1208C13.875 30.3984 15.2266 31.8259 17.4686 31.7144H28.8239C29.9187 31.7687 30.8013 31.4557 31.4173 30.8574L28.4013 33.8735C27.7863 34.45 26.9155 34.7511 25.8414 34.6978H14.4861C12.3596 34.8025 11.0338 33.525 10.9025 31.4488C10.8956 31.3363 10.8916 31.2217 10.8916 31.1033V27.0872H13.875V28.1198V28.1208Z" fill="#FFFAF0"/>
      <path d="M27.6489 13.585C28.4427 13.585 28.731 13.9581 28.731 14.666V19.7572C28.731 20.4651 28.4417 20.8402 27.6489 20.8402H20.1074C19.3137 20.8402 19.0254 20.4651 19.0254 19.7572V14.666C19.0254 13.9581 19.3147 13.585 20.1074 13.585H27.6489Z" fill="#FFFAF0"/>
      <path d="M15.1074 10.2587C15.3147 9.91316 15.6929 9.68115 16.1253 9.68115C16.7808 9.68115 17.3119 10.2123 17.3119 10.8678C17.3119 11.5233 16.7808 12.0525 16.1253 12.0525C15.6929 12.0525 15.3147 11.8225 15.1074 11.475H15.5181C15.8548 11.475 16.1253 11.2015 16.1253 10.8678C16.1253 10.5341 15.8538 10.2597 15.5181 10.2597H15.1074V10.2587Z" fill="#002140"/>
      <path d="M15.1074 18.0321C15.3147 17.6856 15.6929 17.4546 16.1253 17.4546C16.7808 17.4546 17.3119 17.9857 17.3119 18.6413C17.3119 19.2968 16.7808 19.8259 16.1253 19.8259C15.6988 19.8259 15.3266 19.6028 15.1183 19.2652H15.5181C15.8548 19.2652 16.1253 18.9917 16.1253 18.6571C16.1253 18.3224 15.8538 18.0499 15.5181 18.0499H15.1074V18.0321Z" fill="#002140"/>
      <path d="M15.1074 25.872C15.3147 25.5254 15.6929 25.2944 16.1253 25.2944C16.7808 25.2944 17.3119 25.8256 17.3119 26.4801C17.3119 27.1347 16.7808 27.6658 16.1253 27.6658C15.6929 27.6658 15.3147 27.4348 15.1074 27.0883H15.5181C15.8548 27.0883 16.1253 26.8148 16.1253 26.4801C16.1253 26.1454 15.8538 25.873 15.5181 25.873H15.1074V25.872Z" fill="#002140"/>
      <path d="M16.0154 10.2598C16.352 10.2598 16.6225 10.5323 16.6225 10.8679C16.6225 11.2036 16.351 11.4751 16.0154 11.4751H10.8916C9.37025 11.4751 8.67721 12.2905 8.67721 13.0487C8.67721 13.807 9.36927 14.6224 10.8916 14.6224V15.8377C8.63969 15.8377 7.46191 14.4339 7.46191 13.0478C7.46191 11.6617 8.63969 10.2578 10.8916 10.2578H16.0154V10.2598Z" fill="#002140"/>
      <path d="M16.0154 18.0501C16.352 18.0501 16.6225 18.3225 16.6225 18.6572C16.6225 18.9919 16.351 19.2654 16.0154 19.2654H10.8916C9.37025 19.2654 8.67721 20.0808 8.67721 20.838C8.67721 21.5953 9.36927 22.4127 10.8916 22.4127V23.627C8.63969 23.627 7.46191 22.2241 7.46191 20.8371C7.46191 19.45 8.63969 18.0481 10.8916 18.0481H16.0154V18.0501Z" fill="#002140"/>
      <path d="M14.7217 6.31568C14.1718 6.93863 13.8747 7.81926 13.8747 8.88745V10.2597H11.1982V10.1788C11.3118 9.90036 11.4569 9.65059 11.6297 9.42649L11.6938 9.34948L14.7197 6.3147H14.7217V6.31568Z" fill="#FFFAF0"/>
      <path d="M13.875 19.2654V25.873H10.8916V23.628V22.4137V19.2654H13.875Z" fill="#FFFAF0"/>
      <path d="M13.875 11.4761V18.0501H10.8916V11.871C10.8916 11.7683 10.8956 11.6666 10.9005 11.5679V11.4751H13.875V11.4761Z" fill="#FFFAF0"/>
      <path d="M16.0154 25.8728C16.352 25.8728 16.6225 26.1453 16.6225 26.48C16.6225 26.8146 16.351 27.0881 16.0154 27.0881H10.8916C9.37025 27.0881 8.67721 27.9036 8.67721 28.6608C8.67721 29.418 9.36927 30.2354 10.8916 30.2354V31.1042C10.8916 31.2217 10.8955 31.3362 10.9025 31.4497L10.8916 31.4517C8.63969 31.4517 7.46191 30.0479 7.46191 28.6608C7.46191 27.2737 8.63969 25.8718 10.8916 25.8718H16.0154V25.8728Z" fill="#002140"/>
      <path d="M32.4189 8.88745V28.1209" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32.4188 8.8875C32.4188 6.60993 31.0672 5.18238 28.8242 5.29394" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 27.0884V28.121" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 19.2654V25.873" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 11.4761V18.0501" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 8.88745V10.2597" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 8.88746C13.875 7.81926 14.1722 6.93864 14.7221 6.31569C15.0222 5.97213 15.3963 5.70853 15.8396 5.53379C16.1851 5.39755 16.5692 5.3166 16.9927 5.29488C17.1457 5.28599 17.3057 5.28599 17.4686 5.29389" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.4688 5.29395H19.7315" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25.4404 5.29395H28.8237" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31.4177 30.8584C30.8017 31.4567 29.9191 31.7696 28.8242 31.7153" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32.4198 28.1211C32.4198 29.2732 32.0733 30.2081 31.4404 30.836" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.875 28.1211C13.875 30.3987 15.2265 31.8262 17.4686 31.7147" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.4688 31.7153H28.824" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 11.8708V14.6233V15.8386V18.05" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 19.2654V22.4137V23.628V25.873" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 27.0884V30.2367V31.1055" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.1982 10.1788C11.3118 9.90039 11.4569 9.65062 11.6297 9.42651" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 11.8707C10.8916 11.768 10.8956 11.6664 10.9005 11.5676" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.4017 33.8735C27.7867 34.4511 26.9159 34.7522 25.8418 34.6989" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 31.1055C10.8916 31.223 10.8956 31.3375 10.9025 31.451C11.0338 33.5262 12.3596 34.8047 14.4861 34.7" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14.4863 34.6987H25.8416" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.6943 9.34948L14.7202 6.3147" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.4023 33.8747L31.4184 30.8586L31.4401 30.8359" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.0254 14.666C19.0254 13.9581 19.3147 13.585 20.1074 13.585" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.7324 14.6657C28.7324 13.9579 28.4431 13.5847 27.6504 13.5847" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.0254 14.6658V19.757" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.1084 13.585H27.6499" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.0254 19.7568C19.0254 20.4647 19.3147 20.8398 20.1074 20.8398" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.7324 19.7568C28.7324 20.4647 28.4431 20.8398 27.6504 20.8398" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.1084 20.8408H27.6499" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.7324 14.6658V19.757" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 10.2598H15.1989C15.5356 10.2598 15.8061 10.5322 15.8061 10.8679C15.8061 11.2036 15.5346 11.4751 15.1989 11.4751H10.8916" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8911 11.4761C9.3698 11.4761 8.67676 12.2915 8.67676 13.0497C8.67676 13.8079 9.36881 14.6234 10.8911 14.6234" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 15.8387C8.63969 15.8387 7.46191 14.4348 7.46191 13.0487C7.46191 11.6626 8.63969 10.2588 10.8916 10.2588" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 18.05H15.1989C15.5356 18.05 15.8061 18.3225 15.8061 18.6572C15.8061 18.9919 15.5346 19.2653 15.1989 19.2653H10.8916" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8911 19.2654C9.3698 19.2654 8.67676 20.0808 8.67676 20.8381C8.67676 21.5953 9.36881 22.4127 10.8911 22.4127" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 23.628C8.63969 23.628 7.46191 22.2251 7.46191 20.838C7.46191 19.451 8.63969 18.0491 10.8916 18.0491" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 25.873H15.1989C15.5356 25.873 15.8061 26.1455 15.8061 26.4802C15.8061 26.8149 15.5346 27.0883 15.1989 27.0883H10.8916" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8911 27.0884C9.3698 27.0884 8.67676 27.9038 8.67676 28.6611C8.67676 29.4183 9.36881 30.2357 10.8911 30.2357" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8916 31.4517C8.63969 31.4517 7.46191 30.0479 7.46191 28.6608C7.46191 27.2737 8.63969 25.8718 10.8916 25.8718" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.1074 10.2587C15.3147 9.91316 15.6929 9.68115 16.1253 9.68115C16.7808 9.68115 17.3119 10.2123 17.3119 10.8678C17.3119 11.5233 16.7808 12.0525 16.1253 12.0525C15.6929 12.0525 15.3147 11.8225 15.1074 11.475" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.1074 18.0321C15.3147 17.6856 15.6929 17.4546 16.1253 17.4546C16.7808 17.4546 17.3119 17.9857 17.3119 18.6413C17.3119 19.2968 16.7808 19.8259 16.1253 19.8259C15.6988 19.8259 15.3266 19.6028 15.1183 19.2652C15.1133 19.2593 15.1104 19.2533 15.1074 19.2484" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.1074 25.872C15.3147 25.5254 15.6929 25.2944 16.1253 25.2944C16.7808 25.2944 17.3119 25.8256 17.3119 26.4801C17.3119 27.1347 16.7808 27.6658 16.1253 27.6658C15.6929 27.6658 15.3147 27.4348 15.1074 27.0883" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.7734 4.75488V5.29392V5.365V10.5678" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.5928 10.9773L21.9137 9.77686" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.5928 10.9776C20.1831 11.3113 19.7734 11.0289 19.7734 10.5679" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25.2852 4.75488V5.29392V5.365V10.5678" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24.4654 10.9773L23.1465 9.77686" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24.4648 10.9776C24.8745 11.3113 25.2843 11.0289 25.2843 10.5679" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21.9141 9.77697C22.3731 9.3416 22.6742 9.3416 23.1461 9.77697" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25.2846 4.75489C25.2846 3.45667 24.4652 2.83569 23.1709 2.83569" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.6836 5.23371C17.6836 3.26416 18.5464 2.83569 19.8417 2.83569" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.1708 2.83569H19.8418" stroke="#002140" stroke-width="0.714278" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    COMPANY_CARD: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.1919 10.9939H5.90551C4.8062 10.9939 3.91504 11.8851 3.91504 12.9844V23.8923C3.91504 24.9916 4.8062 25.8827 5.90551 25.8827H27.1919C28.2912 25.8827 29.1824 24.9916 29.1824 23.8923V12.9844C29.1824 11.8851 28.2912 10.9939 27.1919 10.9939Z" fill="#E4BC07"/>
      <path d="M26.8364 10.928H6.18523C4.87103 10.928 3.80566 11.9933 3.80566 13.3075V23.4293C3.80566 24.7435 4.87103 25.8089 6.18523 25.8089H26.8364C28.1506 25.8089 29.2159 24.7435 29.2159 23.4293V13.3075C29.2159 11.9933 28.1506 10.928 26.8364 10.928Z" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M29.0336 13.7283H3.8457V15.9543H29.0336V13.7283Z" fill="#002140" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M34.3762 14.5004L13.0901 14.6007C11.9908 14.6059 11.1038 15.5013 11.109 16.6006L11.1604 27.5083C11.1656 28.6076 12.0609 29.4946 13.1602 29.4894L34.4464 29.3891C35.5457 29.3839 36.4326 28.4886 36.4275 27.3893L36.3761 16.4815C36.3709 15.3822 35.4755 14.4952 34.3762 14.5004Z" fill="#FF7101"/>
      <path d="M34.0217 14.4332L13.3708 14.5305C12.0566 14.5367 10.9962 15.6071 11.0024 16.9213L11.0501 27.0429C11.0563 28.3571 12.1267 29.4175 13.4409 29.4113L34.0918 29.314C35.406 29.3078 36.4663 28.2374 36.4601 26.9232L36.4124 16.8015C36.4062 15.4874 35.3359 14.427 34.0217 14.4332Z" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.4482 26.9839L16.8839 26.968" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.46 26.96L21.8956 26.9441" stroke="#002140" stroke-width="0.714279" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.6053 22.7382L18.5921 19.9378C18.5921 19.7922 18.3141 19.6758 17.9753 19.6758L15.7387 19.6864C15.5481 19.6864 15.3681 19.7261 15.2517 19.7896L14.492 20.2131C14.4073 20.2607 14.3623 20.3163 14.3623 20.3746L14.3729 22.41C14.3729 22.463 14.4126 22.5159 14.4841 22.5609L15.0558 22.9103C15.1723 22.9818 15.3628 23.0215 15.564 23.0215L17.9939 23.0056C18.3327 23.0056 18.6079 22.8838 18.6053 22.7382Z" fill="#FBCCFF"/>
      <path d="M32.2056 19.3863L24.7441 19.4215C23.81 19.4259 23.0563 20.1867 23.0607 21.1208C23.0651 22.0549 23.8259 22.8086 24.76 22.8042L32.2216 22.769C33.1557 22.7646 33.9094 22.0038 33.905 21.0697C33.9006 20.1356 33.1397 19.3819 32.2056 19.3863Z" fill="#002140"/>
    </svg>
  `,
    INVOICES: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.6871 17.5645L32.6452 15.6672C32.6452 15.6672 31.9378 14.0711 31.5907 14.0215C31.2437 13.972 20.2869 10.1411 20.2869 10.1411C20.2869 10.1411 19.2744 10.3947 18.8949 10.4786C18.5155 10.5625 8.81344 13.8957 8.81344 13.8957C8.81344 13.8957 7.88481 14.3171 7.6331 15.3716C7.3814 16.4261 7.29559 17.8181 7.29559 17.8181C7.29559 17.8181 7.04198 18.0717 7.00003 18.6609C6.95808 19.252 7.04198 31.145 7.04198 31.145C7.04198 31.145 6.95808 31.862 7.84286 31.9039C8.72954 31.9459 32.8969 31.9039 32.8969 31.9039C32.8969 31.9039 33.3603 31.5245 33.3603 31.0611C33.3603 30.5978 33.5281 18.1117 33.5281 18.1117C33.5281 18.1117 33.1486 17.4787 32.6852 17.5626L32.6871 17.5645Z" fill="#FFFAF0"/>
      <path d="M13.0485 23.0656C13.0485 23.0656 14.4195 17.6597 13.693 17.6712C12.9665 17.6826 7.46337 17.776 7.46337 17.776C7.46337 17.776 7 17.9019 7 18.2814V18.6608L13.0504 23.0637L13.0485 23.0656Z" fill="#FFD7B0"/>
      <path d="M25.5251 23.84C25.7577 24.3415 33.53 18.1138 33.53 18.1138C33.53 18.1138 33.3184 17.4387 32.6872 17.5646C32.056 17.6904 28.6924 17.3014 27.7103 17.6904C26.7283 18.0794 25.2925 23.3347 25.5251 23.8381V23.84Z" fill="#FFD7B0"/>
      <path d="M10.4619 19.4808L10.7231 21.3247L14.3366 23.9752L25.812 23.8513C25.812 23.8513 28.9163 21.2618 29.2138 21.2179C29.4903 15.7358 32.3639 10.3699 32.3639 10.3699L31.9635 10.0515L29.9327 10.3928L28.7581 9.28109L26.9046 10.5167L25.1732 9.15714L23.0089 10.3928L21.7103 8.97027L19.5461 10.2688L18.6804 8.60034L16.579 10.1449L14.7866 8.66136C14.7866 8.66136 10.46 10.6388 10.46 19.4789L10.4619 19.4808Z" fill="#CCF6FF"/>
      <path d="M10.3519 18.0246C10.5491 18.0246 10.709 17.8647 10.709 17.6674C10.709 17.4702 10.5491 17.3103 10.3519 17.3103V18.0246ZM7.56407 17.6674L7.5622 18.0246H7.56407V17.6674ZM10.3519 17.3103H7.56407V18.0246H10.3519V17.3103ZM7.56594 17.3103C7.00267 17.3073 6.54715 17.7642 6.54715 18.3253H7.26144C7.26144 18.158 7.39705 18.0237 7.5622 18.0246L7.56594 17.3103ZM6.54715 18.3253V31.2995H7.26144V18.3253H6.54715ZM6.54715 31.2995C6.54715 31.8609 7.00261 32.3164 7.56407 32.3164V31.6021C7.3971 31.6021 7.26144 31.4664 7.26144 31.2995H6.54715ZM7.56407 32.3164H32.7955V31.6021H7.56407V32.3164ZM32.7955 32.3164C33.3569 32.3164 33.8124 31.8609 33.8124 31.2995H33.0981C33.0981 31.4664 32.9624 31.6021 32.7955 31.6021V32.3164ZM33.8124 31.2995V18.3253H33.0981V31.2995H33.8124ZM33.8124 18.3253C33.8124 17.7638 33.3569 17.3084 32.7955 17.3084V18.0227C32.9624 18.0227 33.0981 18.1583 33.0981 18.3253H33.8124ZM32.7955 17.3084H29.8398V18.0227H32.7955V17.3084Z" fill="#002140"/>
      <path d="M10.0125 31.7654C9.92332 31.9413 9.99368 32.1562 10.1696 32.2454C10.3456 32.3345 10.5605 32.2642 10.6496 32.0882L10.0125 31.7654ZM10.6496 32.0882L14.614 24.2645L13.9768 23.9416L10.0125 31.7654L10.6496 32.0882Z" fill="#002140"/>
      <path d="M25.9223 23.8565C25.8378 23.6783 25.6249 23.6023 25.4466 23.6868C25.2684 23.7713 25.1924 23.9843 25.2769 24.1625L25.9223 23.8565ZM25.2769 24.1625L29.0219 32.0626L29.6674 31.7566L25.9223 23.8565L25.2769 24.1625Z" fill="#002140"/>
      <path d="M31.1307 13.5565C30.9445 13.4913 30.7408 13.5894 30.6756 13.7756C30.6104 13.9617 30.7085 14.1655 30.8947 14.2306L31.1307 13.5565ZM31.2415 13.9736L31.3607 13.637L31.3595 13.6365L31.2415 13.9736ZM32.645 15.911L32.2878 15.9141L32.2878 15.9144L32.645 15.911ZM30.8947 14.2306L31.1235 14.3107L31.3595 13.6365L31.1307 13.5565L30.8947 14.2306ZM31.1224 14.3103C31.8201 14.5572 32.2816 15.1991 32.2878 15.9141L33.0021 15.9079C32.9931 14.8839 32.3333 13.9812 31.3607 13.637L31.1224 14.3103ZM32.2878 15.9144L32.3031 17.5257L33.0173 17.5189L33.0021 15.9076L32.2878 15.9144Z" fill="#002140"/>
      <path d="M7.10575 17.4805C7.10575 17.6777 7.26565 17.8376 7.46289 17.8376C7.66014 17.8376 7.82003 17.6777 7.82003 17.4805H7.10575ZM8.87777 13.846L8.99457 14.1835L8.99499 14.1834L8.87777 13.846ZM7.82003 17.4805V15.8062H7.10575V17.4805H7.82003ZM7.82003 15.8062C7.82003 15.0811 8.28643 14.4286 8.99457 14.1835L8.76097 13.5085C7.77202 13.8507 7.10575 14.7694 7.10575 15.8062H7.82003ZM8.99499 14.1834L11.6512 13.2605L11.4168 12.5857L8.76055 13.5086L8.99499 14.1834Z" fill="#002140"/>
      <path d="M7.2062 18.4972C7.04515 18.3833 6.82228 18.4216 6.7084 18.5826C6.59452 18.7437 6.63275 18.9665 6.7938 19.0804L7.2062 18.4972ZM14.3375 23.9773L14.1313 24.2689C14.1916 24.3116 14.2637 24.3345 14.3375 24.3345V23.9773ZM25.6432 23.9773V24.3345C25.7184 24.3345 25.7917 24.3108 25.8526 24.2667L25.6432 23.9773ZM6.7938 19.0804L14.1313 24.2689L14.5437 23.6857L7.2062 18.4972L6.7938 19.0804ZM14.3375 24.3345H25.6432V23.6202H14.3375V24.3345ZM25.8526 24.2667L33.6649 18.6148L33.2462 18.0361L25.4339 23.688L25.8526 24.2667Z" fill="#002140"/>
      <path d="M10.2095 21.3884C10.2574 21.5798 10.4513 21.6961 10.6426 21.6483C10.834 21.6004 10.9503 21.4065 10.9025 21.2152L10.2095 21.3884ZM14.8216 8.41724L15.1038 8.19833C15.0401 8.11621 14.9438 8.06591 14.84 8.06057C14.7362 8.05522 14.6352 8.09536 14.5634 8.17051L14.8216 8.41724ZM16.2594 10.2707L15.9772 10.4896C16.0352 10.5644 16.1207 10.6132 16.2146 10.625C16.3086 10.6369 16.4035 10.6109 16.4783 10.5529L16.2594 10.2707ZM18.5304 8.50876L18.8395 8.32981C18.7878 8.24059 18.7001 8.17804 18.599 8.15826C18.4978 8.13848 18.393 8.16339 18.3115 8.22659L18.5304 8.50876ZM19.5506 10.2707L19.2415 10.4496C19.2916 10.5361 19.3755 10.5976 19.473 10.6193C19.5705 10.641 19.6726 10.6209 19.7546 10.5638L19.5506 10.2707ZM21.6824 8.78716L21.9441 8.5441C21.823 8.41375 21.6245 8.3924 21.4784 8.49402L21.6824 8.78716ZM23.1526 10.3698L22.891 10.6129C23.0131 10.7444 23.2139 10.7648 23.36 10.6606L23.1526 10.3698ZM25.2063 8.90539L25.4606 8.65467C25.3375 8.52972 25.1418 8.51274 24.9989 8.61461L25.2063 8.90539ZM26.7928 10.5148L26.5385 10.7655C26.656 10.8847 26.8405 10.9063 26.9824 10.8174L26.7928 10.5148ZM28.9628 9.15519L29.2195 8.90694C29.1023 8.78565 28.9161 8.76297 28.7732 8.85254L28.9628 9.15519ZM30.3529 10.5929L30.0961 10.8412C30.1959 10.9444 30.3479 10.9779 30.4818 10.926L30.3529 10.5929ZM32.6239 9.89695L32.9353 10.0719C33.0026 9.95205 32.9952 9.8042 32.9162 9.69171C32.8372 9.57921 32.7007 9.52204 32.5651 9.54469L32.6239 9.89695ZM10.556 21.3018C10.9025 21.2152 10.9025 21.2153 10.9026 21.2155C10.9026 21.2155 10.9026 21.2156 10.9026 21.2156C10.9026 21.2156 10.9026 21.2156 10.9025 21.2154C10.9025 21.2151 10.9023 21.2143 10.902 21.2132C10.9015 21.2109 10.9005 21.2071 10.8993 21.2017C10.8968 21.1909 10.8929 21.1738 10.888 21.1507C10.8781 21.1045 10.8639 21.0341 10.8477 20.9414C10.8153 20.7559 10.7747 20.481 10.7438 20.1306C10.682 19.4295 10.6592 18.4278 10.8176 17.2355C11.1338 14.8542 12.1726 11.7066 15.0798 8.66396L14.5634 8.17051C11.5365 11.3384 10.4426 14.6332 10.1095 17.1415C9.94317 18.3939 9.96665 19.4489 10.0323 20.1933C10.0651 20.5656 10.1085 20.8607 10.1441 21.0644C10.1619 21.1663 10.1778 21.2454 10.1895 21.3C10.1953 21.3273 10.2001 21.3484 10.2035 21.3632C10.2052 21.3706 10.2066 21.3765 10.2076 21.3807C10.2081 21.3828 10.2085 21.3845 10.2089 21.3858C10.209 21.3864 10.2092 21.387 10.2093 21.3874C10.2093 21.3876 10.2094 21.3879 10.2094 21.388C10.2095 21.3882 10.2095 21.3884 10.556 21.3018ZM14.5394 8.63614L15.9772 10.4896L16.5416 10.0518L15.1038 8.19833L14.5394 8.63614ZM16.4783 10.5529L18.7493 8.79094L18.3115 8.22659L16.0405 9.98851L16.4783 10.5529ZM18.2214 8.68772L19.2415 10.4496L19.8597 10.0917L18.8395 8.32981L18.2214 8.68772ZM19.7546 10.5638L21.8864 9.08031L21.4784 8.49402L19.3466 9.97754L19.7546 10.5638ZM21.4208 9.03023L22.891 10.6129L23.4143 10.1268L21.9441 8.5441L21.4208 9.03023ZM23.36 10.6606L25.4137 9.19617L24.9989 8.61461L22.9453 10.0791L23.36 10.6606ZM24.952 9.15611L26.5385 10.7655L27.0471 10.264L25.4606 8.65467L24.952 9.15611ZM26.9824 10.8174L29.1524 9.45783L28.7732 8.85254L26.6032 10.2121L26.9824 10.8174ZM28.706 9.40343L30.0961 10.8412L30.6096 10.3447L29.2195 8.90694L28.706 9.40343ZM30.3529 10.5929C30.4818 10.926 30.4818 10.926 30.4818 10.926C30.4818 10.926 30.4818 10.926 30.4818 10.926C30.4819 10.926 30.4819 10.926 30.482 10.9259C30.4821 10.9259 30.4823 10.9258 30.4826 10.9257C30.4832 10.9255 30.4841 10.9251 30.4854 10.9246C30.488 10.9236 30.4918 10.9221 30.497 10.9202C30.5073 10.9162 30.5227 10.9103 30.5427 10.9028C30.5827 10.8876 30.6411 10.8657 30.7138 10.839C30.8595 10.7854 31.0621 10.7125 31.2902 10.6355C31.753 10.4792 32.297 10.3137 32.6828 10.2492L32.5651 9.54469C32.1176 9.61944 31.526 9.80192 31.0616 9.95879C30.8261 10.0383 30.6172 10.1134 30.4672 10.1686C30.3922 10.1962 30.3317 10.2189 30.2899 10.2347C30.2689 10.2427 30.2526 10.2489 30.2415 10.2532C30.2359 10.2553 30.2316 10.2569 30.2286 10.2581C30.2272 10.2586 30.226 10.2591 30.2252 10.2594C30.2248 10.2595 30.2245 10.2597 30.2243 10.2597C30.2242 10.2598 30.2241 10.2598 30.224 10.2599C30.224 10.2599 30.224 10.2599 30.2239 10.2599C30.2239 10.2599 30.2239 10.2599 30.3529 10.5929ZM32.3126 9.72201C30.7141 12.567 29.8519 15.4336 29.389 17.5861C29.1574 18.6631 29.0252 19.5636 28.9509 20.1962C28.9137 20.5126 28.891 20.7622 28.8775 20.9335C28.8707 21.0192 28.8663 21.0854 28.8636 21.1306C28.8622 21.1532 28.8612 21.1706 28.8606 21.1825C28.8603 21.1885 28.86 21.1931 28.8599 21.1963C28.8598 21.198 28.8597 21.1992 28.8597 21.2002C28.8597 21.2006 28.8596 21.201 28.8596 21.2013C28.8596 21.2015 28.8596 21.2016 28.8596 21.2017C28.8596 21.2018 28.8596 21.2019 29.2164 21.2179C29.5732 21.2339 29.5732 21.2339 29.5732 21.234C29.5732 21.234 29.5732 21.234 29.5732 21.2339C29.5732 21.2339 29.5732 21.2338 29.5732 21.2335C29.5732 21.2331 29.5733 21.2323 29.5733 21.2311C29.5734 21.2288 29.5736 21.2252 29.5739 21.2202C29.5744 21.2102 29.5753 21.1948 29.5765 21.1742C29.579 21.133 29.5832 21.071 29.5896 20.9895C29.6024 20.8267 29.6242 20.5863 29.6603 20.2796C29.7324 19.6661 29.8611 18.7882 30.0873 17.7362C30.5401 15.6307 31.3818 12.8368 32.9353 10.0719L32.3126 9.72201Z" fill="#002140"/>
      <path d="M27.5356 17.7725L23.0481 19.3932C23.0481 19.3932 22.4997 18.371 23.447 17.5736C23.447 17.5736 21.1033 16.7508 19.2588 17.5736C17.4137 18.3963 16.3667 19.3684 14.9708 21.9365L14.4472 17.5736C14.4472 17.5736 16.8902 13.2855 21.9266 14.4076L23.6967 14.9812C23.6967 14.9812 23.2729 13.7347 24.1205 13.1864L27.5361 17.7736L27.5356 17.7725Z" fill="#03D47C"/>
      <path d="M23.6641 14.975C23.6641 14.975 17.8646 12.1331 14.4456 17.5927L14.9545 22.0244C14.9545 22.0244 17.5118 15.5921 23.4403 17.6119" fill="#03D47C"/>
      <path d="M23.6641 14.975C23.6641 14.975 17.8646 12.1331 14.4456 17.5927L14.9545 22.0244C14.9545 22.0244 17.5118 15.5921 23.4403 17.6119" stroke="#002140" stroke-width="0.714286" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.4414 17.6119C23.4414 17.6119 22.5121 18.335 23.0481 19.4446L23.4414 17.6119Z" fill="#03D47C"/>
      <path d="M23.4414 17.6119C23.4414 17.6119 22.5121 18.335 23.0481 19.4446" stroke="#002140" stroke-width="0.714286" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24.1143 13.1615C24.1143 13.1615 23.185 13.7972 23.7209 14.9941L24.1143 13.1615Z" fill="#03D47C"/>
      <path d="M24.1143 13.1615C24.1143 13.1615 23.185 13.7972 23.7209 14.9941" stroke="#002140" stroke-width="0.714286" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.0478 19.4441L27.6475 17.7613L24.1146 13.1617" fill="#03D47C"/>
      <path d="M23.0478 19.4441L27.6475 17.7613L24.1146 13.1617" stroke="#002140" stroke-width="0.714286" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    RULES: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5.00558" y="9.68478" width="26.7609" height="9.09829" rx="1.78571" fill="#FFFAF0" stroke="#002140" stroke-width="0.714286"/>
      <rect x="15.1162" y="11.9443" width="9.1584" height="1.24497" fill="#002140"/>
      <rect x="15.1162" y="15.2151" width="13.7376" height="1.24497" fill="#002140"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6199 11.4843C12.9517 11.7293 13.0221 12.197 12.777 12.5289L9.52647 16.9307L7.19053 14.7974C6.8859 14.5192 6.86447 14.0468 7.14267 13.7421C7.42086 13.4375 7.89334 13.4161 8.19797 13.6943L9.30961 14.7094L11.5752 11.6414C11.8203 11.3096 12.288 11.2392 12.6199 11.4843Z" fill="#03D47C"/>
      <rect x="8.82199" y="21.133" width="26.7609" height="9.09829" rx="1.78571" fill="#FFFAF0" stroke="#002140" stroke-width="0.714286"/>
      <rect x="18.9316" y="23.3926" width="9.1584" height="1.24497" fill="#002140"/>
      <rect x="18.9316" y="26.6633" width="13.7376" height="1.24497" fill="#002140"/>
      <path d="M15.3069 27.9864C15.5596 28.2391 15.9693 28.2391 16.222 27.9864C16.4747 27.7337 16.4747 27.324 16.222 27.0713L14.7387 25.588L16.222 24.1048C16.4747 23.8521 16.4747 23.4424 16.222 23.1897C15.9693 22.937 15.5596 22.937 15.3069 23.1897L13.8236 24.673L12.34 23.1893C12.0873 22.9366 11.6776 22.9366 11.4249 23.1893C11.1722 23.442 11.1722 23.8517 11.4249 24.1044L12.9086 25.588L11.4249 27.0717C11.1722 27.3244 11.1722 27.7341 11.4249 27.9868C11.6776 28.2395 12.0873 28.2395 12.34 27.9868L13.8236 26.5031L15.3069 27.9864Z" fill="#F25730"/>
    </svg>
  `,
    DISTANCE_RATES: `
   <svg
      xmlns="http://www.w3.org/2000/svg"
      id="${CAMPAIGN_ID}-simple-illustration__car_svg__Layer_1"
      x="0"
      y="0"
      viewBox="0 0 68 68"
      xml:space="preserve"
      width="48"
      height="48"
      hovered="false"
      pressed="false"
    >
      <style>
        .${CAMPAIGN_ID}-simple-illustration__car_svg__st1 { fill: #4ba6a6 }
        .${CAMPAIGN_ID}-simple-illustration__car_svg__st2 { fill: #28736d }
        .${CAMPAIGN_ID}-simple-illustration__car_svg__st3 { fill: #ffed8f }
        .${CAMPAIGN_ID}-simple-illustration__car_svg__st4 {
          fill: none;
          stroke: #002140;
          stroke-width: 0.8571;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      </style>

      <path
        d="M49.708 27.953s-3.324-9.358-5.152-9.753c-1.828-.395-11.801-2.123-20.018-.156 0 0-3.065 2.99-4.107 5.504-1.042 2.517-1.564 4.484-1.564 4.484s-3.52 2.123-4.565 5.504c-1.042 3.381-.391 11.247-.391 11.247s.846.786 2.414 1.259c1.568.473 6.066 1.102 8.15 1.102s23.151-.157 23.151-.157l6.389-1.572s.914-1.337.978-2.279c.064-.942-.26-8.494-.26-8.494s-.846-2.752-1.5-3.46c-.654-.708-3.52-3.225-3.52-3.225l-.005-.004z"
        style="fill: rgb(78, 215, 222);"
      />

      <path
        d="m18.931 27.563-1.109-2.752-2.478.708-.391 1.415 1.305.786 2.673-.157zM50.035 27.717l4.107-.473v-1.021l-.782-1.102-2.542-.235-.783 2.831z"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st1"
      />

      <path
        d="m23.496 46.751 21.974.078-2.087-1.888H24.865l-1.369 1.81zM15.475 46.045l.914 3.616 1.301.868 4.37-.316.914-1.259.523-2.201-8.022-.708zM45.601 47.304l.519 2.436 1.177.868 4.889-.078 1.042-1.415.327-3.147-8.086.864"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st2"
      />

      <path
        d="m20.754 34.404-2.997-2.044-1.045.942-.26 2.283.978 1.02 3.129 1.259 1.305-1.099-1.11-2.361zM51.6 32.514l-.914-.469-2.87 2.279-.846 2.044.523.864 1.693-.156 3.001-1.65-.587-2.912zM22.319 27.324l.914.629h22.76l.391-1.024-3.001-6.294s-5.479-1.181-9.977-1.024c-4.498.156-8.477 1.102-8.477 1.102l-2.61 6.606v.005z"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st3"
      />

      <path
        d="M44.265 18.161c-4.27-1.376-13.728-1.849-20.05 0"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st4"
      />

      <path
        d="M24.21 18.16s-2.837 1.653-5.085 9.675c0 0-5.38 2.83-5.38 8.612 0 0-.391 3.893 19.759 3.893s21.423-3.776 21.423-3.776c0-5.782-5.38-8.612-5.38-8.612-2.251-8.021-5.085-9.675-5.085-9.675"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st4"
      />

      <path
        d="M13.747 36.447v6.923c0 1.241.757 2.29 1.774 2.468l6.23 1.074c.572.1 1.152-.096 1.6-.537l.878-.868c.37-.363.832-.562 1.309-.562h9.241"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st4"
      />

      <path
        d="M54.906 36.434v6.923c0 1.241-.757 2.29-1.774 2.468l-6.229 1.074c-.573.099-1.152-.096-1.6-.537l-.878-.868c-.37-.363-.832-.562-1.308-.562h-9.241M22.433 46.891l23.787-.014M15.521 45.838l.412 2.667c.178 1.148 1.01 1.984 1.981 1.984h3.264c.946 0 1.764-.793 1.966-1.906l.288-1.575M53.505 46.016l-.412 2.667c-.178 1.148-1.01 1.984-1.981 1.984h-3.264c-.946 0-1.764-.793-1.966-1.906l-.288-1.575M18.88 27.836l-.544-2.35c-.103-.441-.462-.722-.839-.651l-1.888.356c-.245.046-.455.235-.562.508l-.242.622c-.228.579.107 1.252.636 1.287l3.438.231M49.946 27.719l.544-2.35c.103-.441.462-.722.839-.651l1.888.356c.245.046.455.235.562.508l.242.622c.228.58-.107 1.252-.636 1.287l-3.438.231M16.833 33.047l-.501 1.728c-.185.633.092 1.323.615 1.547l2.869 1.223c.128.053.263.085.398.085l.533.011c.853.018 1.337-1.173.8-1.973l-.764-1.145a1.093 1.093 0 0 0-.217-.242l-2.219-1.835c-.548-.452-1.298-.156-1.518.597l.004.004zM51.678 32.811l.501 1.728c.185.633-.092 1.323-.615 1.547l-2.869 1.223a1.046 1.046 0 0 1-.398.085l-.533.011c-.853.018-1.337-1.173-.8-1.973l.764-1.145c.06-.093.135-.174.217-.242l2.219-1.835c.548-.452 1.298-.157 1.518.597l-.004.004zM45.53 28.111H23.197c-.576 0-.956-.672-.715-1.259l2.4-5.856a.804.804 0 0 1 .533-.491c1.589-.42 8.118-1.852 17.668.028a.81.81 0 0 1 .569.48l2.581 5.817c.263.59-.117 1.284-.704 1.284v-.003z"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st4"
      />

      <path
        d="M25.843 35.819c-.686 0-3.065-.395-3.324-3.069-.26-2.674-.103-5.643-.103-5.643M42.71 35.778c.722 0 3.221-.395 3.499-3.069.277-2.674.107-5.643.107-5.643M42.711 35.779s-16.185.039-16.868.039"
        class="${CAMPAIGN_ID}-simple-illustration__car_svg__st4"
      />
    </svg>
  `,
    EXPENSIFY_CARDS: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="${CAMPAIGN_ID}-simple-illustration__handcard_svg__Layer_1"
      x="0"
      y="0"
      viewBox="0 0 68 68"
      xml:space="preserve"
      width="48"
      height="48"
      hovered="false"
      pressed="false"
    >
      <style>
        .${CAMPAIGN_ID}-simple-illustration__handcard_svg__st1 {
          fill: #e3a171;
        }
        .${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2 {
          fill: none;
          stroke: #002140;
          stroke-width: 0.999;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .${CAMPAIGN_ID}-simple-illustration__handcard_svg__st3 {
          fill: #085239;
        }
      </style>

      <path
        d="M56.1 41 32.3 24.8c-1.1-.8-2.7-.5-3.5.7l-8.4 12.3c-.8 1.1-.5 2.7.7 3.5l23.8 16.2c1.1.8 2.7.5 3.5-.7l8.4-12.3c.7-1.2.4-2.8-.7-3.5z"
        style="fill: rgb(0, 140, 89);"
      />

      <path
        d="M27.3 27.6s.9.1 1.9.1c1-.1 2.4-.5 2.4-.5s.5 5.7 1.2 6.3c.7.7 3 2.4 5.2 1.2s3.1-1.4 2.7-2.9c-.4-1.5-3.5-7.3-3.5-7.3s-.1-3.2-.1-3.9.7-5.2-3.2-6c-3.9-.8-6.8-.7-9.3-1.6-2.4-.7-4.6-3-4.6-3s-9.6 3.9-9.8 12.1c0 0 3.7 3.5 5.1 6.1 1.4 2.5 3.2 8.7 5.5 8.8l6.5-9.4zM38.1 53 22.3 42.4s-4.6 3.9-2.6 6c2.1 2.1 5.5-.2 5.5-.2s-1.4 2.9 0 4.1c1.4 1.2 5.1-.4 5.1-.4s-1.5 3 .7 4.1c2.3 1.1 5.9-1.6 7.1-3z"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st1"
      />

      <path
        d="M40.3 30.4 56 41c1.2.8 1.5 2.4.7 3.5l-8.3 12.3c-.8 1.2-2.4 1.5-3.5.7l-24-16.3c-1.2-.8-1.5-2.4-.7-3.5l7.1-10.4"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2"
      />

      <path
        d="m31.6 35.6-.3-.2c-.3-.2-.6-.1-.8.2l-.6.9c-.2.3-.1.6.2.8l.3.2c.3.2.6.1.8-.2l.6-.9c.2-.3.1-.6-.2-.8zM32.9 33.7l-.3-.2c-.3-.2-.6-.1-.8.2l-.4.6c-.2.3-.1.6.2.8l.3.2c.3.2.6.1.8-.2l.4-.6c.1-.2.1-.6-.2-.8zM33.1 37l-.3-.2c-.3-.2-.6-.1-.8.2l-.4.6c-.2.3-.1.6.2.8l.3.2c.3.2.6.1.8-.2l.4-.6c.1-.3 0-.6-.2-.8zM34.5 34.8l-.3-.2c-.3-.2-.6-.1-.8.2l-.6.9c-.2.3-.1.6.2.8l.3.2c.3.2.6.1.8-.2l.6-.9c.1-.2 0-.6-.2-.8z"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st3"
      />

      <path
        d="m52.7 41.8-8.3-5.6c-1-.7-2.4-.4-3.1.6s-.4 2.4.6 3.1l8.3 5.6c1 .7 2.4.4 3.1-.6.7-1 .4-2.4-.6-3.1z"
        style="fill: rgb(3, 212, 124);"
      />

      <path
        d="M19.9 10s-9.3 3.7-9.9 12c6 4.8 6.9 12.1 10.5 15.2M22.4 42.3c-2.8 2-4.3 5.5-1.8 6.7 1.8.9 4-.4 5.4-1.5"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2"
      />

      <path
        d="M27.6 45.9c-3 2.5-4.4 5.5-1.9 6.7 1.6.8 3.5-.1 4.8-1.1"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2"
      />

      <path
        d="M32.6 49.3c-3.1 2.8-4.2 5.6-1.8 6.8 1.8.9 4.2.2 7.2-3.2M23.7 39l4.9 3.4M30.9 43.9l4.9 3.4"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2"
      />

      <path
        d="m29.2 36.2 2.7-4c.1-.2.1-.5-.1-.6l-1.4-.9c-.1-.1-.3-.1-.4-.1l-.9.3c-.1 0-.2.1-.2.2l-2 2.9c-.1.1-.1.2-.1.3v.7c0 .1.1.3.2.4l1.5 1c.2 0 .5 0 .7-.2z"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st3"
      />

      <path
        d="M25.2 26.2s3.9 2.9 6.6.6c-.6 5.4 2.1 10 6.9 7.7 4.8-2.3-1.1-7.9-1.5-10.8s1.2-5.4-1.4-7.9c-2.7-2.5-11.5-.7-15.8-5.8"
        class="${CAMPAIGN_ID}-simple-illustration__handcard_svg__st2"
      />
    </svg>
`,
    TAGS: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.905 11.9963L11.6015 10.2412L6.59668 15.961L9.26069 22.2645L24.5983 35.7177L33.5031 25.904L17.905 11.9963ZM12.6397 17.8708C11.67 17.8708 10.8846 17.0853 10.8846 16.1157C10.8846 15.1461 11.67 14.3606 12.6397 14.3606C13.6093 14.3606 14.3948 15.1461 14.3948 16.1157C14.3948 17.0853 13.6093 17.8708 12.6397 17.8708Z" fill="#FFD7B0"/>
      <path d="M30.1883 26.231L28.2374 24.5405L22.5195 30.9753L24.4039 32.5345L30.1883 26.231Z" fill="#E4BC07"/>
      <path d="M8.95717 12.3428C8.95717 12.3428 7.78774 12.6033 7.6565 13.1655C7.52526 13.7277 8.5889 15.2418 9.77987 15.8961C10.9708 16.5484 12.2931 16.9793 12.8121 16.3721C13.3312 15.7648 12.6378 14.3604 12.6378 14.3604C12.6378 14.3604 11.6427 15.7217 10.299 14.6816C8.9552 13.6415 8.9552 13.1224 9.25882 12.8188C9.56244 12.5151 8.95521 12.3428 8.95521 12.3428H8.95717Z" fill="#FFED8F"/>
      <path d="M9.38978 12.6465L10.8197 11.1186C10.8197 11.1186 10.3006 6.21179 14.5572 6.14715C17.4484 6.08251 21.2524 8.84445 24.4688 8.81115C27.6852 8.77785 28.1084 8.22546 28.1084 8.22546C28.1084 8.22546 28.4649 6.9914 27.7518 6.9914C27.0388 6.9914 26.3865 7.51049 24.794 7.28327C23.2015 7.05604 16.8647 4.81319 15.2075 4.78185C13.5503 4.75051 8.99998 4.97773 9.38978 12.6465Z" fill="#FFED8F"/>
      <path d="M9.11512 13.056L11.7556 10.1021L17.8632 12.0472L33.3674 25.9117L24.5859 35.7294L9.08378 21.8648L6.4707 16.0118L7.91436 14.3997" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.3429 14.9774C11.9658 14.2821 13.0333 14.2213 13.7307 14.8442C14.4261 15.4672 14.4868 16.5347 13.8639 17.2321C13.241 17.9274 12.1734 17.9882 11.4761 17.3653C11.2234 17.14 11.0549 16.854 10.9707 16.5484" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.2561 24.3112L22.4463 30.8069L24.3838 32.5398L30.1936 26.0441L28.2561 24.3112Z" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.8809 25.1832L19.2167 21.4536" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.4326 26.5699L20.7685 22.8403" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.6255 14.4701C13.0662 15.0812 13.2112 15.6885 12.9507 16.1018C12.4982 16.8207 10.9899 16.6855 9.58539 15.8001C8.17895 14.9147 7.40521 13.6141 7.85966 12.8952C8.13585 12.4544 8.80773 12.335 9.61085 12.5113" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.3048 14.7777C12.0169 15.2341 11.0805 15.1597 10.2128 14.6132C9.34501 14.0667 8.87489 13.2538 9.16088 12.7974" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.32467 12.5172C9.32467 12.5172 8.15525 6.2137 13.1601 4.91305C18.1649 3.61239 22.9738 8.94235 27.7827 6.86208" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8078 11.1618C10.559 9.75341 11.0037 6.60949 14.3356 6.18247C17.6657 5.75545 23.1034 10.2725 28.1415 8.29016" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28.1417 8.292C28.1417 8.292 28.7587 7.34981 27.7852 6.86206" stroke="#002140" stroke-width="0.713573" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    PER_DIEM: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8683 10.3741C14.4013 10.3741 14.8875 10.5754 15.2549 10.9051L15.3072 10.9703C14.9082 11.2913 14.4057 11.4893 13.8585 11.5078C13.8269 11.51 13.7985 11.51 13.7669 11.51V11.5165C13.1673 11.5731 12.9635 12.0061 12.9635 12.4467C12.9635 12.9548 13.2807 13.3813 13.8541 13.403C14.5932 13.3878 15.2876 13.1854 15.8915 12.846L15.898 12.858C15.7051 13.8012 14.869 14.5095 13.8672 14.5095C12.7226 14.5095 11.7949 13.5836 11.7949 12.4413C11.7949 11.2989 12.7226 10.373 13.8672 10.373L13.8683 10.3741Z" fill="#E4BC07"/>
      <path d="M27.9804 12.847L27.9869 12.8589C27.794 13.8022 26.9579 14.5105 25.9561 14.5105C24.8115 14.5105 23.8838 13.5846 23.8838 12.4423C23.8838 11.2999 24.8115 10.374 25.9561 10.374C26.4891 10.374 26.9753 10.5753 27.3427 10.905L27.395 10.9702C26.996 11.2912 26.4935 11.4892 25.9462 11.5077C25.9146 11.5099 25.8863 11.5099 25.8547 11.5099V11.5164C25.2551 11.573 25.0513 12.006 25.0513 12.4466C25.0513 12.9547 25.3685 13.3812 25.9419 13.4029C26.681 13.3877 27.3754 13.1853 27.9793 12.8459L27.9804 12.847Z" fill="#E4BC07"/>
      <path d="M28.323 9.0468C28.323 8.98805 28.3208 8.9293 28.3165 8.87055C28.2271 7.59219 27.1599 6.58147 25.8539 6.58147C24.548 6.58147 23.5746 7.50515 23.4089 8.70518V8.87381H21.499V8.71497C21.6734 6.47267 23.5517 4.70581 25.8441 4.70581C28.1366 4.70581 30.1097 6.55971 30.1991 8.88143C30.2012 8.938 30.2023 8.99567 30.2023 9.05333C30.2023 10.6798 29.3063 12.1007 27.9796 12.8449C27.3757 13.1843 26.6813 13.3856 25.9422 13.4019C25.3689 13.3791 25.0516 12.9537 25.0516 12.4456C25.0516 12.0039 25.2555 11.572 25.855 11.5154V11.5089C25.8867 11.5089 25.915 11.5089 25.9466 11.5067C26.4938 11.4882 26.9964 11.2891 27.3953 10.9692C27.9622 10.5199 28.3241 9.8247 28.3241 9.04571L28.323 9.0468Z" fill="#002140"/>
      <path d="M11.3384 8.59301V8.8737H9.40234C9.40452 8.82039 9.40779 8.76817 9.41106 8.71486C9.58548 6.47365 11.4648 4.70679 13.7562 4.70679C16.0476 4.70679 18.0163 6.55742 18.1111 8.87588C18.1133 8.93463 18.1144 8.99447 18.1144 9.0554C18.1144 10.6819 17.2183 12.1028 15.8917 12.847C15.2878 13.1864 14.5934 13.3877 13.8543 13.404C13.2809 13.3812 12.9637 12.9558 12.9637 12.4477C12.9637 12.006 13.1675 11.574 13.7671 11.5175V11.5109C13.7987 11.5109 13.827 11.5109 13.8586 11.5088C14.4059 11.4903 14.9084 11.2912 15.3074 10.9713C15.8742 10.522 16.2361 9.82676 16.2361 9.04778C16.2361 8.98903 16.234 8.93245 16.2296 8.87588C16.1413 7.59534 15.073 6.58353 13.7671 6.58353C12.5603 6.58353 11.552 7.45064 11.3394 8.59518L11.3384 8.59301Z" fill="#002140"/>
      <path d="M31.8379 15.4419H32.081V31.1358C32.081 32.2738 31.149 33.2041 30.0087 33.2041H9.77442C8.63418 33.2041 7.70215 32.2738 7.70215 31.1358V15.4419H31.8379Z" fill="#FFFAF0"/>
      <path d="M30.2141 8.88257C31.2584 8.9881 32.0803 9.87371 32.0803 10.9421V15.4419H25.9551V14.5095C26.9569 14.5095 27.7919 13.8013 27.9859 12.858L27.9794 12.846C29.306 12.1019 30.2021 10.681 30.2021 9.05447C30.2021 8.99572 30.1999 8.93914 30.1988 8.88257H30.2141Z" fill="#FED607"/>
      <path d="M28.3238 9.04686C28.3238 9.82584 27.9608 10.52 27.395 10.9704L27.3427 10.9051C26.9753 10.5755 26.4892 10.3742 25.9561 10.3742C24.8115 10.3742 23.8838 11.3 23.8838 12.4424C23.8838 13.5848 24.8115 14.5106 25.9561 14.5106V15.443H13.8691V14.5106C14.8709 14.5106 15.7059 13.8024 15.9 12.8591L15.8934 12.8471C17.2201 12.103 18.1161 10.6821 18.1161 9.05556C18.1161 8.99572 18.114 8.9348 18.1129 8.87605L18.187 8.87387H28.2627L28.3183 8.87061C28.3238 8.92936 28.3249 8.98811 28.3249 9.04686H28.3238Z" fill="#FED607"/>
      <path d="M13.8688 15.4418H7.70215V10.942C7.70215 9.9302 8.43905 9.08376 9.40269 8.90859C9.52369 8.88575 9.64797 8.87378 9.77442 8.87378H16.2289C16.2343 8.93035 16.2354 8.98802 16.2354 9.04568C16.2354 9.82466 15.8724 10.5188 15.3066 10.9692L15.2543 10.9039C14.887 10.5743 14.4008 10.373 13.8677 10.373C12.7231 10.373 11.7954 11.2989 11.7954 12.4412C11.7954 13.5836 12.7231 14.5095 13.8677 14.5095V15.4418H13.8688Z" fill="#FED607"/>
      <path d="M18.1855 8.87402H21.4994H23.4093H28.2613" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M9.46289 8.87402H10.5486H10.5682H16.228H16.2367" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M9.77442 33.2042C8.63418 33.2042 7.70215 32.274 7.70215 31.136V10.9423C7.70215 9.93044 8.43905 9.084 9.40269 8.90884C9.5237 8.88599 9.64797 8.87402 9.77442 8.87402" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M30.1734 8.88281C31.2417 8.98835 32.0811 9.87286 32.0811 10.9412V31.1274C32.0811 32.2643 31.1283 33.1945 29.963 33.1945H9.4082" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M7.64648 15.4421H8.95569H14.8019H26.262H31.8378" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M9.39941 9.05562C9.39941 9.00775 9.39941 8.9577 9.40268 8.90875C9.4005 8.89678 9.40268 8.8859 9.40268 8.87393C9.40486 8.82062 9.40813 8.7684 9.41141 8.71509" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M9.41113 8.71619C9.58555 6.47389 11.4649 4.70703 13.7562 4.70703C16.0476 4.70703 18.0163 6.55766 18.1112 8.87612C18.1133 8.93487 18.1144 8.99471 18.1144 9.05564C18.1144 10.6822 17.2184 12.103 15.8917 12.8472C15.2878 13.1867 14.5934 13.3879 13.8544 13.4042C13.8217 13.4064 13.7889 13.4064 13.7562 13.4064" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M11.3213 8.7055C11.3267 8.66742 11.3322 8.63152 11.3387 8.59344C11.5513 7.4489 12.5596 6.58179 13.7664 6.58179C15.0723 6.58179 16.1406 7.5936 16.2289 8.87414C16.2343 8.93071 16.2354 8.98837 16.2354 9.04603C16.2354 9.82502 15.8724 10.5191 15.3067 10.9696C14.9077 11.2905 14.4052 11.4885 13.8579 11.507C13.8263 11.5092 13.798 11.5092 13.7664 11.5092" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M14.0222 13.3998C13.9895 13.4031 13.9568 13.4052 13.9241 13.4052C13.9001 13.4052 13.8773 13.4052 13.8555 13.4031C13.2821 13.3802 12.9648 12.9548 12.9648 12.4468C12.9648 12.005 13.1687 11.5731 13.7682 11.5165C13.7977 11.5133 13.8282 11.5111 13.8598 11.51" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M21.5 8.71619C21.6744 6.47389 23.5526 4.70703 25.8451 4.70703C28.1376 4.70703 30.1106 6.56093 30.2 8.88265C30.2022 8.93923 30.2033 8.99689 30.2033 9.05455C30.2033 10.6811 29.3073 12.1019 27.9806 12.8461C27.3767 13.1856 26.6823 13.3868 25.9432 13.4032C25.9105 13.4053 25.8778 13.4053 25.8451 13.4053" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M23.4092 8.7055C23.5749 7.50547 24.6072 6.58179 25.8543 6.58179C27.1013 6.58179 28.2274 7.59142 28.3168 8.87087C28.3222 8.92962 28.3233 8.98837 28.3233 9.04712C28.3233 9.82611 27.9603 10.5202 27.3946 10.9706C26.9956 11.2916 26.4931 11.4896 25.9458 11.5081C25.9142 11.5103 25.8859 11.5103 25.8543 11.5103" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M26.1101 13.3998C26.0774 13.4031 26.0447 13.4052 26.012 13.4052C25.988 13.4052 25.9651 13.4052 25.9433 13.4031C25.37 13.3802 25.0527 12.9548 25.0527 12.4468C25.0527 12.005 25.2566 11.5731 25.8561 11.5165C25.8856 11.5133 25.9161 11.5111 25.9477 11.51" stroke="#002140" stroke-width="0.714286" stroke-miterlimit="10"/>
      <path d="M20.4235 22.0606L20.4235 22.0605L20.4193 22.0593C19.9974 21.9341 19.6926 21.8146 19.4924 21.657C19.3176 21.5194 19.2166 21.3491 19.2166 21.0597C19.2166 20.7464 19.3328 20.5326 19.504 20.3909C19.6832 20.2423 19.9518 20.15 20.281 20.15C20.5867 20.15 20.8343 20.2448 21.0304 20.4189C21.2306 20.5968 21.3999 20.8782 21.5035 21.2857L21.5108 21.3143L21.5227 21.3414C21.529 21.3557 21.5358 21.3716 21.5433 21.3889C21.5909 21.4995 21.6621 21.665 21.7562 21.8016C21.8683 21.9643 22.0693 22.1694 22.3888 22.1694C22.7621 22.1694 22.9949 21.8926 23.1163 21.6125C23.2401 21.327 23.2975 20.9461 23.2975 20.5078C23.2975 20.056 23.2258 19.5818 23.0758 19.2071C22.9391 18.8656 22.6652 18.4449 22.1805 18.4449C21.9177 18.4449 21.7016 18.5622 21.5512 18.7474C21.4501 18.7014 21.3424 18.658 21.2298 18.6196L21.2841 18.2377L21.2852 18.23L21.286 18.2222C21.2902 18.1792 21.2959 18.1354 21.3022 18.0876C21.304 18.0737 21.3058 18.0595 21.3077 18.0449C21.3147 17.9902 21.3244 17.9135 21.3244 17.8488C21.3244 17.6925 21.2915 17.4958 21.1463 17.3393C20.9963 17.1777 20.7914 17.128 20.5996 17.128C20.3673 17.128 20.1537 17.2115 19.9974 17.3992C19.8571 17.5677 19.7912 17.7871 19.7566 18.0065L19.7566 18.0064L19.7557 18.0127L19.6982 18.4245C18.0958 18.5784 16.7131 19.7298 16.7131 21.5112C16.7131 22.3806 17.0493 23.0351 17.5685 23.5177C18.0758 23.9893 18.7444 24.2852 19.4047 24.4867L19.4047 24.4867L19.4087 24.4879C19.8245 24.6094 20.1359 24.7461 20.3406 24.9203C20.5275 25.0794 20.6346 25.276 20.6346 25.5749C20.6346 25.8877 20.5155 26.1196 20.3294 26.2785C20.1376 26.4422 19.8511 26.5473 19.4967 26.5473C18.8232 26.5473 18.2261 26.0619 17.9705 25.3425C17.953 25.2933 17.9337 25.2349 17.9128 25.1718C17.8608 25.0142 17.7989 24.8272 17.7317 24.681C17.6821 24.5731 17.6145 24.4507 17.5184 24.3513C17.4167 24.246 17.2667 24.1517 17.0702 24.1517C16.7053 24.1517 16.4627 24.4374 16.3299 24.7295C16.1897 25.0382 16.1126 25.4638 16.1126 25.9888C16.1126 26.545 16.2068 27.057 16.3751 27.4436C16.459 27.6364 16.5684 27.8141 16.7084 27.9485C16.8506 28.0849 17.0397 28.1897 17.2663 28.1897C17.5413 28.1897 17.7592 28.0642 17.9117 27.8798C18.11 27.9701 18.3331 28.0534 18.5709 28.1188L18.5189 28.4917C18.493 28.639 18.4778 28.784 18.4778 28.8861C18.4778 29.0424 18.5107 29.2391 18.6559 29.3956C18.8059 29.5572 19.0108 29.607 19.2026 29.607C19.4329 29.607 19.6488 29.5249 19.8072 29.3383C19.9522 29.1676 20.0184 28.9447 20.047 28.7183C20.047 28.718 20.0471 28.7178 20.0471 28.7175L20.1068 28.2593C21.8059 28.0963 23.1259 26.9062 23.1259 25.1485C23.1259 24.2854 22.8071 23.6119 22.2961 23.1034C21.7944 22.604 21.1218 22.2769 20.4235 22.0606Z" fill="#50EEF6" stroke="#002140" stroke-width="0.714286"/>
    </svg>
  `,
    WORKFLOWS: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="${CAMPAIGN_ID}-simple-illustration__workflows_svg__Layer_1"
      x="0"
      y="0"
      viewBox="0 0 68 68"
      xml:space="preserve"
      width="48"
      height="48"
      hovered="false"
      pressed="false"
    >
      <style>
        .${CAMPAIGN_ID}-simple-illustration__workflows_svg__st0 { fill: #5ab0ff }
        .${CAMPAIGN_ID}-simple-illustration__workflows_svg__st1 { fill: #b0d9ff }
        .${CAMPAIGN_ID}-simple-illustration__workflows_svg__st2 { fill: #003c73 }
        .${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3 {
          fill: none;
          stroke: #003c73;
          stroke-linecap: round;
          stroke-linejoin: round
        }
      </style>

      <path
        d="M42.092 53.935v4.182c0 1.066-.564 1.569-1.602 1.569h-9.171c-.568 0-.991-.155-1.264-.465l-.042-.056c-.197-.254-.291-.601-.291-1.048v-4.182c0-1.071.564-1.574 1.597-1.574h9.171c.55 0 .968.141 1.236.432v.009c.244.259.366.635.366 1.133zM42.092 33.019v4.182c0 1.066-.564 1.569-1.602 1.569h-9.171c-.568 0-.991-.155-1.264-.465l-.042-.056c-.197-.254-.291-.601-.291-1.048v-4.182c0-1.071.564-1.574 1.597-1.574h9.171c.55 0 .968.141 1.236.432v.009c.244.259.366.635.366 1.133zM42.092 12.105v4.182c0 1.067-.564 1.569-1.602 1.569h-9.171c-.568 0-.991-.155-1.264-.465l-.042-.056c-.197-.254-.291-.601-.291-1.048v-4.182c0-1.071.564-1.574 1.597-1.574h9.171c.55 0 .968.141 1.236.432v.009c.244.259.366.635.366 1.133z"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st0"
      />

      <path
        d="M12.958 49.139h-3.65c-.569 0-.991-.155-1.264-.465l-.042-.056c-.198-.254-.292-.602-.292-1.048v-4.182c0-1.071.564-1.574 1.597-1.574h9.171c.55 0 .968.141 1.236.432v.009c.244.258.366.634.366 1.132v4.182c0 1.067-.564 1.569-1.602 1.569h-5.52zM62 22.471v4.181c0 1.067-.564 1.569-1.602 1.569h-9.171c-.568 0-.991-.155-1.264-.465l-.043-.056c-.197-.254-.291-.601-.291-1.048v-4.181c0-1.071.564-1.574 1.597-1.574h9.171c.55 0 .968.141 1.236.432v.009c.245.259.367.634.367 1.133zM17.567 11.626a4.27 4.27 0 0 1 .85 2.57 4.303 4.303 0 0 1-4.304 4.304 4.32 4.32 0 0 1-3.045-1.259 4.294 4.294 0 0 1-1.264-3.045 4.307 4.307 0 0 1 4.304-4.304 4.287 4.287 0 0 1 3.454 1.734h.005z"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st1"
      />

      <path
        d="m56.531 55.687-5.826 4.506v-9.012l5.826 4.506zM29.722 53.936v4.181c0 .446.099.794.291 1.048l-1.071-1.372-.038-.07c-.127-.235-.188-.531-.188-.893v-4.182c0-1.071.564-1.574 1.597-1.574h9.171c.489 0 .874.113 1.142.348l.066.066 1.034 1.311c-.268-.291-.686-.432-1.236-.432h-9.171c-1.038 0-1.597.503-1.597 1.574v-.005zM18.478 41.809H9.307c-1.038 0-1.597.503-1.597 1.574v4.182c0 .446.099.794.291 1.048L6.929 47.24l-.038-.07c-.127-.235-.188-.531-.188-.893v-4.181c0-1.071.564-1.574 1.597-1.574h9.171c.489 0 .874.113 1.142.348l.066.066 1.034 1.311c-.268-.291-.686-.432-1.236-.432v-.006zM60.6 20.022l1.034 1.311c-.268-.291-.686-.432-1.236-.432h-9.171c-1.038 0-1.597.503-1.597 1.574v4.182c0 .446.099.794.291 1.048l-1.071-1.372-.038-.071c-.127-.235-.188-.531-.188-.893v-4.181c0-1.071.564-1.574 1.597-1.574h9.171c.489 0 .874.113 1.142.348l.066.066v-.006zM29.722 12.107v4.182c0 .446.099.794.291 1.048l-1.071-1.372-.038-.07c-.127-.235-.188-.531-.188-.893v-4.177c0-1.071.564-1.574 1.597-1.574h9.171c.489 0 .874.113 1.142.348l.066.066 1.034 1.311c-.268-.291-.686-.432-1.236-.432h-9.171c-1.038 0-1.597.503-1.597 1.574v-.011zM16.045 9.766l.127.127a9.46 9.46 0 0 1 1.391 1.729 4.286 4.286 0 0 0-3.449-1.729 4.307 4.307 0 0 0-4.304 4.304c0 1.189.484 2.265 1.264 3.045l-.019.019c-.667-.625-1.146-1.297-1.55-1.992a4.305 4.305 0 0 1-.705-2.36 4.31 4.31 0 0 1 4.304-4.304c1.132 0 2.166.442 2.937 1.161h.004zM29.722 33.018V37.2c0 .446.099.794.291 1.048l-1.071-1.372-.038-.07c-.127-.235-.188-.531-.188-.893V31.73c0-1.071.564-1.574 1.597-1.574h9.171c.489 0 .874.113 1.142.348l.066.066 1.034 1.311c-.268-.291-.686-.432-1.236-.432h-9.171c-1.038 0-1.597.503-1.597 1.574v-.005z"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st2"
      />

      <path
        d="M17.567 11.626a4.27 4.27 0 0 1 .85 2.57 4.303 4.303 0 0 1-4.304 4.304 4.32 4.32 0 0 1-3.045-1.259 4.294 4.294 0 0 1-1.264-3.045 4.307 4.307 0 0 1 4.304-4.304c1.414 0 2.664.677 3.449 1.729M31.323 10.531h9.167M31.323 17.857h9.167M42.092 12.106v4.181M29.721 12.106v4.182M29.721 12.105c0-1.071.564-1.574 1.597-1.574M41.726 10.964c-.268-.291-.686-.432-1.236-.432M42.092 12.105c0-.493-.122-.869-.362-1.132M30.06 17.391c.268.31.695.465 1.264.465M29.721 16.287c0 .446.099.794.291 1.048M42.092 16.287c0 1.067-.564 1.569-1.602 1.569"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />

      <path
        d="M9.505 15.268a4.3 4.3 0 0 1-.705-2.359 4.31 4.31 0 0 1 4.304-4.304c1.132 0 2.166.442 2.937 1.161M30.314 9.25h9.171M28.716 10.822v4.177M28.716 10.824c0-1.071.564-1.574 1.597-1.574M40.627 9.592c-.268-.23-.653-.348-1.142-.348M28.716 15c0 .362.066.658.188.893M17.567 11.626l-.005-.005a9.253 9.253 0 0 0-1.391-1.729M11.092 17.293s-.023-.024-.038-.033c-.667-.625-1.146-1.297-1.551-1.992M30.059 17.391l-.042-.056-1.076-1.372M41.731 10.974l-.005-.009-1.034-1.306M51.227 20.896h9.171M51.227 28.221h9.172M61.995 22.471v4.182M49.629 22.471v4.182M49.629 22.471c0-1.071.564-1.574 1.597-1.574M61.633 21.329c-.268-.291-.686-.432-1.236-.432M62 22.47c0-.493-.122-.869-.362-1.132M49.963 27.756c.268.31.695.465 1.264.465M49.629 26.652c0 .446.099.794.291 1.048M62 26.652c0 1.067-.564 1.569-1.602 1.569M50.216 19.613h9.172M48.619 21.188v4.182M48.619 21.187c0-1.071.564-1.574 1.597-1.574M60.529 19.957c-.268-.23-.653-.348-1.142-.348M48.619 25.369c0 .362.066.658.188.893"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />

      <path
        d="m49.962 27.756-.042-.056-1.071-1.372M61.638 21.339l-.005-.009-1.034-1.306M9.307 41.809h9.171M9.307 49.139h9.172M20.076 43.383v4.182M7.71 43.383v4.182M7.71 43.383c0-1.071.564-1.574 1.597-1.574M19.715 42.247c-.268-.291-.686-.432-1.236-.432M20.081 43.382c0-.493-.122-.869-.362-1.132M8.043 48.674c.268.31.695.465 1.264.465M7.71 47.564c0 .446.099.794.291 1.048M20.081 47.564c0 1.067-.564 1.569-1.602 1.569M8.297 40.527h9.171M6.699 42.1v4.182M6.699 42.101c0-1.071.564-1.574 1.597-1.574M18.61 40.875c-.268-.23-.653-.348-1.142-.348M6.699 46.281c0 .362.066.658.188.893M8.043 48.674l-.042-.061-1.071-1.367"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />

      <path
        d="m19.719 42.256-.005-.009-1.034-1.311M31.323 31.445h9.167M31.323 38.77h9.167M42.092 33.018V37.2M29.721 33.018V37.2M29.721 33.019c0-1.071.564-1.574 1.597-1.574M41.726 31.882c-.268-.291-.686-.432-1.236-.432M42.092 33.019c0-.493-.122-.869-.362-1.132M30.06 38.309c.268.31.695.465 1.264.465M29.721 37.199c0 .446.099.794.291 1.048M42.092 37.199c0 1.067-.564 1.569-1.602 1.569M30.314 30.162h9.171M28.716 31.736v4.182M28.716 31.736c0-1.071.564-1.574 1.597-1.574M40.627 30.504c-.268-.23-.653-.348-1.142-.348M28.716 35.918c0 .362.066.658.188.893"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />

      <path
        d="m30.059 38.309-.042-.061-1.076-1.367M41.731 31.891l-.005-.009-1.034-1.311M31.323 52.357h9.167M31.323 59.688h9.167M42.092 53.936v4.177M29.721 53.936v4.177M29.721 53.935c0-1.071.564-1.574 1.597-1.574M41.726 52.794c-.268-.291-.686-.432-1.236-.432M42.092 53.935c0-.493-.122-.869-.362-1.132M30.06 59.221c.268.31.695.465 1.264.465M29.721 58.113c0 .446.099.794.291 1.048M42.092 58.113c0 1.066-.564 1.569-1.602 1.569M30.314 51.074h9.171M28.716 52.648v4.182M28.716 52.648c0-1.071.564-1.574 1.597-1.574M40.627 51.422c-.268-.23-.653-.348-1.142-.348M28.716 56.83c0 .362.066.658.188.893"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />

      <path
        d="m30.059 59.221-.042-.061-1.076-1.367M41.731 52.803l-.005-.009-1.034-1.311M20.081 34.775h8.466M42.092 34.775h6.714M18.418 13.863h10.191M42.092 13.863h6.714M20.081 55.688h8.466M42.356 55.688h8.213M55.488 19.614c-1.052-3.261-3.28-5.751-6.676-5.751M48.807 34.775c3.674 0 5.976-2.904 6.911-6.554M13.188 40.526c1.057-3.261 3.28-5.751 6.676-5.751M19.865 55.688c-3.674 0-5.976-2.904-6.907-6.554 0-.005 0-.014-.005-.019M50.705 51.182v9.012M50.705 51.182l5.826 4.506M50.705 60.193l5.826-4.506"
        class="${CAMPAIGN_ID}-simple-illustration__workflows_svg__st3"
      />
    </svg>
  `,
    LOADING: '<svg height="100%" viewBox="0 0 32 32" width="100%"><circle cx="16" cy="16" fill="none" r="14" stroke-width="4" style="stroke: rgb(231, 236, 233); opacity: 0.2;"></circle><circle cx="16" cy="16" fill="none" r="14" stroke-width="4" style="stroke: rgb(231, 236, 233); stroke-dasharray: 80; stroke-dashoffset: 60;"></circle></svg>'
  };

  const FEATURES = [
    {
      id: 'categories',
      title: 'Categories',
      icon: SVG.CATEGORIES,
      enabledByDefault: true,
      apiEndpoint: 'EnablePolicyCategories'
    },
    {
      id: 'accounting',
      title: 'Accounting',
      icon: SVG.ACCOUNTING,
      enabledByDefault: true,
      programmaticalyEnabled: true,
      apiEndpoint: 'EnablePolicyConnections'
    },
    {
      id: 'company-cards',
      title: 'Company cards',
      icon: SVG.COMPANY_CARD,
      enabledByDefault: true,
      apiEndpoint: 'EnablePolicyCompanyCards'
    },
    {
      id: 'workflows',
      title: 'Workflows',
      icon: SVG.WORKFLOWS,
      enabledByDefault: true,
      apiEndpoint: 'EnablePolicyWorkflows'
    },
    {
      id: 'invoices',
      title: 'Invoices',
      icon: SVG.INVOICES,
      apiEndpoint: 'EnablePolicyInvoicing'
    },
    {
      id: 'rules',
      title: 'Rules',
      icon: SVG.RULES,
      apiEndpoint: 'SetPolicyRulesEnabled',
      requiresUpdate: true,

    },
    {
      id: 'distance-rates',
      title: 'Distance rates',
      icon: SVG.DISTANCE_RATES,
      apiEndpoint: 'EnablePolicyDistanceRates'
    },
    {
      id: 'expensify-card',
      title: 'Expensify Card',
      icon: SVG.EXPENSIFY_CARDS,
      apiEndpoint: 'EnablePolicyExpensifyCards'
    },
    {
      id: 'tags',
      title: 'Tags (projects, etc.)',
      icon: SVG.TAGS,
      apiEndpoint: 'EnablePolicyTags'
    },
    {
      id: 'per-diem',
      title: 'Per diem',
      icon: SVG.PER_DIEM,
      apiEndpoint: 'TogglePolicyPerDiem',
      requiresUpdate: true,
      customUnitID: '20350A0E8B132',
    }
  ];

  async function apiRequest({endpoint, reqData = {}, enabled, token, policyID, email}) {
    const formData = new FormData();
    const baseData = {
      apiRequestType: 'write',
      platform: 'web',
      shouldRetry: 'true',
      canCancel: 'true',
      authToken: token,
      enabled: `${enabled}`,
      policyID,
      email,
    };
    const data = { ...baseData, ...reqData };

    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        formData.append(key, data[key]);
      }
    }

    const res = await fetch(`https://www.expensify.com/api/${endpoint}?`, {
      method: 'POST',
      body: formData,
    });

    return await res.json();
  }

  async function getPayloadDataFromDB() {
    const token = await getToken();
    const policyID = await getPolicyID();
    const email = await getUserEmail();
    const chatReportID = await getChatReportID();
    const reportActions = await getReportAction(chatReportID);

    return {
      token,
      policyID,
      email,
      chatReportID,
      reportActions
    };
  }

  async function getChatReportID() {
    const nvpOnboarding = await getObjectFromIndexedDB('nvp_onboarding');

    return nvpOnboarding.chatReportID;
  }

  async function getReportAction(id) {
    const reportActions = await getObjectFromIndexedDB(`reportActions_${id}`);

    return reportActions;
  }

  async function getToken() {
    const sessionData = await getObjectFromIndexedDB('session');

    return sessionData.authToken;
  }

  async function getPolicyID() {
    const POLICY_CHECK_INTERVAL = 500;

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20;

      const checkForPolicyID = async () => {
        attempts++;

        if (attempts >= maxAttempts) {
          reject(new Error('Failed to get policy ID after maximum attempts'));
          return;
        }

        try {
          const account = await getObjectFromIndexedDB('account');

          if (account && account.activePolicyID) {
            resolve(account.activePolicyID);
            return;
          }

          setTimeout(checkForPolicyID, POLICY_CHECK_INTERVAL);
        } catch (error) {
          setTimeout(checkForPolicyID, POLICY_CHECK_INTERVAL);
        }
      };

      checkForPolicyID();
    });
  }

  async function getUserEmail() {
    const userMetadata = await getObjectFromIndexedDB('userMetadata');

    return userMetadata.email;
  }

  function findFeatureById(featureId) {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) {
      throw new Error(`Feature not found for ID: ${featureId}`);
    }
    return feature;
  }

  const deleteCommentMapper = Object.freeze({
    'company-cards': 'corporate card',
    'categories': 'categories',
    'tags': 'tags',
  });

  function getReportActionID(data, searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const values = Object.values(data);
    const match = values.find(obj =>
      obj.message?.some(msg => msg.text?.toLowerCase().includes(lowerCaseSearchTerm))
    );
    return match?.reportActionID;
  }

  async function processDeleteCommentAPICalls(unabledFeatures, payloadDataFromDB) {
    for (const feature of unabledFeatures) {
      if (typeof feature.apiEndpoint !== 'string') continue;

      const searchTerm = deleteCommentMapper[feature.id];
      if (!searchTerm) continue;

      const reportActionID = await getReportActionID(
        payloadDataFromDB.reportActions,
        searchTerm
      );

      if (reportActionID) {
        await apiRequest({
          endpoint: 'DeleteComment',
          reqData: { reportActionID, reportID: payloadDataFromDB.chatReportID },
          ...payloadDataFromDB
        });
      }
    }
  }

  async function processFeatureAPICalls(features, enabled, payloadDataFromDB) {
    for (const feature of features) {
      if (typeof feature.apiEndpoint !== 'string') continue;

      if (feature.apiEndpoint === 'TogglePolicyPerDiem') {
        await apiRequest({
          endpoint: 'TogglePolicyPerDiem',
          reqData: { customUnitID: feature.customUnitID },
          enabled,
          ...payloadDataFromDB
        });
      } else {
        await apiRequest({
          endpoint: feature.apiEndpoint,
          enabled,
          ...payloadDataFromDB
        });
      }
    }
  }

  async function processFeatureSelection(step) {
    const getFeatures = (selector) => Array.from(
      step.querySelectorAll(selector)
    ).map(checkbox => findFeatureById(checkbox.dataset.lcFeature));

    const selectedFeatures = getFeatures(`.${CAMPAIGN_PREFIX}-feature input[type="checkbox"]:checked`);
    const unselectedFeatures = getFeatures(`.${CAMPAIGN_PREFIX}-feature input[type="checkbox"]:not(:checked)`);

    const featuresToEnable = selectedFeatures.filter(feature =>
      (!feature.enabledByDefault || feature.programmaticalyEnabled) && feature.apiEndpoint
    );

    const featuresToDisable = unselectedFeatures.filter(feature =>
      feature.enabledByDefault && feature.apiEndpoint
    );

    const payloadDataFromDB = await getPayloadDataFromDB();

    if (featuresToEnable.some(feature => feature.requiresUpdate)) {
      await apiRequest({endpoint: 'UpgradeToCorporate', ...payloadDataFromDB});
    }

    await processFeatureAPICalls(featuresToEnable, true, payloadDataFromDB);
    await processFeatureAPICalls(featuresToDisable, false, payloadDataFromDB);

    await processDeleteCommentAPICalls(unselectedFeatures, payloadDataFromDB);

    if (selectedFeatures.length > 0) {
      selectedFeatures.forEach(feature => {
        if (feature.id) {
          trackFSMetric('features', { feature: feature.id });
        }
      });
    } else {
      trackFSMetric('features', { feature: 'blank-selection' });
    }

    return selectedFeatures;
  }

  async function handleContinueClick(button, step, logger) {
    try {
      this.defaultCTAClick();
      await processFeatureSelection(step);
    } catch (error) {
      logger.error('Failed to process feature selection:', error);
    }
  }

  function getSteps(logger) {
    return [
      {
        buildHtml() {
          const renderFeatureSection = (subtitle, filterFn) => {
            return `
            <p class="${CAMPAIGN_PREFIX}-subtitle">
              ${subtitle}
            </p>
            <div class="${CAMPAIGN_PREFIX}-features-container">
              ${FEATURES.filter((feature) => filterFn(feature) && feature.id)
    .map(
      (feature) => `
                    <div class="${CAMPAIGN_PREFIX}-feature">
                      <div class="${CAMPAIGN_PREFIX}-feature-content">
                        <span class="${CAMPAIGN_PREFIX}-icon">${feature.icon}</span>
                        <p class="${CAMPAIGN_PREFIX}-feature-title">${feature.title}</p>
                      </div>
                      <div class="${CAMPAIGN_PREFIX}-checkbox">
                        <input type="checkbox"
                          id="${CAMPAIGN_PREFIX}-${feature.id}"
                          data-lc-feature="${feature.id}"
                          ${feature.enabledByDefault ? 'checked' : ''}
                        >
                        <label for="${CAMPAIGN_PREFIX}-${feature.id}"></label>
                      </div>
                    </div>
                  `
    )
    .join('')}
            </div>
          `;
          };

          return `
          <h1 class="${CAMPAIGN_PREFIX}-title">
            What features are you interested in?
          </h1>
          ${renderFeatureSection(
    'Your workspace already has the following enabled:',
    (feature) => feature.enabledByDefault
  )}
          ${renderFeatureSection(
    'Enable additional features you may be interested in:',
    (feature) => !feature.enabledByDefault
  )}
          <div class="${CAMPAIGN_PREFIX}-ctas">
            <button class="${CAMPAIGN_PREFIX}-cta-primary">
              <span class="${CAMPAIGN_PREFIX}-btn-text">Continue</span>
              <span class="${CAMPAIGN_PREFIX}-btn-spinner">${SVG.LOADING}</span>
            </button>
          </div>
        `;
        },

        attachListeners(event) {
          const { target } = event;
          event.stopPropagation();
          event.stopImmediatePropagation();

          const featureElement = target.closest(`.${CAMPAIGN_PREFIX}-feature`);
          if (featureElement && !featureElement.classList.contains(`${CAMPAIGN_PREFIX}-feature-locked`)) {
            const checkbox = featureElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = !checkbox.checked;
            }
          }

          const isContinueButton = target.closest(
            `.${CAMPAIGN_PREFIX}-cta-primary`
          );
          const currentStep = this.currentStep;
          const isCustomStep = currentStep.classList.contains(`${CAMPAIGN_PREFIX}-custom-step`);

          if (isContinueButton && isCustomStep) {
            handleContinueClick.call(this, isContinueButton, currentStep, logger);
          }
        },
      },
    ];
  }

  const Nav = {
    PREV: 'prev',
    NEXT: 'next',
  };


  function ModalWrapper({logger}) {
    const stepsData = getSteps(logger);

    let isTransitioning = false;
    let container;
    let currentStepIdx = 0;

    const accountValidator = createAccountSelectionValidator({
      logger,
      useCapture: true
    });

    return {
      stepWithBaseLayout({ buildHtml, attachListeners}, idx) {
        const element = document.createElement('div');
        element.classList.add(`${CAMPAIGN_PREFIX}-step`, `${CAMPAIGN_PREFIX}-custom-step`);
        element.innerHTML = `<div class="${CAMPAIGN_PREFIX}-header">
            <div class="${CAMPAIGN_PREFIX}-back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" xml:space="preserve" width="20" height="20" hovered="false" pressed="false" fill="#8B9C8F">
                <path d="M14.2 18.4c-.8.8-2 .8-2.8 0L3 10l8.4-8.4c.8-.8 2-.8 2.8 0s.8 2 0 2.8L8.7 10l5.6 5.6c.7.8.7 2-.1 2.8z" style="fill-rule: evenodd; clip-rule: evenodd;"></path>
              </svg>
            </div>
            <div class="${CAMPAIGN_PREFIX}-progressbar" style="--pbProgress: 100%"></div>
          </div>
          <div class="${CAMPAIGN_PREFIX}-content">
              ${buildHtml()}
          </div>`;

        element.dataset.lcIndex = idx + 1;

        element.querySelector(`.${CAMPAIGN_PREFIX}-back`)?.addEventListener('click', (ev) => {
          try {
            this.goBack.bind(this)(ev);
          } catch (err) {
            logger.error(err);
          }
        });

        if (typeof attachListeners === 'function') {
          element.addEventListener('click', (ev) => {
            try { attachListeners.bind(this)(ev);} catch (err) { logger.error(err); }
          });
          return element;
        }

        attachListeners.forEach(({ type, cb, debounced }) => {
          const fn = debounced ? debounce(cb.bind(this), debounced) : cb.bind(this);
          element.addEventListener(type, (ev) => {
            try { fn(ev); } catch (err) { logger.error(err); }
          });
        });

        return element;
      },

      get defaultCTA() {
        return container.querySelector('button[data-listener="Enter"]');
      },

      defaultCTAClick() {
        this.defaultCTA?.click();
      },

      get currentStep() {
        if (!container) {
          throw new Error('Cannot get current step.');
        }
        return container.children[currentStepIdx];
      },

      get isRendered() {
        return container?.classList.contains(`${CAMPAIGN_PREFIX}-wrapper`);
      },

      updateContainerRef() {
        container = document.querySelector('[data-testid="BaseOnboardingAccounting"]')?.firstElementChild;
      },

      navigate({from, to, type, onTransitionEnd}) {
        const TICK_TIMEOUT = 10;

        if (isTransitioning) {
          logger.debug.error('Modal is still transitioning.');
          return;
        }

        const currentStep = from;
        const targetStep = to;

        const transitionClassCurrent = type === Nav.PREV ? `${CAMPAIGN_PREFIX}-in` : `${CAMPAIGN_PREFIX}-out`;
        const transitionClassTarget = type === Nav.PREV ? `${CAMPAIGN_PREFIX}-out` : `${CAMPAIGN_PREFIX}-in`;

        isTransitioning = true;

        currentStep.classList.add(transitionClassCurrent);

        targetStep.classList.add(transitionClassTarget, `${CAMPAIGN_PREFIX}-active`);
        setTimeout(() => targetStep.classList.remove(transitionClassTarget), TICK_TIMEOUT);

        currentStep.addEventListener('transitionend', () => {
          currentStep.classList.remove(transitionClassCurrent, `${CAMPAIGN_PREFIX}-active`);
          onTransitionEnd && onTransitionEnd({currentStep, targetStep});

          isTransitioning = false;
        }, {once: true});
      },

      goBackFromSupport(supportEl) {
        this.navigate({
          from: supportEl,
          to: this.currentStep,
          type: Nav.PREV,
          onTransitionEnd: () => supportEl.remove()
        });
      },

      goBack() {
        logger.debug.info('modal', 'navigate back');
        const currentStep = this.currentStep;
        const prevSibling = this.currentStep?.previousElementSibling;

        this.navigate({
          from: currentStep,
          to: prevSibling,
          type: Nav.PREV,
          onTransitionEnd: () => {
            currentStepIdx--;
          }
        });
      },

      goNext() {
        logger.debug.info('modal', 'navigate forward');
        const currentStep = this.currentStep;
        const nextSibling = this.currentStep?.nextElementSibling;

        this.navigate({
          from: currentStep,
          to: nextSibling,
          type: Nav.NEXT,
          onTransitionEnd: () => {
            currentStepIdx++;
          }
        });
      },

      markDefaultSteps() {
        const defaultSteps = container?.querySelectorAll(`:scope > div:not(.${CAMPAIGN_PREFIX}-default)`);
        defaultSteps?.forEach((el, idx) => {
          el.classList.add(`${CAMPAIGN_PREFIX}-default`, `${CAMPAIGN_PREFIX}-step`);
          el.dataset.lcIndex = `${idx}`;

          idx === 0 && el.classList.add(`${CAMPAIGN_PREFIX}-active`);
        });
      },

      handleDefaultCTA() {
        if (!container) return;

        this.defaultCTA.addEventListener('click', (e) => {
          try {
            if (!e.isTrusted) return;

            e.stopPropagation();
            e.stopImmediatePropagation();

            if (!accountValidator.isSelected) {
              this.defaultCTA.click();
              return;
            }

            const CLASSIC_EXPENSIFY_ARIA_LABELS = ['SAP', 'Oracle', 'Microsoft Dynamics'];
            let hasCheckedClassicAccounting = false;

            CLASSIC_EXPENSIFY_ARIA_LABELS.forEach(ariaLabel => {
              const accountingContainer = document.querySelector(`div[aria-label="${ariaLabel}"]`);
              const radioDiv = accountingContainer?.querySelector('div[role="radio"]');
              const innerSvg = radioDiv?.querySelector('svg');

              if (innerSvg) {
                hasCheckedClassicAccounting = true;
              }
            });

            if (hasCheckedClassicAccounting) {
              this.defaultCTA.click();
              return;
            }

            trackFSMetric('confirm');
            this.goNext();
          } catch (err) {
            logger.error(err);
          }
        }, true);
      },

      addSteps() {
        stepsData.map(this.stepWithBaseLayout.bind(this)).forEach(step => container?.insertAdjacentElement('beforeend', step));
      },

      addAccountingSelectionListeners() {
        accountValidator.initialize();
      },

      render() {
        accountValidator.reset();

        this.updateContainerRef();
        this.addAccountingSelectionListeners();

        if (this.isRendered) return;

        this.markDefaultSteps();
        this.addSteps();
        this.handleDefaultCTA();
        container.classList.add(`${CAMPAIGN_PREFIX}-wrapper`);
      },
    };
  }

  let modal = null;

  logger.info('running');
  init();

  function init() {
    if (campaignWindowStorage.contentLoaded) return;

    try {
      initVariant();
      applyVariant();
    } catch (err) {
      logger.error('Initialization failed:', err);
    }

    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED, applyVariant);
    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, revokeVariant);
  }

  function applyVariant() {
    HTML.classList.add(CAMPAIGN_PREFIX);
    logger.info('Variant applied');

    const container = document.querySelector('[data-testid="BaseOnboardingAccounting"]')?.firstElementChild;
    if (!container) {
      logger.error('Onboarding container not found.');
      return;
    }

    modal = ModalWrapper({ logger });
    modal.render();
  }

  function revokeVariant() {
    HTML.classList.remove(CAMPAIGN_PREFIX);
    logger.info('Variant revoked');
  }

  function initVariant() {
    campaignWindowStorage.contentLoaded = true;
    trackFSMetric('impression');
    logger.info('Variant initialized');
  }
})();
//# sourceURL=url://LeanConvert/ex50/variant-v1/js.js
}}}],"traffic_allocation":50}]},{"id":"1004152938","name":"c-ex61-workspace-survey","type":"a\/b","status":"active","global_js":null,"global_css":"","environment":"production","settings":{"min_order_value":0,"max_order_value":99999,"matching_options":{"audiences":"any","locations":"any"},"outliers":{"order_value":{"detection_type":"none"},"products_ordered_count":{"detection_type":"none"}}},"key":"c-x33-nbrdng-nw-stp-c-2-cln-3","version":10,"locations":["1004121912"],"site_area":null,"audiences":["100414260"],"goals":["100470997","100470998"],"integrations":[{"provider":"google_analytics","enabled":true,"type":"ga4","measurementId":"G-6BR2QJRCCD"}],"variations":[{"id":"1004361664","name":"Original Page","key":"1004361664-original-page","status":"stopped","changes":[{"id":1004583867,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004583868,"type":"customCode","data":{"css":"","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function waitFor(conditionFn, options = {}) {
    const { signal, stopAfter = 7000, stopIf } = options;

    return new Promise((resolve, reject) => {
      const interval = 50;
      let stoppedBy = '';
      let value;

      signal && signal.addEventListener('abort', () =>  { stoppedBy = 'signal'; });
      window.setTimeout(() => { stoppedBy = 'stopAfter timeout'; }, stopAfter);

      (function _innerWaitFor() {
        try {stopIf?.() && (stoppedBy = 'stopIf condition'); } catch (e) { /* silent */ }
        if (stoppedBy) { reject(Error(`waitFor stopped: by ${stoppedBy}`)); return; }
        try { value = conditionFn(); } catch (e) { /* silent */ }
        value ? resolve(value) : window.setTimeout(_innerWaitFor, interval);
      })();
    });
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  const CAMPAIGN_ID = 'ex61';
  const CAMPAIGN_PREFIX = 'lc-ex61';
  const HTML = document.documentElement;

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  async function trackFsEvent({eventName, properties = {}, logger}) {
    try {
      const FS = await waitFor(() => window.FS, { stopAfter: 3000 });
      FS('trackEvent', {
        name: eventName,
        properties: properties,
      });
      logger.info(`FS metric sent: ${eventName}`, properties);
    } catch (err) {
      logger.error(err);
    }
  }

  const SCRIPT_NAME = 'control-v0';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  function trackFSMetric(metricName, properties = {}) {
    trackFsEvent({
      eventName: `${CAMPAIGN_PREFIX}-${metricName}`,
      properties: {variant: SCRIPT_NAME, ...properties},
      logger: logger,
    });
  }

  logger.info('running');
  init();

  function init() {
    if (campaignWindowStorage.contentLoaded) return;

    try {
      applyVariant();
      initVariant();
    } catch (err) {
      logger.error(err);
    }

    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED, applyVariant);
    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, revokeVariant);
  }

  function applyVariant() {
    HTML.classList.add(CAMPAIGN_PREFIX);
    logger.debug.info('Variant applied');
  }

  function revokeVariant() {
    HTML.classList.remove(CAMPAIGN_PREFIX);
    logger.debug.info('Variant revoked');
  }

  function initVariant() {
    campaignWindowStorage.contentLoaded = true;
    trackFSMetric('impression');
    logger.debug.info('Variant initialized');
  }
})();
//# sourceURL=url://LeanConvert/ex61/control-v0/js.js
}}}],"traffic_allocation":0},{"id":"1004361665","name":"Variation 1","key":"1004361665-variation-1","status":"running","changes":[{"id":1004583869,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004583870,"type":"customCode","data":{"css":".lc-ex61 {\n  --overlayBgColor: rgb(26, 61, 50, 0.72);\n  --textColor: #E7ECE9;\n  --containerBgColor: #061B09;\n  --skipButtonBgColor: #1A3D32;\n  --skipButtonTextColor: #E7ECE9;\n  --skipButtonHoverBgColor: #224F41;\n  --nextButtonBgColor: #03D47C;\n  --nextButtonTextColor: #FCFBF9;\n  --nextButtonHoverBgColor: #00C271;\n  --inputBorderColor: #1A3D32;\n  --inputFocusBorderColor: #03D47C;\n  --inputHoverBorderColor: #224f41;\n  --checkboxBorderColor: #224F41;\n  --checkboxBgColor: #03D47C;\n  --errorMessageColor: #F25730;\n}\n@media (prefers-color-scheme: light) {\n  .lc-ex61 {\n    --overlayBgColor: rgba(235, 230, 223, 0.72);\n    --textColor: #002E22;\n    --containerBgColor: #FCFBF9;\n    --skipButtonBgColor: #E6E1DA;\n    --skipButtonHoverBgColor: #D8D1C7;\n    --skipButtonTextColor: #002E22;\n    --inputBorderColor: #E6E1DA;\n    --inputFocusBorderColor: #03A66B;\n    --inputHoverBorderColor: #0A5741;\n    --checkboxBorderColor: #D8D1C7;\n  }\n}\n.lc-ex61__overlay {\n  z-index: 99999;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  background-color: var(--overlayBgColor);\n}\n.lc-ex61__container {\n  box-sizing: border-box;\n  color: var(--textColor);\n  background-color: var(--containerBgColor);\n  width: 375px;\n  height: 100%;\n  padding: 20px;\n  font-family: \"Expensify Neue\";\n  display: flex;\n  flex-direction: column;\n}\n@media screen and (max-width: 480px) {\n  .lc-ex61__container {\n    width: 100%;\n  }\n}\n.lc-ex61__header {\n  display: flex;\n  gap: 12px;\n}\n.lc-ex61__header p {\n  font-size: 17px;\n  font-weight: bold;\n  margin: 0;\n}\n.lc-ex61__left-arrow {\n  display: flex;\n  align-items: center;\n}\n.lc-ex61__left-arrow:hover {\n  cursor: pointer;\n}\n.lc-ex61__step-container {\n  margin-top: 32px;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n}\n.lc-ex61__step {\n  display: none;\n}\n.lc-ex61__step h2 {\n  margin: 0;\n  font-family: \"Expensify New Kansas\";\n  font-size: 22px;\n  font-weight: normal;\n  margin-bottom: 32px;\n}\n.lc-ex61__active-step {\n  display: block;\n}\n.lc-ex61__checkboxes-container {\n  display: flex;\n  flex-direction: column;\n  gap: 28px;\n}\n.lc-ex61__checkbox-container {\n  display: flex;\n  justify-content: space-between;\n}\n.lc-ex61__checkbox-container label {\n  font-size: 15px;\n  font-weight: bold;\n  width: 100%;\n  cursor: pointer;\n}\n.lc-ex61__checkbox-container input[type=checkbox] {\n  margin: 0;\n  padding: 0;\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  border: 2px solid var(--checkboxBorderColor);\n  background-color: transparent;\n  cursor: pointer;\n  position: relative;\n}\n.lc-ex61__checkbox-container input[type=checkbox]:checked {\n  background-color: var(--checkboxBgColor);\n  border-color: var(--checkboxBgColor);\n}\n.lc-ex61__checkbox-container input[type=checkbox]:checked:after {\n  content: \"\";\n  position: absolute;\n  left: 4px;\n  top: 0px;\n  width: 5px;\n  height: 10px;\n  border: solid white;\n  border-width: 0 2px 2px 0;\n  transform: rotate(45deg);\n}\n.lc-ex61__missing-input {\n  border: 1px solid var(--inputBorderColor);\n  border-radius: 8px;\n  padding: 16px;\n  background-color: transparent;\n  width: 100%;\n  box-sizing: border-box;\n  caret-color: var(--textColor);\n  color: var(--textColor);\n  transition: border-color 0.2s ease, box-shadow 0.2s ease;\n}\n.lc-ex61__missing-input:hover {\n  border-color: var(--inputHoverBorderColor);\n}\n.lc-ex61__missing-input:focus {\n  outline: none;\n  border: 1px solid var(--inputFocusBorderColor);\n}\n.lc-ex61__missing-input:active {\n  border: 1px solid var(--inputFocusBorderColor);\n}\n.lc-ex61__missing-input::-moz-placeholder {\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  font-weight: 500;\n}\n.lc-ex61__missing-input::placeholder {\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  font-weight: 500;\n}\n.lc-ex61__feedback-input {\n  border: 1px solid var(--inputBorderColor);\n  border-radius: 8px;\n  padding: 16px;\n  background-color: transparent;\n  width: 100%;\n  box-sizing: border-box;\n  caret-color: var(--textColor);\n  color: var(--textColor);\n  transition: border-color 0.2s ease, box-shadow 0.2s ease;\n}\n.lc-ex61__feedback-input:hover {\n  border-color: var(--inputHoverBorderColor);\n}\n.lc-ex61__feedback-input:focus {\n  outline: none;\n  border: 1px solid var(--inputFocusBorderColor);\n}\n.lc-ex61__feedback-input:active {\n  border: 1px solid var(--inputFocusBorderColor);\n}\n.lc-ex61__feedback-input::-moz-placeholder {\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  font-weight: 500;\n}\n.lc-ex61__feedback-input::placeholder {\n  font-family: \"Expensify Neue\";\n  font-size: 15px;\n  font-weight: 500;\n}\n.lc-ex61__footer {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  margin-top: 24px;\n}\n.lc-ex61__error-message {\n  display: none;\n  color: var(--errorMessageColor);\n  font-size: 13px;\n  align-items: center;\n  gap: 14px;\n}\n.lc-ex61__error-message::before {\n  content: \"\";\n  display: block;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background-color: var(--errorMessageColor);\n}\n.lc-ex61__error-message.visible {\n  display: flex;\n}\n.lc-ex61__skip-button {\n  background-color: var(--skipButtonBgColor);\n  color: var(--skipButtonTextColor);\n  border-radius: 100px;\n  font-style: normal;\n  font-size: 15px;\n  font-weight: 700;\n  min-height: 52px;\n  cursor: pointer;\n  border: none;\n}\n.lc-ex61__skip-button:hover {\n  background-color: var(--skipButtonHoverBgColor);\n}\n.lc-ex61__next-button {\n  background-color: var(--nextButtonBgColor);\n  color: var(--nextButtonTextColor);\n  border-radius: 100px;\n  font-style: normal;\n  font-size: 15px;\n  font-weight: 700;\n  min-height: 52px;\n  cursor: pointer;\n  border: none;\n}\n.lc-ex61__next-button:hover {\n  background-color: var(--nextButtonHoverBgColor);\n}\n\/*# sourceURL=url:\/\/LeanConvert\/ex61\/variant-v1\/css.css *\/","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function waitFor(conditionFn, options = {}) {
    const { signal, stopAfter = 7000, stopIf } = options;

    return new Promise((resolve, reject) => {
      const interval = 50;
      let stoppedBy = '';
      let value;

      signal && signal.addEventListener('abort', () =>  { stoppedBy = 'signal'; });
      window.setTimeout(() => { stoppedBy = 'stopAfter timeout'; }, stopAfter);

      (function _innerWaitFor() {
        try {stopIf?.() && (stoppedBy = 'stopIf condition'); } catch (e) { /* silent */ }
        if (stoppedBy) { reject(Error(`waitFor stopped: by ${stoppedBy}`)); return; }
        try { value = conditionFn(); } catch (e) { /* silent */ }
        value ? resolve(value) : window.setTimeout(_innerWaitFor, interval);
      })();
    });
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  const CAMPAIGN_ID = 'ex61';
  const CAMPAIGN_PREFIX = 'lc-ex61';
  const HTML = document.documentElement;

  const ELEMENT_CLASSES = Object.freeze({
    OVERLAY: `${CAMPAIGN_PREFIX}__overlay`,
    CONTAINER: `${CAMPAIGN_PREFIX}__container`,
    HEADER: `${CAMPAIGN_PREFIX}__header`,
    FOOTER: `${CAMPAIGN_PREFIX}__footer`,
    SKIP_BUTTON: `${CAMPAIGN_PREFIX}__skip-button`,
    NEXT_BUTTON: `${CAMPAIGN_PREFIX}__next-button`,
    STEP_CONTAINER: `${CAMPAIGN_PREFIX}__step-container`,
    STEP: `${CAMPAIGN_PREFIX}__step`,
    ACTIVE_STEP: `${CAMPAIGN_PREFIX}__active-step`,
    MISSING_INPUT: `${CAMPAIGN_PREFIX}__missing-input`,
    FEEDBACK_INPUT: `${CAMPAIGN_PREFIX}__feedback-input`,
    LEFT_ARROW: `${CAMPAIGN_PREFIX}__left-arrow`,
    CHECKBOXES_CONTAINER: `${CAMPAIGN_PREFIX}__checkboxes-container`,
    CHECKBOX_CONTAINER: `${CAMPAIGN_PREFIX}__checkbox-container`,
    ERROR_MESSAGE: `${CAMPAIGN_PREFIX}__error-message`
  });

  const ELEMENT_IDS = Object.freeze({
    INPUTS: {
      EXPENSES: 'expenses',
      RECEIPTS: 'receipts',
      REPORTS: 'reports'
    }
  });

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  function getObjectFromIndexedDB(key) {
    return new Promise((res, rej) => {
      const request = indexedDB.open('OnyxDB');

      request.onerror = function(dbEvent) {
        rej(`Error opening database: ${dbEvent.target?.error}`);
      };

      request.onsuccess = function(event) {
        try {
          const db = event.target?.result;

          const transaction = db.transaction('keyvaluepairs', 'readonly');
          const objectStore = transaction.objectStore('keyvaluepairs');

          const getRequest = objectStore.get(key);

          getRequest.onsuccess = function() {
            const {result} = getRequest;
            if (result) {
              res(result);
            } else {
              rej(`No data found for key ${key}`);
            }
          };

          // eslint-disable-next-line no-shadow
          getRequest.onerror = function(event) {
            rej(`Error retrieving value: ${event.target?.error}`);
          };
        } catch (err) {
          rej(`Error creating request: ${err}`);
        }
      };
    });
  }

  async function trackFsEvent({eventName, properties = {}, logger}) {
    try {
      const FS = await waitFor(() => window.FS, { stopAfter: 3000 });
      FS('trackEvent', {
        name: eventName,
        properties: properties,
      });
      logger.info(`FS metric sent: ${eventName}`, properties);
    } catch (err) {
      logger.error(err);
    }
  }

  const SCRIPT_NAME = 'variant-v1';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  function trackFSMetric(metricName, properties = {}) {
    trackFsEvent({
      eventName: `${CAMPAIGN_PREFIX}-${metricName}`,
      properties: {variant: SCRIPT_NAME, ...properties},
      logger: logger,
    });
  }

  function leftArrowSVG() {
    return `
  <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.2423 17.4142C10.4613 18.1953 9.19496 18.1953 8.41391 17.4142L-0.000302315 9L8.41391 0.585787C9.19496 -0.195263 10.4613 -0.195263 11.2423 0.585787C12.0234 1.36683 12.0234 2.63317 11.2423 3.41421L5.65655 9L11.2423 14.5858C12.0234 15.3668 12.0234 16.6332 11.2423 17.4142Z" fill="#8B9C8F"/>
  </svg>
  `;
  }

  /* eslint-disable no-magic-numbers */

  function stringToNode(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.firstChild;
  }

  function getSkipButton() {
    return document.querySelector(`.${ELEMENT_CLASSES.SKIP_BUTTON}`);
  }

  function getNextButton() {
    return document.querySelector(`.${ELEMENT_CLASSES.NEXT_BUTTON}`);
  }

  function getActiveStep() {
    return document.querySelector(`.${ELEMENT_CLASSES.ACTIVE_STEP}`);
  }

  function getOverlay() {
    return document.querySelector(`.${ELEMENT_CLASSES.OVERLAY}`);
  }

  function getLeftArrow() {
    return document.querySelector(`.${ELEMENT_CLASSES.LEFT_ARROW}`);
  }

  function getErrorMessage() {
    return document.querySelector(`.${ELEMENT_CLASSES.ERROR_MESSAGE}`);
  }

  function getActiveStepNumber() {
    const activeStepElement = getActiveStep();
    if (!activeStepElement) {
      logger.error('Active step element not found!');
      return false;
    }

    return Number(activeStepElement.getAttribute('data-lc-step'));
  }

  function updateErrorMessage() {
    const errorMessage = getErrorMessage();
    const activeStep = getActiveStepNumber();

    if (!errorMessage || !activeStep) {
      logger.error('Error message element or active step not found!');
      return;
    }

    errorMessage.textContent = `Please ${activeStep === 1 ? 'select' : 'enter'} a response above`;
  }

  function updateNextButton() {
    const nextButton = getNextButton();
    const activeStep = getActiveStepNumber();

    if (!nextButton || !activeStep) {
      logger.error('Next button or active step not found!');
      return;
    }

    nextButton.textContent = activeStep !== 3 ? 'Next' : 'Submit';
  }

  function updateSkipButton() {
    const skipButton = getSkipButton();
    const activeStep = getActiveStepNumber();

    if (!skipButton || !activeStep) {
      logger.error('Skip button or active step not found!');
      return;
    }

    skipButton.style.display = activeStep !== 3 ? 'block' : 'none';
  }

  function toggleError(shouldRender) {
    const errorMessage = getErrorMessage();

    if (!errorMessage) {
      logger.error('Error message element not found!');
      return;
    }

    const method = shouldRender ? 'add' : 'remove';
    errorMessage.classList[method]('visible');
  }

  function getSidebarHTML() {
    return `
    <div class="${ELEMENT_CLASSES.OVERLAY}">
      <div class="${ELEMENT_CLASSES.CONTAINER}">
        <header class="${ELEMENT_CLASSES.HEADER}">
          <span class="${ELEMENT_CLASSES.LEFT_ARROW}">${leftArrowSVG()}</span>
          <p>Questions</p>
        </header>
        <form class="${ELEMENT_CLASSES.STEP_CONTAINER}">
          <div data-lc-step="1" class="${ELEMENT_CLASSES.STEP} ${ELEMENT_CLASSES.ACTIVE_STEP}">
            <h2>What feature made you create a workspace?</h2>
            <div class="${ELEMENT_CLASSES.CHECKBOXES_CONTAINER}">
              <div class="${ELEMENT_CLASSES.CHECKBOX_CONTAINER}">
                <label for="${ELEMENT_IDS.INPUTS.EXPENSES}">Categorize and tag expenses</label>
                <input type="checkbox" id="${ELEMENT_IDS.INPUTS.EXPENSES}" name="${ELEMENT_IDS.INPUTS.EXPENSES}" />
              </div>

              <div class="${ELEMENT_CLASSES.CHECKBOX_CONTAINER}">
                <label for="${ELEMENT_IDS.INPUTS.RECEIPTS}">Track and share receipts with others</label>
                <input type="checkbox" id="${ELEMENT_IDS.INPUTS.RECEIPTS}" name="${ELEMENT_IDS.INPUTS.RECEIPTS}" />
              </div>

              <div class="${ELEMENT_CLASSES.CHECKBOX_CONTAINER}">
                <label for="${ELEMENT_IDS.INPUTS.REPORTS}">Create reports</label>
                <input type="checkbox" id="${ELEMENT_IDS.INPUTS.REPORTS}" name="${ELEMENT_IDS.INPUTS.REPORTS}" />
              </div>
            </div>
          </div>
          <div data-lc-step="2" class="${ELEMENT_CLASSES.STEP}">
            <h2>Is there anything missing from your experience?</h2>
            <input class="${ELEMENT_CLASSES.MISSING_INPUT}" type="text" placeholder="What's missing?"/>
          </div>
          <div data-lc-step="3" class="${ELEMENT_CLASSES.STEP}">
            <h2>Any other feedback?</h2>
            <input class="${ELEMENT_CLASSES.FEEDBACK_INPUT}" type="text" placeholder="Feedback"/>
          </div>
        </form>
        <footer class="${ELEMENT_CLASSES.FOOTER}">
          <span class="${ELEMENT_CLASSES.ERROR_MESSAGE}">
            Please select a response above
          </span>
          <button class="${ELEMENT_CLASSES.SKIP_BUTTON}">Skip</button>
          <button class="${ELEMENT_CLASSES.NEXT_BUTTON}">Next</button>
        </footer>
      </div>
    </div>
  `;
  }

  function renderSidebar() {
    const sidebarHTML = getSidebarHTML();
    const node = stringToNode(sidebarHTML);

    const sidebarElement =  (node);

    document.body.appendChild(sidebarElement);
  }

  function removeSidebar() {
    const overlay = getOverlay();
    if (!overlay) {
      logger.error('Overlay element not found');
      return;
    }

    overlay.remove();
  }

  async function getUserAccountID() {
    const entry = await getObjectFromIndexedDB('userMetadata');
    return entry?.accountID;
  }

  async function collectResponses() {
    try {
      const userID = await getUserAccountID() || 'anonymous';

      const responses = {
        userID,
        question1: 'blanked',
        question2: 'blanked',
        question3: 'blanked'
      };

      const checkboxes = document.querySelectorAll(`#${ELEMENT_IDS.INPUTS.EXPENSES}, #${ELEMENT_IDS.INPUTS.RECEIPTS}, #${ELEMENT_IDS.INPUTS.REPORTS}`);
      const selectedFeatures = Array.from(checkboxes)
        .filter(checkbox =>  (checkbox).checked)
        .map(checkbox => checkbox.id);

      if (selectedFeatures.length > 0) {
        responses.question1 = selectedFeatures.join(', ');
      }

      const missingInput = document.querySelector(`.${ELEMENT_CLASSES.MISSING_INPUT}`);
      if (missingInput &&  (missingInput).value.trim() !== '') {
        responses.question2 =  (missingInput).value.trim();
      }

      const feedbackInput = document.querySelector(`.${ELEMENT_CLASSES.FEEDBACK_INPUT}`);
      if (feedbackInput &&  (feedbackInput).value.trim() !== '') {
        responses.question3 =  (feedbackInput).value.trim();
      }

      return responses;
    } catch (error) {
      logger.error('Error collecting responses:', error);
      throw error;
    }
  }

  /* eslint-disable no-magic-numbers */

  function validateFields() {
    const activeStepElement = getActiveStep();
    if (!activeStepElement) {
      logger.error('Active step element not found!');
      return false;
    }

    const stepNumber = Number(activeStepElement.getAttribute('data-lc-step'));

    switch (stepNumber) {
      case 1:
        const checkboxesContainer = document.querySelector(`.${ELEMENT_CLASSES.CHECKBOXES_CONTAINER}`);
        if (!checkboxesContainer) {
          logger.error('Checkboxes container not found!');
          return false;
        }

        const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
        const isAnyCheckboxChecked = Array.from(checkboxes).some(checkbox =>  (checkbox).checked);

        return isAnyCheckboxChecked;

      case 2:
        const missingInput = document.querySelector(`.${ELEMENT_CLASSES.MISSING_INPUT}`);
        if (!missingInput) {
          logger.error('Missing input not found!');
          return false;
        }

        return  (missingInput).value.trim() !== '';

      default:
        logger.warn(`No validation defined for step ${stepNumber}`);
        return true;
    }
  }

  function addNextButtonListener() {
    const nextButton = getNextButton();

    if (!nextButton) {
      logger.error('Next button not found!');
      return;
    }

    nextButton.addEventListener('click', () => {
      handleNextStep(true);
    });
  }

  function addSkipButtonListener() {
    const skipButton = getSkipButton();

    if (!skipButton) {
      logger.error('Skip button not found!');
      return;
    }

    skipButton.addEventListener('click', () => {
      handleNextStep(false);
    });
  }

  function addLeftArrowListener() {
    const leftArrow = getLeftArrow();

    if (!leftArrow) {
      logger.error('Not able to find left arrow element');
      return;
    }

    leftArrow.addEventListener('click', () => {
      handlePreviousStep();
    });
  }

  async function handleNextStep(shouldValidate) {
    const stepNumber = getActiveStepNumber();
    const activeStepElement = getActiveStep();

    if (!stepNumber || !activeStepElement) {
      logger.error('Step number or active step element not found!');
      return;
    }

    if (shouldValidate && !validateFields()) {
      logger.warn('Field is invalid!');
      toggleError(true);
      return;
    }


    if (stepNumber === 3) {
      const responses = await collectResponses();

      trackFSMetric('survey-answers', {answers: JSON.stringify(responses)});

      removeSidebar();
      return;
    }

    activeStepElement.classList.remove(ELEMENT_CLASSES.ACTIVE_STEP);
    const nextStepElement = document.querySelector(`[data-lc-step="${stepNumber + 1}"]`);
    nextStepElement?.classList.add(ELEMENT_CLASSES.ACTIVE_STEP);

    updateErrorMessage();
    updateNextButton();
    updateSkipButton();
    toggleError(false);
  }

  function handlePreviousStep() {
    const stepNumber = getActiveStepNumber();
    const activeStepElement = getActiveStep();

    if (!stepNumber || !activeStepElement) {
      logger.error('Step number or active step element not found!');
      return;
    }

    if (stepNumber === 1) {
      removeSidebar();
      return;
    }

    activeStepElement.classList.remove(ELEMENT_CLASSES.ACTIVE_STEP);
    const previousStepElement = document.querySelector(`[data-lc-step="${stepNumber - 1}"]`);
    previousStepElement?.classList.add(ELEMENT_CLASSES.ACTIVE_STEP);

    updateErrorMessage();
    updateNextButton();
    updateSkipButton();
    toggleError(false);
  }

  logger.info('running');
  init();

  function init() {
    if (campaignWindowStorage.contentLoaded) return;

    try {
      applyVariant();
      initVariant();
    } catch (err) {
      logger.error(err);
    }

    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED, applyVariant);
    campaignPubSub.on(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, revokeVariant);
  }

  function applyVariant() {
    renderSidebar();
    addNextButtonListener();
    addLeftArrowListener();
    addSkipButtonListener();

    HTML.classList.add(CAMPAIGN_PREFIX);
    logger.debug.info('Variant applied');
  }

  function revokeVariant() {
    HTML.classList.remove(CAMPAIGN_PREFIX);
    logger.debug.info('Variant revoked');
  }

  function initVariant() {
    campaignWindowStorage.contentLoaded = true;
    trackFSMetric('impression');
    logger.debug.info('Variant initialized');
  }
})();
//# sourceURL=url://LeanConvert/ex61/variant-v1/js.js
}}}],"traffic_allocation":100}]},{"id":"1004152939","name":"g-ex61-workspace-survey","type":"deploy","status":"active","global_js":null,"global_css":"","environment":"production","settings":{"min_order_value":0,"max_order_value":99999,"matching_options":{"audiences":"any","locations":"any"},"outliers":{"order_value":{"detection_type":"none"},"products_ordered_count":{"detection_type":"none"}}},"key":"g-x33-nbrdng-nw-stp-c-2-cln-3","version":10,"locations":["1004121907"],"site_area":null,"audiences":["100414260"],"goals":["100470997","100470998"],"integrations":[{"provider":"google_analytics","enabled":true,"type":"ga4","measurementId":"G-6BR2QJRCCD"}],"variations":[{"id":"1004361666","name":"Deployment","key":"1004361666-deployment","status":"running","changes":[{"id":1004583871,"type":"defaultCode","data":{"js":null,"css":"","custom_js":null}},{"id":1004583872,"type":"customCode","data":{"css":"","js":function(convertContext){ 
(function() {
  function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^|;|;\\s)' + name + '=([^;]+)'));
    return match && match[2] || '';
  }

  function _toArray(item) {
    return Array.isArray(item) ? item : [item];
  }

  function _prepareName(name, namespace) {
    return ['lc', namespace, name].filter(Boolean).join(':');
  }

  function _prepareNames(names, namespace) {
    return names.map(name => _prepareName(name, namespace));
  }

  function createPubSub(namespace = '') {
    return {
      trigger: (names, value, logger) => {
        _toArray(names).forEach(name => {
          const fullName = _prepareName(name, namespace);
          const eventObj = { name, value, fullName, origin: window.location.href };
          const namesSplit = fullName.split(':');

          do {
            window.dispatchEvent(new CustomEvent(namesSplit.join(':'), { detail: eventObj }));
            namesSplit.pop();
          } while (namesSplit.length);

          logger && logger.info(name, eventObj);
        });
      },
      on: (names, subscriber, options) => {
        _prepareNames(_toArray(names), namespace).forEach(name => {
          window.addEventListener(name, ( event) => {
            subscriber(event.detail.value, event.detail);
          }, options || {});
        });
      }
    };
  }

  function isInIframe(base = window) {
    try {
      return base.self !== base.parent;
    } catch (e) {
      return true;
    }
  }

  function createLogger({ prefix, cookieName, cookieValue, consoleMethod = 'info', isDarkMode = false }) {
    const prefixes = _toArray(prefix);

    const loggerMethodsColourMap = (
      isDarkMode ?
        { info: '#3cb8ff', log: '#3cb8ff', ok: '#64dd17', error: '#ff1744', warn: '#f9a66d' } :
        { info: 'blue', log: 'blue', ok: 'green', error: 'crimson', warn: '#f9a66d' }
    );
    const debugMessageStyles = `background-color: ${isDarkMode ? '#455a64' : '#E0E0E0'}; display: inline-block; padding: 2px 1px 2px 1px; border-radius: 2px;`;

    return {
      ..._getLoggerBase({ prefixes, checkValue: false }),
      debug: _getLoggerBase({
        checkValue: true,
        prefixes: [...prefixes],
        style: debugMessageStyles
      })
    };

    function _getLoggerBase(loggingSettings) {
      const loggerBase = {};

      Object.keys(loggerMethodsColourMap).forEach((loggerMethod) => {
        loggerBase[loggerMethod] = _getLoggingMethod({ ...loggingSettings, color: loggerMethodsColourMap[loggerMethod] });
      });

      return loggerBase;
    }

    function _getLoggingMethod(loggingSettings) {
      return function () {
        if (!_isCookieQualified(loggingSettings.checkValue)) return;

        const prefixCode = '[p]';
        const iframePrefix = isInIframe() ? 'iframe' : '';
        const allPrefixes = [iframePrefix, ...loggingSettings.prefixes].filter(Boolean);
        const args = [];

        [...arguments].forEach(arg => {
          if (typeof arg === 'string' && arg.startsWith(prefixCode)) {
            allPrefixes.push(arg.slice(prefixCode.length));
          } else {
            args.push(arg);
          }
        });

        if (window.console && typeof window.console[consoleMethod] === 'function') {
          window.console[consoleMethod](
            `%c${allPrefixes.map(n => `[${n}]`).join('')}${args.length ? ':' : ''}`,
            `color: ${loggingSettings.color}; ${loggingSettings.style || ''}`,
            ...args
          );
        }
      };
    }

    function _isCookieQualified(checkValue) {
      const currentCookieValue = getCookie(cookieName);

      if (checkValue) return (currentCookieValue === cookieValue.toString());
      return Boolean(currentCookieValue);
    }
  }

  function getWindowStorage(namespace) {
    window.lc = window.lc || {};
    window.lc[namespace] = window.lc[namespace] || {};
    return window.lc[namespace];
  }

  function onDomReady(callback) {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function onMutation(cb, target, options) {
    if (!target) throw Error('onMutation: taget must be an element');

    const observer = new MutationObserver(() => { try { cb(); } catch (e) { /* silent */ }});
    observer.observe(target, { subtree: true, childList: true, ...options });
  }

  function whenAllQualified({ conditions, logger }) {
    const conditionsPromised = [];
    const failureReasons = [];

    conditions.forEach(conditionFn => {
      const conditionName = conditionFn.name;
      const saveReason = () => failureReasons.push(conditionName);

      try {
        const result = conditionFn();

        if (typeof result.then !== 'function') {
          conditionsPromised.push(new Promise((resolve, reject) => {
            result ? resolve(result) : (saveReason() && reject(conditionName));
          }));
        } else {
          conditionsPromised.push(new Promise((resolve, reject) => {
            result
              .then(val => { (typeof val === 'undefined' || val)  ? resolve(val) : (saveReason() && reject(conditionName)); })
              .catch(() => { saveReason() && reject(conditionName); });
          }));
        }
      } catch (e) {
        saveReason() && conditionsPromised.push(Promise.reject(conditionName));
      }
    });

    setTimeout(() => {
      Promise.allSettled(conditionsPromised).then(results => {
        const failedConditions = results.map(result => (result.status === 'rejected' && result.reason)).filter(Boolean);
        failedConditions.length > 1 && logger && logger.info('[p]unqualified', 'All failed:', failedConditions);
      });
    }, 0);

    return Promise.all(conditionsPromised).catch((reason) => {
      logger && logger.info('[p]unqualified', 'First failed:', [reason]);
      return Promise.reject(reason);
    });
  }

  class Loader {
    constructor({ name, load }) {
      this.name = name;
      this.load = new Proxy(load, {
        apply: (target, thisArg,  [ settings ]) => {
          const { logger, campaignID, onRepeat } = settings;
          delete settings?.logger; delete settings?.onRepeat;
          const campaignWindowStorage = getWindowStorage(campaignID);

          if (campaignWindowStorage.hasLoadedFlag && onRepeat) { onRepeat(); return Promise.resolve(); }
          campaignWindowStorage.hasLoadedFlag = true;

          const loadSmart =  (new Promise((resolve, reject) => {
            if (campaignWindowStorage.isLoadedLocallyFlag) {
              logger?.ok('[p]loading...', 'locally');
              campaignWindowStorage.loadLocally();
              resolve();
            } else {
              logger?.ok('[p]loading...', { loader: name, ...settings });
              target.apply(thisArg, [ settings ]).then(resolve).catch(reject);
            }
          }));

          return loadSmart.catch(error => {
            logger?.error('[p]loading failed', { loader: name, ...settings, error: error.message });
            return Promise.reject(error);
          });
        }
      });
    }
  }

  function getConvertCampaignLoader() {
    return new Loader({
      name: 'Convert loader',
      load: ({ convertExperienceID, campaignID }) =>  (new Promise((res) => {
        window.lc = window.lc || {};
        window.lc.convert = window.lc.convert || {};
        window.lc.convert[campaignID] = true;

        window._conv_q = window._conv_q || [];
        window._conv_q.push(['executeExperiment', convertExperienceID]);
        setTimeout(() => { delete window.lc.convert[campaignID]; }, 0);
        res();
      }))
    });
  }

  const CAMPAIGN_EVENTS = Object.freeze({
    CAMPAIGN_REQUESTED_LOCALLY: 'campaign:requested:locally',
    CAMPAIGN_APPLIED: 'campaign:applied',
    CAMPAIGN_REVOKED: 'campaign:revoked',
    CAMPAIGN_ABORTED: 'campaign:aborted'
  });

  function watchCheckResult({ checkWhat, checkWhen, callbacks, skipPreCheckCb = false }) {
    const savedState = { map: new Map(), boolean: false };

    updateFuncState({ isPreCheck: true, skipCallbacks: skipPreCheckCb });

    checkWhen(updateFuncState);

    function updateFuncState(options) {
      const { isPreCheck = false, skipCallbacks = false } = (options || {});
      const funcResult = checkWhat();
      const funcStateDiff = getFuncStateDiff(funcResult, savedState);

      savedState.map = funcStateDiff.map;
      if (typeof funcStateDiff.boolean !== 'undefined') {
        savedState.boolean = funcStateDiff.boolean;
      }

      !skipCallbacks && runCallbacks(funcStateDiff, callbacks, isPreCheck);
    }
  }

  function getFuncStateDiff(funcResult, prevState) {
    const resultIsMap = funcResult instanceof Map;
    const resultIsNodeListOrArray = funcResult instanceof NodeList || Array.isArray(funcResult);

    if (resultIsMap || resultIsNodeListOrArray) {
      let newMap = resultIsMap ? funcResult : new Map(Array.from(funcResult).map(item => [ item, null ]));
      return {
        ...getBooleanStateDiff(Boolean(funcResult), prevState.boolean),
        ...getMapStateDiff(newMap, prevState.map),
        funcResult
      };
    }

    return {
      ...getBooleanStateDiff(Boolean(funcResult), prevState.boolean),
      ...getMapStateDiff(new Map(), prevState.map),
      funcResult
    };
  }

  function runCallbacks(funcStateDiff, callbacks, isPreCheck) {
    const { inList, outList, map, boolean, funcResult } = funcStateDiff;
    const { onIn, onOut, onAllOut, onTrue, onFalse } = callbacks;
    if (inList.length) {
      try { onIn && onIn(inList, isPreCheck); } catch (e) { /* silent */ }
    }

    if (outList.length) {
      try { onOut && onOut(outList); } catch (e) { /* silent */ }

      if (!map.size) {
        try { onAllOut && onAllOut(outList); } catch (e) { /* silent */ }
      }
    }

    if (boolean === true) {
      try { onTrue && onTrue(funcResult); } catch (e) { /* silent */ }
    }

    if (boolean === false) {
      try { onFalse && onFalse(); } catch (e) { /* silent */ }
    }
  }

  function getBooleanStateDiff(newBoolean, oldBoolean) {
    if (newBoolean !== oldBoolean) {
      return { boolean: newBoolean };
    }

    return {};
  }

  function getMapStateDiff(newMap, oldMap) {
    const inList = [];
    const outList = [];

    newMap.forEach((value, key) => {
      if (!oldMap.has(key) || oldMap.get(key) !== value) {
        inList.push(key);
      }
    });
    oldMap.forEach((value, key) => {
      if (!newMap.has(key) || newMap.get(key) !== value) {
        outList.push(key);
      }
    });

    return { map: newMap, inList, outList };
  }

  function getAllPageMutationsTarget() {
    return document.querySelector('#root') || document.body;
  }

  function getObjectFromIndexedDB(key) {
    return new Promise((res, rej) => {
      const request = indexedDB.open('OnyxDB');

      request.onerror = function(dbEvent) {
        rej(`Error opening database: ${dbEvent.target?.error}`);
      };

      request.onsuccess = function(event) {
        try {
          const db = event.target?.result;

          const transaction = db.transaction('keyvaluepairs', 'readonly');
          const objectStore = transaction.objectStore('keyvaluepairs');

          const getRequest = objectStore.get(key);

          getRequest.onsuccess = function() {
            const {result} = getRequest;
            if (result) {
              res(result);
            } else {
              rej(`No data found for key ${key}`);
            }
          };

          // eslint-disable-next-line no-shadow
          getRequest.onerror = function(event) {
            rej(`Error retrieving value: ${event.target?.error}`);
          };
        } catch (err) {
          rej(`Error creating request: ${err}`);
        }
      };
    });
  }

  function isNewPage() {
    return window?.location?.host?.includes('new');
  }

  async function isEngLang() {
    const lang = await getObjectFromIndexedDB('nvp_preferredLocale');

    return lang === 'en';
  }

  const CAMPAIGN_ID = 'ex61';
  const CAMPAIGN_PREFIX = 'lc-ex61';
  const HTML = document.documentElement;

  const SESSION_VIEW_KEY =  `${CAMPAIGN_PREFIX}-view`;

  const campaignPubSub = createPubSub(CAMPAIGN_ID);
  const campaignWindowStorage = getWindowStorage(CAMPAIGN_ID);

  function runCampaign({ convertExperienceID, logger }) {
    const loader = getConvertCampaignLoader();
    loader.load({
      campaignID: CAMPAIGN_ID,
      convertExperienceID, logger,
      onRepeat: () => campaignPubSub.trigger(CAMPAIGN_EVENTS.CAMPAIGN_APPLIED)
    });
  }

  function revokeCampaign({ reason, logger }) {
    if (isCampaignApplied()) {
      campaignPubSub.trigger(CAMPAIGN_EVENTS.CAMPAIGN_REVOKED, reason);
      logger && logger.info('[p]Campaign revoked', reason);
    }
  }

  function isCampaignApplied() {
    return HTML.classList.contains(CAMPAIGN_PREFIX);
  }

  const SCRIPT_NAME = 'targeting';
  const SCRIPT_PREFIX = `${CAMPAIGN_PREFIX}-${SCRIPT_NAME}`;
  const logger = createLogger({ prefix: SCRIPT_PREFIX, cookieName: 'lc-debug', cookieValue: CAMPAIGN_ID });

  async function getUserAccountID() {
    const entry = await getObjectFromIndexedDB('userMetadata');
    return entry?.accountID;
  }

  async function saveUserViewToStorage( logger ) {
    const userAccountID = await getUserAccountID();
    if ( !userAccountID) {
      logger.error('User account ID is null');
      return;
    }

    const savedSessionStorage = localStorage.getItem(SESSION_VIEW_KEY);

    if (!savedSessionStorage) {
      const value = {};
      value[userAccountID] = 1;

      localStorage.setItem(SESSION_VIEW_KEY, JSON.stringify(value));
      return;
    }

    const parsedSavedViewedDay = JSON.parse(savedSessionStorage);

    if (parsedSavedViewedDay[userAccountID]) {
      parsedSavedViewedDay[userAccountID] = Number(parsedSavedViewedDay[userAccountID]) + 1;
    } else {
      parsedSavedViewedDay[userAccountID] = 1;
    }

    localStorage.setItem(SESSION_VIEW_KEY, JSON.stringify(parsedSavedViewedDay));
  }

  async function getUserViewFromStorage() {
    const savedUserView = localStorage.getItem(SESSION_VIEW_KEY);
    const userAccountID = await getUserAccountID();
    if (!savedUserView || !userAccountID) {
      return null;
    }

    const parsedSavedViewedDay = JSON.parse(savedUserView);
    return Number(parsedSavedViewedDay[userAccountID]);
  }

  async function isFirstTimeView() {
    try {
      const view = await getUserViewFromStorage();
      if (view) return false;

      return true;
    } catch (error) {
      return true;
    }
  }

  async function isValidOnboardingPurpose() {
    const entry = await getObjectFromIndexedDB('onboardingPurposeSelected');
    return entry === 'newDotPersonalSpend' || entry === 'newDotSplitChat';
  }

  async function hasCreatedWorkspace() {
    const nvpIntroSelected = await getObjectFromIndexedDB('nvp_introSelected');
    if ('createWorkspace' in nvpIntroSelected) return true;
    return false;
  }

  const convertExperienceID = '1004152938';

  logger.info('running');
  onDomReady(init);

  async function init() {
    if (campaignWindowStorage.targetingLoaded) return;

    watchCheckResult({
      checkWhat: () => document.body,
      checkWhen: cb => onMutation(cb, getAllPageMutationsTarget(), {attributes: false}),
      callbacks: {
        onTrue: () => {
          whenAllQualified({ logger, conditions: [
            isNewPage,
            isEngLang,
            hasCreatedWorkspace,
            isFirstTimeView,
            isValidOnboardingPurpose
          ],
          })
            .then( async () => {
              await saveUserViewToStorage(logger);
              runCampaign({convertExperienceID, logger });
            })
            .catch((reason) => revokeCampaign({ logger, reason }));
        },
      }
    });
    campaignWindowStorage.targetingLoaded = true;
    logger.info('inited');
  }
})();
//# sourceURL=url://LeanConvert/ex61/targeting/js.js
}}}],"traffic_allocation":100}]}],"audiences":[{"id":"100414260","name":"lc-qa-cookie","key":"lc-qa-cookie","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"cookie","matching":{"match_type":"matches","negated":false},"value":"1","key":"lc-qa"}]}]}]},"type":"transient"}],"segments":[],"goals":[{"id":"100470997","name":"Decrease BounceRate","key":"decrease-bouncerate","type":"advanced","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"pages_visited_count","matching":{"match_type":"lessEqual","negated":true},"value":1},{"rule_type":"visit_duration","matching":{"match_type":"lessEqual","negated":true},"value":10}]}]}]}},{"id":"100470998","name":"Increase Engagement","key":"increase-engagement","type":"dom_interaction","rules":[],"settings":{"tracked_items":[{"event":"click","selector":"a"},{"event":"submit","selector":"form"}]}}],"locations":[{"id":"100490021","key":"location-aa-test","name":"Location - A\/A Test","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"matches","negated":false},"value":"https:\/\/www.expensify.com\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"100496836","key":"location-ex3-aa-experiment","name":"Location - ex3-aa-experiment","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"startsWith","negated":false},"value":"https:\/\/new.expensify.com\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"100498669","key":"inbox-view","name":"Inbox view","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"startsWith","negated":false},"value":"https:\/\/new.expensify.com\/r\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"100498760","key":"lctn-g-x16-rmv-vd-n-cncrg","name":"Location - g-ex16-remove-video-in-concierge","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"matches","negated":false},"value":"https:\/\/new.expensify.com\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"100498764","key":"lc-ex16","name":"lc-ex16","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex16 === true);
}}]},{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"startsWith","negated":false},"value":"https:\/\/new.expensify.com\/r\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"100498765","key":"lctn-g-x16-rmv-vd-n-cncrg-2","name":"Location - g-ex16-remove-video-in-concierge","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"matches","negated":false},"value":"https:\/\/new.expensify.com\/"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004104156","key":"location-c-ex00-submodule-te","name":"Location - c-ex00-submodule-test","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"https:\/\/new.expensify.com"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004104945","key":"lctn-g-x10-sbscrptn-plns-vrv","name":"Location - g-ex10-subscription-plans-overview","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex10?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004104947","key":"lctn-c-x10-sbscrptn-plns-vrv","name":"Location - c-ex10-subscription-plans-overview [sand]","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex10 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004106948","key":"lctn-g-x26-nbrdng-tsks-cntxt","name":"Location - g-ex26-onboarding-tasks-context","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com\/"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex26?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004106951","key":"lctn-c-x26-nbrdng-tsks-cntxt","name":"Location - c-ex26-onboarding-tasks-context","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex26 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004111010","key":"lctn-g-x33-nbrdng-nw-stp","name":"Location - g-ex33-onboarding-new-step","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex33?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004111012","key":"lctn-c-x33-nbrdng-nw-stp","name":"Location - c-ex33-onboarding-new-step","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex33 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004115649","key":"location-g-ex50-toggle-featu","name":"Location - g-ex50-toggle-features","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex50?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004115650","key":"location-c-ex50-toggle-featu","name":"Location - c-ex50-toggle-features","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex50 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004119018","key":"location-g-ex31-free-trial-p","name":"Location - g-ex31-free-trial-popup","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex31?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004119021","key":"location-c-ex31-free-trial-p","name":"Location - c-ex31-free-trial-popup","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex31 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004121907","key":"location-g-ex50-workspace-su","name":"Location - g-ex61-workspace-survey","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc?.ex61?.targetingLoaded !== true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004121912","key":"location-c-ex61-toggle-featu","name":"Location - c-ex61-workspace-survey","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"new.expensify.com"}]},{"OR_WHEN":[{"rule_type":"js_condition","matching":{"match_type":"equals","negated":false},"value":function(convertContext){ 
 return (window.lc.convert.ex61 === true);
}}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004122141","key":"location-test-staging","name":"Location - test-staging","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"matches","negated":false},"value":"https:\/\/staging.new.expensify.com"}]}]}]},"trigger":{"type":"upon_run"}},{"id":"1004122142","key":"location-test-staging-2","name":"Location - test-staging","rules":{"OR":[{"AND":[{"OR_WHEN":[{"rule_type":"url","matching":{"match_type":"contains","negated":false},"value":"staging.new.expensify.com"}]}]}]},"trigger":{"type":"upon_run"}}],"archived_experiences":["1004140333"],"features":[],"_s_t":"2025-06-10 05:23:08Z","is_debug":false};!function(){var t;!function(){"use strict";var e={};!function(){var t=e;Object.defineProperty(t,"__esModule",{value:!0});const n={rearrange(t,e){var n;const r=null==t?void 0:t.parentElement,i=e>[...r.children].findIndex((e=>e.id===t.id))?e+1:e;null===(n=null==t?void 0:t.setAttribute)||void 0===n||n.call(t,"data-convert",""),e<r.children.length-1?null==r||r.insertBefore(t,null==r?void 0:r.children.item(i)):null==r||r.appendChild(t)},safeSetAttribute(t,e,n){if(t){const r=document.querySelector(t);r&&(r[e]=n)}},applyStyles(t,e,n,r){var i;if(n=JSON.parse(n),t){let l="";Object.keys(n).forEach((i=>{const o=i.replaceAll(/([A-Z])/g,(t=>"-"+t.toLowerCase()));if("backgroundImage"===i)r?(l+="position: relative; overflow: hidden; ",this.insertAdjacentHTML(t,"beforeend",`<img data-selector="${e}" src="${n[i]}" alt="" style="position: absolute; left: 0; top: 0; width: 100%; z-index: 9999;" />`)):l+=`${o}: url('${n[i]}'); `;else{const t=n[i],e=["left","top","width","height","bottom","right"].includes(i)&&String(parseInt(t))===String(t)?"px":"";l+=`${o}: ${t}${e} ${["left","top","bottom","right"].includes(i)?"!important":""}; `}})),t.style.cssText+=l,null===(i=null==t?void 0:t.setAttribute)||void 0===i||i.call(t,"data-convert","")}return this},insertAdjacentHTML(t,e,n){if(!this.skipInsertedElements)switch(null==t||t.insertAdjacentHTML(e,n.replace(/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/gm,"<$1$2 data-convert>")),e){case"beforebegin":return null==t?void 0:t.previousElementSibling;case"afterbegin":return null==t?void 0:t.firstChild;case"beforeend":return null==t?void 0:t.lastChild;case"afterend":return null==t?void 0:t.nextElementSibling}},matchUrl(t,e){const n=t.substring(0,t.indexOf("?")<0?t.length:t.indexOf("?"));if(n===e||t===e)return!0;try{if(e.startsWith("http://www.")||e.startsWith("https://www.")?(e.startsWith("http://www.")&&(e=e.replace("http://www.","http://(www.)?")),e.startsWith("https://www.")&&(e=e.replace("https://www.","https://(www.)?"))):e.startsWith("http://")?e=e.replace("http://","http://(www.)?"):e.startsWith("https://")&&(e=e.replace("https://","https://(www.)?")),e.endsWith("/")||(e+="/"),n.match(e+"?$"))return!0}catch(t){return!1}return!1},applyChange(t,e,n){var r,i,l;const o=new URLSearchParams(location.search);["visualEditor","_conv_eignore","_conv_eforce","convert_action","convert_e","convert_v"].forEach((t=>o.delete(t)));const a=o.size?"?"+o.toString():"";if(n&&!this.matchUrl(window.location.origin+window.location.pathname+a+window.location.hash,n))return!0;const s=[...null!==(r=document.querySelectorAll(e.originalSelector!==t&&e.originalSelector?e.originalSelector:t))&&void 0!==r?r:[]];if(!s.length)return null;e.elementId&&(s[0].id=e.elementId,null===(l=null===(i=s[0])||void 0===i?void 0:i.setAttribute)||void 0===l||l.call(i,"data-convert","")),e.outerHtml&&s.forEach(((t,n)=>{var r,i,l,o;if(!(null==t?void 0:t.parentNode))return;const a=t.parentNode,c=Array.from(a.children).indexOf(t),d=document.createElement("div");d.innerHTML="<"===e.outerHtml.trim().slice(0,1)&&">"===e.outerHtml.trim().slice(-1)?e.outerHtml:`<div>${e.outerHtml}</div>`,(null!==(r=e.assignedElementId)&&void 0!==r?r:t.id)&&(d.children[0].id=null!==(i=e.assignedElementId)&&void 0!==i?i:t.id),null===(o=null===(l=d.childNodes[0])||void 0===l?void 0:l.setAttribute)||void 0===o||o.call(l,"data-convert",""),a.replaceChild(d.childNodes[0],t),s[n]=a.children[c]})),e.innerText&&s.forEach((t=>{var n;const r=document.createElement("textarea");r.innerHTML=e.innerText,t.innerText=r.value,null===(n=null==t?void 0:t.setAttribute)||void 0===n||n.call(t,"data-convert",""),r.remove()}));const c=[];return e.insertHtml&&s.forEach((t=>{Object.keys(e.insertHtml).forEach((n=>{if(e.insertHtml[n]){const r=this.insertAdjacentHTML(t,n,e.insertHtml[n]);c.push(r)}}))})),e.insertImage&&s.forEach((t=>{const n=this.insertAdjacentHTML(t,"afterbegin",e.insertImage);c.push(n)})),e.imageSourceSet&&s.forEach((t=>{const n=this.insertAdjacentHTML(t,"afterbegin",e.imageSourceSet);c.push(n)})),e.styles&&s.forEach((n=>{this.applyStyles(n,t,e.styles,e.setImageAsBadge)})),e.rearrange>=0&&this.rearrange(s[0],e.rearrange),{elements:s,insertedElements:c}}};t.default=n}(),t=e}(),window.convert_temp=window.convert_temp||{},convert_temp.toolkit=t.default}();
		
			
			window.convert = window.convert || {};
			if (window.convert_temp) {
				if (convert_temp.jQuery) convert.$ = convert_temp.jQuery;
				convert.T = window.convert_temp.toolkit;
				delete window.convert_temp;
			}
			
		
		const convertMap={"fire":"I","args":"k","err":"S","removeListeners":"_","experience":"yi","variation":"bi","matching":"Fr","match_type":"Gr","segments":"gh","splitTests":"Lh","enableVariation":"Rh","triggerExperimentVariation":"Ph","triggerExperienceVariation":"qh","variationId":"Bh","assignVariation":"Vh","executeMissingDataExperiences":"Fh","visitorId":"zh","triggerIntegrations":"Hh","checkExperiments":"Wh","checkExperiences":"Jh","doNotRunExperiences":"Kh","disableExperience":"Qh","enableExperience":"Yh","disableVariation":"Zh","executeExperiment":"Xh","executeExperience":"ta","executeExperienceLooped":"sa","experiences":"oa","breakExecution":"aa","isPreview":"ua","debugData":"va","splitTest":"fa","putData":"ka","bucketing":"Sa","eventType":"_a","runVariation":"Aa","locations":"Ta","trigger":"Na","firstTime":"Ra","isQAOverlay":"Pa","previewExperience":"qa","isAudienceAgnostic":"Ba","decidedVariation":"Va","selectVariationById":"Fa","visitorProperties":"Ga","forcedExperience":"Wa","enableTracking":"Ja","environment":"Qa","variations":"Za","experience_id":"Xa","variation_id":"tc","experienceName":"ec","experience_name":"sc","variationName":"nc","global_js":"oc","global_css":"hc","split_original":"uc","consentRequired":"fc","secure":"Ic","forceCookieSecure":"Sc","experiencesGoals":"qc","goals":"Bc","currentData":"Vc","tld":"Kc","hosts":"Qc","domains":"Yc","project":"Zc","geo":"Xc","weather":"td","campaign":"nd","sessionHash":"vd","archived_experiences":"md","returning":"yd","activatedFirstTime":"Ad","activated_first_time":"Ld","changes":"Td","isPreviewURL":"Pd","segmentId":"Ud","selectCustomSegmentsByIds":"Fd","goalId":"Hd","projectId":"Wd","goal_id":"Jd","triggerConversion":"ml","triggerConversions":"Il","sendRevenue":"yl","fromAutoPickRevenue":"xl","transactionId":"kl","amount":"Sl","productsCount":"_l","forceMultiple":"$l","pushRevenue":"Ol","recheck_goals":"Ml","recheckGoals":"Cl","processDone":"El","tracked_items":"Tl","settings":"Nl","ga_event":"Gl","triggering_type":"zl","bucketingData":"Wl","min_order_value":"Jl","max_order_value":"Kl","goalData":"Ql","contentSecurityPolicyNonce":"su","setClientLevel":"lu","isTrackingEnabled":"wu","getVisitorSegments":"mu","runHash":"Iu","account_id":"yu","pluginId":"xu","releaseQueue":"Su","placeVisitorIntoSegment":"ju","checkSegments":"Eu","checkSegmentLooped":"Au","putSegments":"Gu","browser":"zu","isRuleMatched":"pv","OR":"wv","negated":"yv","AND":"bv","OR_WHEN":"kv","rule_type":"$v","utc_offset":"Wv","getUrl":"Qv","getUrlWithQuery":"Yv","getQueryString":"Zv","getPageTagPageType":"tg","getPageTagCategoryId":"ig","getPageTagCategoryName":"eg","getPageTagProductSku":"sg","getPageTagProductName":"ng","getPageTagProductPrice":"og","getPageTagCustomerId":"rg","getPageTagCustom1":"hg","getPageTagCustom2":"ag","getPageTagCustom3":"cg","getPageTagCustom4":"dg","getWeatherCondition":"lg","getJsCondition":"ug","useSignals":"vg","getIsDesktop":"gg","getIsMobile":"fg","getIsTablet":"pg","getUserAgent":"wg","getOs":"mg","getBrowserVersion":"Ig","getBrowserName":"yg","getProjectTimeMinuteOfHour":"bg","getProjectTimeHourOfDay":"xg","getProjectTimeDayOfWeek":"kg","getLocalTimeMinuteOfHour":"Sg","getLocalTimeHourOfDay":"_g","getLocalTimeDayOfWeek":"$g","getBucketedIntoSegment":"Og","getBucketedIntoExperience":"Mg","getVisitsCount":"Cg","getVisitorType":"jg","getCookie":"Eg","getVisitDuration":"Dg","getGoalTriggered":"Ag","getPagesVisitedCount":"Lg","getLanguage":"Tg","getDaysSinceLastVisit":"Ng","getRegion":"Rg","getCountry":"Pg","getCity":"qg","getAvgTimePage":"Bg","getSourceName":"Vg","getMedium":"Ug","getKeyword":"Fg","getCampaign":"Gg","redistribute":"tf","batchSize":"nf","releaseInterval":"rf","events":"df","sdkKey":"pf","enrichData":"yf","accountId":"bf","visitors":"xf","tracking":"_f","disableTracking":"Ef","matchRulesByField":"zf","locationProperties":"Hf","selectLocations":"Yf","identityField":"Zf","site_area":"Xf","audiences":"tp","matching_options":"ep","traffic_allocation":"hp","usePolling":"gw","throttleChanges":"ww","useMutationObserver":"mw","showBody":"xw","currentExperiences":"Aw","changeId":"Tw","renderComplete":"Vw","useSPAOptimizations":"am","currentUrl":"um","isRedirect":"vm","isEditor":"gm","multipage_pages":"$m","percentage":"Tm","allow_crossdomain_tracking":"zm","integrations":"Zm","integration":"hI","integrationVariables":"cI","data_anonymization":"lI","isIntercepting":"jI","quantity":"DI","google_analytics":"LI","auto_revenue_tracking":"TI","no_wait_pageview":"qI","measurementId":"FI","user_id":"zI","_elevar_internal":"HI","user_properties":"WI","cookie_expires":"JI","getSegments":"oy","identify":"Vy","preventBodyAutoshow":"Uy","resetData":"Fy","fromApi":"Gy","consentGiven":"zy","setIntegrationVariable":"Hy","triggerLocation":"Wy","enablePreview":"Jy","disablePreview":"Ky","preview":"Qy","onAdditionalData":"Yy","getAllVisitorData":"Xy","getCurrentVisitorData":"tb","getUserData":"ib","getUrlParameter":"eb","custom_domain":"jb","isLocationAgnostic":"Db","editor":"Ab","delayRun":"Nb","js":"Ub","do_not_track":"zb","global_privacy_control":"Hb","runExperiences":"Zb","global_javascript":"tx","locationAgnostic":"ox","audienceAgnostic":"hx","visitor_insights":"gx","sampling_rate":"wx","visitorInsightsId":"mx","tracking_id":"Ix","delayContinuousActivation":"yx","interceptEventsEarly":"bx","customVariable":"xx","browsing":"Sx","thisRun":"$x","kissmetrics":"Vb","mixpanel":"sj","crazyegg":"HM","luckyorange":"SM","clicktale":"cx","googletagmanager":"VE","hotjar":"cI","baidu":"je","clicky":"Oo","cnzz":"es","econda":"jC","eulerian":"kB","gosquared":"LK","heapanalytics":"jU","mouseflow":"mx","piwik":"OC","segmentio":"Ib","sitecatalyst":"Gn","twipla":"Sv","woopra":"CB","ysance":"Fs","yandex":"Tl"};!function(){"use strict";function t(t,i){var e={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&i.indexOf(s)<0&&(e[s]=t[s]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(s=Object.getOwnPropertySymbols(t);n<s.length;n++)i.indexOf(s[n])<0&&Object.prototype.propertyIsEnumerable.call(t,s[n])&&(e[s[n]]=t[s[n]])}return e}function i(t,i,e,s){return new(e||(e=Promise))((function(n,o){function r(t){try{a(s.next(t))}catch(t){o(t)}}function h(t){try{a(s.throw(t))}catch(t){o(t)}}function a(t){var i;t.done?n(t.value):(i=t.value,i instanceof e?i:new e((function(t){t(i)}))).then(r,h)}a((s=s.apply(t,i||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;class e{constructor(t,{t:i}={}){this.o={},this.h={},this.u=i,this.p=(null==t?void 0:t.m)||(t=>t)}on(t,i){(this.o[t]=this.o[t]||[]).push(i),Object.hasOwnProperty.call(this.h,t)&&this.I(t,this.h[t].k,this.h[t].S)}_(t){Object.hasOwnProperty.call(this.o,t)&&delete this.o[t],Object.hasOwnProperty.call(this.h,t)&&delete this.h[t]}I(t,i=null,e=null,s=!1){for(const s of this.o[t]||[])if(Object.hasOwnProperty.call(this.o,t)&&"function"==typeof s)try{s.apply(null,[this.p(i),e])}catch(t){}s&&!Object.hasOwnProperty.call(this.h,t)&&(this.h[t]={k:i,S:e})}}const s="permanent",n="all",o={O:"baidu",M:"clicktale",C:"clicky",j:"cnzz",D:"crazyegg",A:"econda",L:"eulerian",T:"google_analytics",N:"gosquared",R:"heapanalytics",P:"hotjar",B:"mixpanel",V:"mouseflow",U:"piwik",F:"segmentio",G:"sitecatalyst",H:"woopra",W:"ysance"},r="split_url",h="deploy",a="stopped",c="running",d="manual",l="advanced",u="dom_interaction",v="scroll_percentage",g="code_trigger",f="revenue",p="upon_run",w="dom_element",m="callback",I="hover",y="in_view",b="change",x="EU ONLY",k="EEA ONLY",S="Worldwide",_="bucketing",$="conversion";var O,M,C,j;!function(t){t.J="cookieSave",t.K="cookieDecodeError",t.Y="splitTestCookie",t.Z="splitRunError",t.X="userDidGoal",t.tt="trackRequest",t.it="trackRevenueIgnored",t.et="trackRevenueOutlier",t.st="trackRevenueError",t.nt="trackIntegration",t.ot="refreshFailed",t.rt="redirectFailed",t.ht="legacyChangesWithoutjQuery",t.ct="queueError",t.dt="generalError",t.lt="hijackedConfig"}(O||(O={})),function(t){t.ut="cid",t.vt="apr",t.gt="cname",t.ft="cval",t.wt="dl",t.It="dr",t.yt="event",t.bt="eData",t.xt="exp1",t.kt="exp2",t.St="exp3",t._t="exp4",t.$t="exp5",t.Ot="exp6",t.Mt="exp7",t.Ct="exp8",t.jt="exp9",t.Et="exp10",t.Dt="i",t.ERROR="error",t.At="from",t.Lt="g",t.Tt="k1",t.Nt="k2",t.Rt="k3",t.Pt="k4",t.qt="k5",t.Bt="k6",t.Vt="k7",t.Ut="k8",t.Ft="k9",t.Gt="k10",t.zt="msg",t.Ht="n1",t.Wt="n2",t.Jt="n3",t.Kt="n4",t.Qt="n5",t.Yt="oMin",t.Zt="oMax",t.Xt="plgn",t.ti="pid",t.ii="runHash",t.ei="scookie",t.si="sh",t.ni="seg",t.oi="sel",t.ri="s",t.hi="tmsp",t.ai="td",t.ci="ua",t.di="v",t.li="vcookie",t.ui="vData",t.gi="vid"}(M||(M={})),function(t){t.fi="convert.com_variation_not_decided"}(C||(C={})),function(t){t.pi="forceMultipleTransactions"}(j||(j={}));const E=["events","Bc","tp","Ta","gh","oa","md","experiences.variations","features","features.variables"],D={wi:"Bc",mi:"tp",location:"Ta",Ii:"gh",yi:"oa",bi:"experiences.variations",xi:"features"},A="Unable to perform network request",L="Unsupported response type",T="The user agent successfully queued the data for transfer";var N,R,P,q,B,V,U,F,G,z,H,W,J,K,Q,Y;!function(t){t.ki="OFF",t.Si="EU ONLY",t._i="EEA ONLY",t.$i="Worldwide"}(N||(N={})),function(t){t.Oi="audience",t.Mi="location",t.Ci="segment",t.ji="feature",t.Ei="goal",t.Di="experience",t.Ai="variation"}(R||(R={})),function(t){t.Li="enabled",t.DISABLED="disabled"}(P||(P={})),function(t){t.Ti="amount",t.Ni="productsCount",t.Ri="transactionId"}(q||(q={})),function(t){t[t.Pi=0]="TRACE",t[t.qi=1]="DEBUG",t[t.Bi=2]="INFO",t[t.Vi=3]="WARN",t[t.ERROR=4]="ERROR",t[t.Ui=5]="SILENT"}(B||(B={})),function(t){t.Fi="log",t.Pi="trace",t.qi="debug",t.Bi="info",t.Vi="warn",t.ERROR="error"}(V||(V={})),function(t){t.Gi="web",t.zi="fullstack"}(U||(U={})),function(t){t.Hi="convert.com_no_data_found",t.Wi="convert.com_need_more_data"}(F||(F={})),function(t){t.Ji="ready",t.Ki="config.updated",t.Qi="api.queue.released",t.Yi="bucketing",t.Zi="conversion",t.ni="gh",t.Xi="location.activated",t.te="location.deactivated",t.ie="tp",t.ee="datastore.queue.released"}(G||(G={})),function(t){t.se="richStructure",t.ne="customCode",t.oe="defaultCode",t.re="defaultCodeMultipage",t.he="defaultRedirect",t.ae="fullStackFeature"}(z||(z={})),function(t){t.ce="IE",t.de="CH",t.le="FF",t.ue="OP",t.ve="SF",t.ge="EDG",t.fe="MO",t.pe="NS",t.we="OTH"}(H||(H={})),function(t){t.me="ALLPH",t.Ie="IPH",t.ye="OTHPH",t.be="ALLTAB",t.xe="IPAD",t.ke="OTHTAB",t.Se="DESK",t._e="OTHDEV"}(W||(W={})),function(t){t.$e="country",t.Oe="browser",t.Me="devices",t.ri="source",t.Ce="campaign",t.je="visitorType",t.Ee="customSegments"}(J||(J={})),function(t){t.Ce="campaign",t.De="search",t.Ae="referral",t.Le="direct"}(K||(K={})),function(t){t.NEW="new",t.Te="returning"}(Q||(Q={})),function(t){t.Ne="get_additional_data",t.Re="save_referrer",t.Pe="process_locations",t.qe="process_experiences_complete",t.Be="process_experience_disabled",t.Ve="process_experience_enabled",t.Ue="process_variation_disabled",t.Fe="process_variation_enabled",t.Ge="enable_variation",t.ze="process_goals_complete",t.He="enable_preview_mode"}(Y||(Y={}));const Z=15768e4,X=2500,tt="data-convert",it="convert-hide-body",et="convert-css",st=35,nt=["trace","debug","info","warn","error","log"],ot=[{s:"google.",q:"q"},{s:"search.yahoo.",q:"p"},{s:"bing.com/search",q:"q"},{s:"search.about.com",q:"q"},{s:"alexa.com/search",q:"q"},{s:"ask.com",q:"q"},{s:"aol/search",q:"q"},{s:"yandsearch",q:"text"}],rt={We:1,Je:1,Ke:1,Qe:1,Ye:1,Ze:1,Xe:1,ts:1,es:1,ss:1,ns:1,os:1,rs:1,ce:1,hs:1,cs:1,ds:1,ls:1,us:1,vs:1,gs:1,fs:1,ps:1,ws:1,Is:1,ys:1,bs:1,xs:1},ht={ks:1,Ss:1,_s:1},at=new Error("Aborting execution.");var ct,dt,lt,ut,vt,gt,ft,pt,wt;function mt(t){return Array.isArray(t)&&t.length>0}function It(t,i,e,s=!1){try{if("object"==typeof t){const e=i.split(".").reduce(((t,i)=>t[i]),t);if(e||s&&(!1===e||0===e))return e}}catch(t){}return null}function yt(...t){const i=t=>t&&"object"==typeof t;return t.reduce(((t,e)=>(Object.keys(e).forEach((s=>{const n=t[s],o=e[s];Array.isArray(n)&&Array.isArray(o)?t[s]=[...new Set([...o,...n])]:i(n)&&i(o)?t[s]=yt(n,o):t[s]=o})),t)),{})}function bt(t){return"object"==typeof t&&null!==t&&Object.keys(t).length>0}!function(t){t.$s="g",t.Ai="v"}(ct||(ct={})),function(t){t.Os="cookies.saved",t.Ms="experience.activated",t.Cs="experience.variation_decided",t.js="goal.triggered",t.Es="goal.revenue_intercepted",t.Ds="goal.custom_event_intercepted",t.As="snippet.initialized",t.Ls="snippet.segments_evaluated",t.Ts="snippet.experiences_evaluated",t.Ns="snippet.goals_evaluated",t.Xi="location.activated",t.te="location.deactivated",t.Rs="url.changed",t.Ps="render.complete",t.qs="tracking.blocked",t.Bs="signal.detected"}(dt||(dt={})),function(t){t.Vs="convert_render",t.Us="convert_action",t.Fs="convert_log_level",t.Gs="reed_action",t.Di="convert_e",t.Ai="convert_v",t.zs="reed_a",t.Hs="_conv_eignore",t.Ws="_conv_eforce",t.Js="_convertqa",t.Ks="_conv_disable_signals",t.Qs="conveforce",t.Ys="convert_disable",t.Zs="convert_optout",t.Xs="convert_canceloptout",t.tn="noconfirm",t.en="_conv_domtimeout",t.sn="_conv_disable_spa_optimizations",t.nn="_conv_codecheck",t.rn="reedge_codecheck",t.hn="_conv_domain_id",t.an="reedge_domain_id",t.cn="_conv_prevent_tracking",t.dn="gclid",t.ln="utm_source",t.un="utm_medium",t.vn="utm_campaign",t.gn="utm_term",t.fn="convert-token",t.pn="navigation"}(lt||(lt={})),function(t){t.wn="convert_vpreview",t.mn="reed_apreview",t.In="overlay"}(ut||(ut={})),function(t){t.yn="page_type",t.bn="category_id",t.xn="category_name",t.kn="product_sku",t.Sn="product_name",t._n="product_price",t.$n="customer_id",t.On="custom_v1",t.Mn="custom_v2",t.Cn="custom_v3",t.jn="custom_v4"}(vt||(vt={})),function(t){t.En="v0",t.Dn="v1",t.An="v2",t.Ln="v3",t.Tn="v4",t.Nn="v41",t.Rn="v5",t.Pn="cv1",t.qn="cv2",t.Bn="cv3",t.Vn="cv4"}(gt||(gt={})),function(t){t.Un="_conv_",t.Fn="REED_"}(ft||(ft={})),function(t){t.Gn="_conv_v",t.zn="_conv_s",t.Hn="_conv_sptest",t.Ae="_conv_r",t.cn="_conv_prevent_tracking",t.Wn="_conv_check_cookies",t.fn="_conv_t"}(pt||(pt={})),function(t){t.Jn="fs",t.Kn="cs",t.Qn="ps",t.Yn="sc",t.Zn="pv",t.Xn="si",t.si="sh",t.ri="s",t.io="m",t.eo="t",t.so="c",t.ni="seg",t.no="exp",t.gi="vi"}(wt||(wt={}));const xt=(t,i)=>{if(t===i)return!0;if("object"!=typeof t||"object"!=typeof i||null==t||null==i)return!1;const e=Object.keys(t),s=Object.keys(i);if(e.length!=s.length)return!1;for(const n of e){if(!s.includes(n))return!1;if("function"==typeof t[n]||"function"==typeof i[n]){if(t[n].toString()!=i[n].toString())return!1}else if(!xt(t[n],i[n]))return!1}return!0};function kt(t){return t&&t.oo&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var St,_t={exports:{}};var $t,Ot,Mt,Ct=kt((St||(St=1,$t=_t,function(){const t=t=>(new TextEncoder).encode(t);function i(i,e){let s,n,o,r,h,a,c,d;for("string"==typeof i&&(i=t(i)),s=3&i.length,n=i.length-s,o=e,h=3432918353,a=461845907,d=0;d<n;)c=255&i[d]|(255&i[++d])<<8|(255&i[++d])<<16|(255&i[++d])<<24,++d,c=(65535&c)*h+(((c>>>16)*h&65535)<<16)&4294967295,c=c<<15|c>>>17,c=(65535&c)*a+(((c>>>16)*a&65535)<<16)&4294967295,o^=c,o=o<<13|o>>>19,r=5*(65535&o)+((5*(o>>>16)&65535)<<16)&4294967295,o=27492+(65535&r)+((58964+(r>>>16)&65535)<<16);switch(c=0,s){case 3:c^=(255&i[d+2])<<16;case 2:c^=(255&i[d+1])<<8;case 1:c^=255&i[d],c=(65535&c)*h+(((c>>>16)*h&65535)<<16)&4294967295,c=c<<15|c>>>17,c=(65535&c)*a+(((c>>>16)*a&65535)<<16)&4294967295,o^=c}return o^=i.length,o^=o>>>16,o=2246822507*(65535&o)+((2246822507*(o>>>16)&65535)<<16)&4294967295,o^=o>>>13,o=3266489909*(65535&o)+((3266489909*(o>>>16)&65535)<<16)&4294967295,o^=o>>>16,o>>>0}const e=i;e.ro=function(i,e){"string"==typeof i&&(i=t(i));let s,n=i.length,o=e^n,r=0;for(;n>=4;)s=255&i[r]|(255&i[++r])<<8|(255&i[++r])<<16|(255&i[++r])<<24,s=1540483477*(65535&s)+((1540483477*(s>>>16)&65535)<<16),s^=s>>>24,s=1540483477*(65535&s)+((1540483477*(s>>>16)&65535)<<16),o=1540483477*(65535&o)+((1540483477*(o>>>16)&65535)<<16)^s,n-=4,++r;switch(n){case 3:o^=(255&i[r+2])<<16;case 2:o^=(255&i[r+1])<<8;case 1:o^=255&i[r],o=1540483477*(65535&o)+((1540483477*(o>>>16)&65535)<<16)}return o^=o>>>13,o=1540483477*(65535&o)+((1540483477*(o>>>16)&65535)<<16),o^=o>>>15,o>>>0},e.ho=i,$t.exports=e}()),_t.exports));function jt(t){return t.replace(/(?:^\w|[A-Z]|\b\w)/g,(function(t,i){return 0===i?t.toLowerCase():t.toUpperCase()})).replace(/\s+/g,"")}function Et(t,i=9999){return Ct.ho(String(t),i)}function Dt(t){if("number"==typeof t)return Number.isFinite(t);if("string"!=typeof t||!/^-?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)$/.test(t))return!1;const i=parseFloat(t.replace(/,/g,""));return Number.isFinite(i)}function At(t){if("number"==typeof t)return t;const i=String(t).split(",");return parseFloat("0"==i[0]?String(t).replace(/,/g,"."):String(t).replace(/,/g,""))}class Lt{static equals(t,i,e){return Array.isArray(t)?this.ao(-1!==t.indexOf(i),e):bt(t)?this.ao(-1!==Object.keys(t).indexOf(String(i)),e):(t=String(t),i=String(i),t=t.valueOf().toLowerCase(),i=i.valueOf().toLowerCase(),this.ao(t===i,e))}static less(t,i,e){return typeof(t=Dt(t)?At(t):t)==typeof(i=Dt(i)?At(i):i)&&this.ao(t<i,e)}static lessEqual(t,i,e){return typeof(t=Dt(t)?At(t):t)==typeof(i=Dt(i)?At(i):i)&&this.ao(t<=i,e)}static contains(t,i,e){return t=String(t),i=String(i),t=t.valueOf().toLowerCase(),0===(i=i.valueOf().toLowerCase()).replace(/^([\s]*)|([\s]*)$/g,"").length?this.ao(!0,e):this.ao(-1!==t.indexOf(i),e)}static isIn(t,i,e=!1,s="|"){const n=String(t).split(s).map((t=>String(t)));"string"==typeof i&&(i=i.split(s)),Array.isArray(i)||(i=[]),i=i.map((t=>String(t).valueOf().toLowerCase()));for(let t=0;t<n.length;t++)if(-1!==i.indexOf(n[t]))return this.ao(!0,e);return this.ao(!1,e)}static startsWith(t,i,e){return t=String(t).valueOf().toLowerCase(),i=String(i).valueOf().toLowerCase(),this.ao(0===t.indexOf(i),e)}static endsWith(t,i,e){return t=String(t).valueOf().toLowerCase(),i=String(i).valueOf().toLowerCase(),this.ao(-1!==t.indexOf(i,t.length-i.length),e)}static regexMatches(t,i,e){t=String(t).valueOf().toLowerCase(),i=String(i).valueOf();const s=new RegExp(i,"i");return this.ao(s.test(t),e)}static ao(t,i=!1){return i?!t:t}}Ot=Lt,Lt.equalsNumber=Ot.equals,Lt.matches=Ot.equals,function(t){t[t.co=100]="Continue",t[t.do=101]="SwitchingProtocols",t[t.lo=102]="Processing",t[t.uo=103]="EarlyHints",t[t.vo=200]="Ok",t[t.fo=201]="Created",t[t.po=202]="Accepted",t[t.wo=203]="NonAuthoritativeInformation",t[t.mo=204]="NoContent",t[t.Io=205]="ResetContent",t[t.yo=206]="PartialContent",t[t.bo=207]="MultiStatus",t[t.xo=208]="AlreadyReported",t[t.ko=226]="ImUsed",t[t.So=300]="MultipleChoices",t[t._o=301]="MovedPermanently",t[t.$o=302]="Found",t[t.Oo=303]="SeeOther",t[t.Mo=304]="NotModified",t[t.Co=305]="UseProxy",t[t.jo=306]="Unused",t[t.Eo=307]="TemporaryRedirect",t[t.Do=308]="PermanentRedirect",t[t.Ao=400]="BadRequest",t[t.Lo=401]="Unauthorized",t[t.To=402]="PaymentRequired",t[t.No=403]="Forbidden",t[t.Ro=404]="NotFound",t[t.Po=405]="MethodNotAllowed",t[t.qo=406]="NotAcceptable",t[t.Bo=407]="ProxyAuthenticationRequired",t[t.Vo=408]="RequestTimeout",t[t.Uo=409]="Conflict",t[t.Fo=410]="Gone",t[t.Go=411]="LengthRequired",t[t.zo=412]="PreconditionFailed",t[t.Ho=413]="PayloadTooLarge",t[t.Wo=414]="UriTooLong",t[t.Jo=415]="UnsupportedMediaType",t[t.Ko=416]="RangeNotSatisfiable",t[t.Qo=417]="ExpectationFailed",t[t.Yo=418]="ImATeapot",t[t.Zo=421]="MisdirectedRequest",t[t.Xo=422]="UnprocessableEntity",t[t.tr=423]="Locked",t[t.ir=424]="FailedDependency",t[t.er=425]="TooEarly",t[t.sr=426]="UpgradeRequired",t[t.nr=428]="PreconditionRequired",t[t.rr=429]="TooManyRequests",t[t.hr=431]="RequestHeaderFieldsTooLarge",t[t.ar=451]="UnavailableForLegalReasons",t[t.cr=500]="InternalServerError",t[t.dr=501]="NotImplemented",t[t.lr=502]="BadGateway",t[t.ur=503]="ServiceUnavailable",t[t.vr=504]="GatewayTimeout",t[t.gr=505]="HttpVersionNotSupported",t[t.pr=506]="VariantAlsoNegotiates",t[t.wr=507]="InsufficientStorage",t[t.mr=508]="LoopDetected",t[t.Ir=510]="NotExtended",t[t.yr=511]="NetworkAuthenticationRequired"}(Mt||(Mt={}));const Tt=t=>!["GET","HEAD","DELETE","TRACE","OPTIONS"].includes(t.toUpperCase()),Nt=(t,i,e)=>{let s="";return bt(t)&&!Tt(i)&&(s="old-nodejs"!==e.runtime?Object.keys(t).map((i=>`${encodeURIComponent(i)}=${encodeURIComponent(t[i])}`)).join("&"):e.br.stringify(t)),s?`?${s}`:s},Rt={request(t){var e;const s=(null===(e=null==t?void 0:t.method)||void 0===e?void 0:e.toUpperCase())||"GET",n=(null==t?void 0:t.path)?t.path.startsWith("/")?t.path:`/${t.path}`:"",o=t.kr.endsWith("/")?t.kr.slice(0,-1):t.kr,r=(null==t?void 0:t.responseType)||"json",h=(()=>{if("undefined"!=typeof window)return{runtime:"browser"};if("function"==typeof fetch)return{runtime:"server-with-fetch"};try{const t=require("url"),i=require("http");return{runtime:"old-nodejs",url:t,Sr:i,_r:require("https"),br:require("querystring")}}catch(t){}return{runtime:"unknown"}})();return new Promise(((e,a)=>{if("browser"===h.runtime||"server-with-fetch"===h.runtime){const c={method:s,keepalive:!0};(null==t?void 0:t.headers)&&(c.headers=t.headers),(null==t?void 0:t.data)&&Tt(s)&&(c.body=JSON.stringify(t.data));const d=`${o}${n}${Nt(null==t?void 0:t.data,s,h)}`;"post"===s.toLowerCase()&&"undefined"!=typeof navigator&&(null===navigator||void 0===navigator?void 0:navigator.sendBeacon)?navigator.sendBeacon(d,c.body)?e({data:!0,status:Mt.vo,statusText:T}):a({message:L}):fetch(d,c).then((t=>i(this,void 0,void 0,(function*(){if(t.status===Mt.vo){const i={status:t.status,statusText:t.statusText,headers:t.headers,data:null};switch(r){case"json":i.data=yield t.json();break;case"arraybuffer":i.data=yield t.arrayBuffer();break;case"text":i.data=t;break;default:return void a({message:L})}e(i)}else a({message:t.statusText,status:t.status})})))).catch((t=>{a({message:null==t?void 0:t.message,status:null==t?void 0:t.status,statusText:null==t?void 0:t.statusText})}))}else if("old-nodejs"===h.runtime){const i=h.url.parse(o);i.port||(i.port="https:"===i.protocol?"443":"80");const c=i.path.endsWith("/")?i.path.slice(0,-1):i.path,d="https:"===i.protocol?h._r:h.Sr,l=[],u={hostname:i.hostname,path:`${c}${n}${Nt(null==t?void 0:t.data,s,h)}`,port:i.port,method:s},v=(null==t?void 0:t.data)&&Tt(s)?JSON.stringify(t.data):null;(null==t?void 0:t.headers)&&(u.headers=t.headers),v&&(u.headers||(u.headers={}),u.headers["$r"]=Buffer.byteLength(v));const g=d.request(u,(t=>{t.on("data",(t=>l.push(t))),t.on("end",(()=>{if(t.statusCode===Mt.vo){const i=Buffer.concat(l),s=i.toString(),n={status:t.statusCode,statusText:t.statusMessage,headers:t.headers,data:null};switch(r){case"json":n.data=s?JSON.parse(s):"";break;case"arraybuffer":n.data=null==i?void 0:i.buffer;break;case"text":n.data=t;break;default:return void a({message:L})}e(n)}else a({message:t.statusMessage,status:t.statusCode})}))}));g.on("error",(t=>{const i=t;a({message:null==i?void 0:i.message,status:null==i?void 0:i.code,statusText:null==i?void 0:i.statusText})})),v&&g.write(v),g.end()}else a({message:A})}))}};var Pt,qt,Bt,Vt,Ut,Ft;!function(t){t.zt="message",t.Or="load",t.Mr="beforeunload",t.Cr="popstate"}(Pt||(Pt={})),function(t){t.LOADING="loading",t.jr="interactive",t.Er="complete"}(qt||(qt={})),function(t){t.HIDDEN="hidden",t.Dr="visible"}(Bt||(Bt={})),function(t){t.Ar="visibilitychange",t.Lr="readystatechange",t.Tr="DOMContentLoaded",t.Nr="scroll"}(Vt||(Vt={})),function(t){t.CLICK="click",t.Rr="mouseover",t.Pr="mouseout",t.qr="mousemove",t.Br="mouseenter",t.Vr="mouseleave"}(Ut||(Ut={})),function(t){t.Ur="submit"}(Ft||(Ft={}));const Gt=(t,i,e=!1)=>{var s,n;if("regexMatches"===(null===(s=null==i?void 0:i.Fr)||void 0===s?void 0:s.Gr)){const i=new URL(t);return e||(i.search=""),i.toString()}const o=String(null!==(n=null==i?void 0:i.value)&&void 0!==n?n:""),r=new URL(t);if(!(t=>{if(t.startsWith("http"))return!1;try{return new RegExp(t,"i"),!0}catch(t){return!1}})(o)&&o)try{const t=new URL(o,r.origin),i=t.pathname.endsWith("/");if(i&&!r.pathname.endsWith("/")?r.pathname=`${r.pathname}/`:!i&&r.pathname.length>1&&r.pathname.endsWith("/")&&(r.pathname=r.pathname.slice(0,-1)),e){const i=t.pathname.endsWith("/")&&""!==t.search,e=!t.pathname.endsWith("/")&&""!==t.search;i&&!r.pathname.endsWith("/")?r.pathname+="/":e&&r.pathname.endsWith("/")&&(r.pathname=r.pathname.slice(0,-1))}else r.search=""}catch(t){e||(r.search="")}else e||(r.search="");return r.toString()},zt=(t,i=new WeakMap)=>{if("object"!=typeof t||null===t)return"function"==typeof t?t.toString():t;if(i.has(t))return i.get(t);if(Array.isArray(t)){const e=t.map((t=>zt(t,i)));return i.set(t,e),e}if(bt(t)){const e={};i.set(t,e);for(const s of Object.keys(t))Object.defineProperty(e,s,{get:()=>zt(t[s],i),set:i=>t[s]="function"==typeof t?i.toString():i,enumerable:!0,configurable:!0});try{return JSON.parse(JSON.stringify(e))}catch({message:t,stack:i}){}}return t},Ht=(t,i=!1)=>{if("undefined"==typeof convertMap)return t;if(i){for(const i in convertMap)if(convertMap[i]===t)return i;return t}return convertMap[t]||t},Wt=(t,i=!1,e=new WeakMap)=>{if("undefined"==typeof convertMap)return t;if("object"!=typeof t||null===t)return t;if(e.has(t))return e.get(t);if(Array.isArray(t)){const s=t.map((t=>Wt(t,i,e)));return e.set(t,s),s}if(bt(t)){const s={};e.set(t,s);for(const n of Object.keys(t)){const o=Ht(n,i);Object.defineProperty(s,o,{get:()=>Wt(t[n],i,e),set:i=>t[n]=i,enumerable:!0,configurable:!0})}return s}return t},Jt=(t,i)=>{if(t){for(const i in t)delete t[i],delete t[Ht(i)];for(const e in i)t[Ht(e)]=Wt(i[e])}else"undefined"!=typeof console&&console.error&&console.error("Object in scope must have a predefined value!")},Kt=t=>"object"==typeof t&&null!==t?Array.isArray(t)?t.map((t=>Kt(t))):bt(t)?Object.keys(t).reduce(((i,e)=>(i[e]=Kt(t[e]),i)),{}):Object.assign(Object.create(Object.getPrototypeOf(t)),t):t,Qt=(t,i)=>t.reduce(((t,e,s)=>{let n;return n=bt(e)?e[i]||s:e,t[n]=e||"",t}),{}),Yt=t=>t.filter(((i,e)=>t.findIndex((t=>xt(t,i)))===e)),Zt=t=>{if("boolean"==typeof t)return t;switch(String(t).toLowerCase()){case"true":case"1":return!0}return!1};function Xt(t,i=500){let e,s;return(...n)=>{const o=Date.now();e&&o<e+i?(s&&clearTimeout(s),s=setTimeout((()=>{e=Date.now(),t.apply(this,Array.prototype.slice.apply(n))}),i-(o-e))):(e=o,t.apply(this,Array.prototype.slice.apply(n)))}}function ti(t,i=100,e=!1){let s;return(...n)=>{const o=e&&!s;clearTimeout(s),s=setTimeout((()=>{s=null,e||t.apply(this,Array.prototype.slice.apply(n))}),i),o&&t.apply(this,Array.prototype.slice.apply(n))}}const ii=(t,i)=>{const e=`www.${t}`,s=new RegExp(`^${i.replace(/\./g,"\\.").replace(/\?/g,"\\?").split("*").join(".*?")}$`);return s.test(e)||s.test(t)},ei=t=>JSON.stringify(t).replace(/,/g,"-").replace(/:/g,".").replace(/"/g,""),si=t=>{if("string"!=typeof t)return{};try{return JSON.parse(t.replace(/-/g,",").replace(/\./g,":").replace(/([A-Za-z0-9]+):/g,'"$1":'))}catch({stack:i,message:e}){return"undefined"!=typeof console&&console.error&&(console.error("Convert:",i||e),console.error("Convert:",t.replace(/-/g,",").replace(/\./g,":").replace(/([A-Za-z0-9]+):/g,'"$1":'))),{}}},ni=t=>{if(!t)return t;try{return decodeURIComponent(t.replace(/%(?![0-9a-fA-F]{2})/g,"%25"))}catch(i){return decodeURIComponent(t.replace(/%[0-9a-fA-F]{2}/g,"%20"))}},oi=({url:t,attributes:i={}})=>new Promise(((e,s)=>{const n=document.createElement("script");n.src=t;for(const t in i)n.setAttribute(t,i[t]);n.onload=()=>e(),n.onerror=t=>s(t);const o=document.getElementsByTagName("script")[0];o?o.parentNode.insertBefore(n,o):"undefined"!=typeof console&&console.warn&&console.warn("Unable to find any script element in this document!")})),ri=t=>"function"==typeof t[Symbol.iterator],hi=t=>ri(t)&&"[object Arguments]"===Object.prototype.toString.call(t),ai=(t,i)=>{document.readyState!==qt.LOADING?setTimeout((()=>t()),1):document.addEventListener(Vt.Tr,(()=>t()),{signal:i})},ci=(t,{scope:i=window,zr:e=20,interval:s=300}={})=>{let n=0;const o=r=>{const h="function"==typeof t?t():null==i?void 0:i[t];h?r(h):n<e?(n++,setTimeout((()=>o(r)),s)):r()};return new Promise((t=>o(t)))};var di;!function(t){t.Hr="enabled_experiences",t.Wr="disabled_experiences",t.Jr="enabled_variations",t.Kr="disabled_variations",t.Qr="conv_split_referrer",t.Yr="conv_split_variation",t.Zr="conv_traffic_allocation",t.Xr="conv_qa_setting",t.th="convert_config"}(di||(di={}));class li{constructor(t,i){var e,s;this.ih=i,this.href=t||document.location.href,i||(this.href=this.href.toLowerCase()),this.object=this.parse(t),this.query=this.getQuery(null===(e=this.object)||void 0===e?void 0:e.query),this.hash=this.eh(null===(s=this.object)||void 0===s?void 0:s.hash)}sh(){return`${this.object.protocol}//${this.object.host}${this.object.pathname}`}parse(t){if(t){const i=t.startsWith("http")?t:`${location.protocol}//${location.host}${t.startsWith("/")?t:`/${t}`}`,e=new URL(this.ih?i:i.toLowerCase());return{hash:e.hash.slice(1),host:e.host,hostname:e.hostname,pathname:e.pathname,protocol:e.protocol,query:e.search.slice(1)}}return{hash:document.location.hash.slice(1),host:document.location.host,hostname:document.location.hostname,pathname:document.location.pathname,protocol:document.location.protocol,query:document.location.search.slice(1)}}create(t=[]){let i=this.sh();const e=Object.keys(this.query).filter((i=>!t.includes(i)));e.length&&(i+=`?${e.map((t=>`${t}=${this.query[t]}`)).join("&")}`);const s=Object.keys(this.hash).filter((i=>!t.includes(i)));return s.length&&(i+=`#${s.map((t=>{const i=this.hash[t];return`${t}${i?`=${i}`:""}`})).join("&")}`),i}getQuery(t){var i;if(this.query&&!t)return this.query;t||(t=null===(i=this.object)||void 0===i?void 0:i.query);const e={},s=(null==t?void 0:t.split("&"))||[];let n,o,r;for(o=0,r=s.length;o<r;o++){if(!s[o].trim())continue;n=s[o].split("=");const t=n.shift(),i=n.join("=");if(t.trim())try{e[t]=ni(i).replace(/\+/g," ")}catch(s){e[t]=String(i).replace(/\+/g," ")}}return this.query=e,e}eh(t){var i;if(this.hash&&!t)return this.hash;if(!t)return{};const e={},s=(t||(null===(i=this.object)||void 0===i?void 0:i.hash)||"").split("&");let n,o,r;for(o=0,r=s.length;o<r;o++)if(n=s[o].split("="),n[0].trim())try{e[n[0]]=n[1]?ni(n[1]).replace(/\+/g," "):""}catch(t){e[n[0]]=n[1]?String(n[1]).replace(/\+/g," "):""}return this.hash=e,e}}const ui="https://logs.convertexperiments.com/v1/log",vi=[lt.Js,lt.Us,lt.Gs,lt.Di,lt.Ai,lt.zs,lt.Hs,lt.Ws,lt.Qs,lt.Ys,lt.Fs,lt.Vs,lt.sn,lt.Zs,lt.Xs,lt.en,lt.nn,lt.rn,lt.hn],gi={[gt.En]:[`${ft.Fn}${vt.yn}`,`${ft.Un}${vt.yn}`],[gt.Dn]:[`${ft.Fn}${vt.bn}`,`${ft.Un}${vt.bn}`],[gt.An]:[`${ft.Fn}${vt.xn}`,`${ft.Un}${vt.xn}`],[gt.Ln]:[`${ft.Fn}${vt.kn}`,`${ft.Un}${vt.kn}`],[gt.Tn]:[`${ft.Fn}${vt.Sn}`,`${ft.Un}${vt.Sn}`],[gt.Nn]:[`${ft.Fn}${vt._n}`,`${ft.Un}${vt._n}`],[gt.Rn]:[`${ft.Fn}${vt.$n}`,`${ft.Un}${vt.$n}`],[gt.Pn]:[`${ft.Fn}${vt.On}`,`${ft.Un}${vt.On}`],[gt.qn]:[`${ft.Fn}${vt.Mn}`,`${ft.Un}${vt.Mn}`],[gt.Bn]:[`${ft.Fn}${vt.Cn}`,`${ft.Un}${vt.Cn}`],[gt.Vn]:[`${ft.Fn}${vt.jn}`,`${ft.Un}${vt.jn}`]};class fi{constructor({config:t,data:i,state:e,nh:s,request:n,remote:o,oh:r,rh:h,t:a,hh:c,ah:d,dh:l,uh:u,gh:v,visitor:g}){this.name="Experiences",this.fh=t,this.ph=i,this.wh=e,this.mh=n,this.Ih=o,this.yh=r,this.u=a,this.bh=s,this.xh=h,this.kh=c,this.Sh=d,this._h=l,this.$h=u,this.Oh=v,this.Mh=g,this.Ch=[],this.jh=!1,this.Eh=[],this.Dh={},this.Ah={},this.wh.Lh={},this.Th=2400,this.Nh=!1,this.xh.on(F.Hi,(t=>{const{experienceId:i}=Wt(t);this.Ch.push(i)})),this.xh.on(F.Wi,(t=>{const{experienceId:i}=Wt(t);this.Eh.push(i)})),this.xh.on(Y.Ge,((...t)=>this.Rh(Wt(t,!0)))),this.yh.Ph=this.yh.qh=(...t)=>{const[i]=t;if(bt(i))this.qh(i);else{const[i,e]=t;this.qh({experienceId:i,Bh:e})}},this.yh.Vh=(...t)=>{const[i]=t;if(bt(i))this.Uh(Object.assign(Object.assign({},i),{force:!0}));else{const[i,e]=t;this.Uh({experienceId:i,Bh:e,force:!0})}},this.yh.Fh=(...t)=>{const[i]=t;if(bt(i))this.Gh(i);else{const[i,e]=t;this.Gh({zh:e,Hh:i})}},this.yh.Wh=this.yh.Jh=(...t)=>{const[i]=t;if(bt(i))this.Gh(i);else{const[i,e]=t;this.Gh({zh:e,Hh:i})}},this.yh.Kh=()=>{this.Nh=!0},this.yh.Qh=(...t)=>{const[i]=t;if(bt(i))this.Qh(i);else{const[i]=t;this.Qh({experienceId:i})}},this.yh.Yh=(...t)=>{const[i]=t;if(bt(i))this.Yh(i);else{const[i]=t;this.Yh({experienceId:i})}},this.yh.Zh=(...t)=>{const[i]=t;if(bt(i))this.Zh(i);else{const[i,e]=t;this.Zh({experienceId:i,Bh:e})}},this.yh.Rh=(...t)=>{const[i]=t;if(bt(i))this.Rh(i);else{const[i,e]=t;this.Rh({experienceId:i,Bh:e})}},this.yh.Xh=this.yh.ta=(...t)=>{const[i]=t;if(bt(i))this.ia(Object.assign(Object.assign({},i),{ea:!0}));else{const[i,e,s,n]=t;this.ia({experienceId:i,zh:s,Hh:e,logLevel:n,ea:!0})}},this.yh.sa=this.yh.sa=(...t)=>{const[i]=t;if(bt(i))this.na(i);else{const[i,e,s]=t;this.na({experienceId:i,zh:s,Hh:e})}},window.convert[Ht("executeExperiment",!0)]=window.convert[Ht("executeExperience",!0)]=this.yh.ta,window.convert[Ht("executeExperimentLooped",!0)]=window.convert[Ht("executeExperienceLooped",!0)]=this.yh.sa}process({oa:t,Hh:i=!0}){var e,s,n,o;if(this.Nh)return void this.xh.I(Y.qe,{zh:this.Mh.id,ra:!0,Hh:i});const h=(null===(n=null===(s=null===(e=this.mh.url.query)||void 0===e?void 0:e[lt.Hs])||void 0===s?void 0:s.split)||void 0===n?void 0:n.call(s,","))||[],a=Boolean(h.length&&"all"===h[0].toLowerCase());for(const{id:i,type:e,version:s}of t)h.includes(i)||a||(Number(s)<6||e===r)&&this.wh.Lh[i]||(this.ha({experienceId:i,zh:this.Mh.id}),(null===(o=this.wh)||void 0===o?void 0:o.aa)&&this.aa());this.Ch.length&&this.xh.I(Y.Ne,{zh:this.Mh.id,Hh:i})}ca(){var t,i,e,s;this.wh.Lh=this.Mh.cookies.getData(pt.Hn)||{},bt(this.wh.Lh)||(this.wh.Lh=this.bh.get(di.Yr)||{});let n=!1;if(bt(this.wh.Lh)||(this.wh.Lh=this.Mh.da()||{},n=!!Object.keys(this.wh.Lh).length),bt(this.wh.Lh)){for(const o in this.wh.Lh){String((null===(t=this.fh.oa[o])||void 0===t?void 0:t.type)||"Split URL").toUpperCase();const r=new li(this.mh.url.href).create(vi);let h;if("object"==typeof this.wh.Lh[o]){const{value:t,time:i=0,la:e}=this.wh.Lh[o]||{};if(i>=Date.now()&&(h=String(t)),e===Et(r)){delete this.wh.Lh[o];continue}}else{const t=String(this.wh.Lh[o]);if(t.includes("+")){const[i,e]=t.split("+");if(Dt(e)&&Number(e)===Et(r)){delete this.wh.Lh[o];continue}h=i}else h=t}h?h.includes("preview")?this.wh.ua=!0:((null===(s=null===(e=null===(i=this.ph)||void 0===i?void 0:i.va)||void 0===e?void 0:e.oa)||void 0===s?void 0:s.fa)===o&&this.Ih.log({[M.di]:h},{cookies:this.Mh.cookies,request:this.mh,from:O.Y,visitor:this.Mh}),this.pa({experienceId:o,Bh:h,wa:n}),this.Mh.ma({experienceId:o,Bh:h})):delete this.wh.Lh[o]}this.Mh.cookies.deleteData(pt.Hn),this.bh.delete(di.Yr),this.Mh.Ia()}return this.wh.Lh}aa({force:t}={}){if(t||this.Mh.cookies.enabled){for(const t in this.Ah)if(this.Ah[t])try{clearTimeout(this.Ah[t]),this.Ah[t]=null}catch({message:t}){}throw this.xh.I(Y.Re,{}),at}}ya({zh:t,Hh:i=!0}){var e;if(!this.jh&&this.Ch.length){this.jh=!0;for(let i=0,s=this.Ch.length;i<s;i++)this.ha({experienceId:this.Ch[i],zh:t}),(null===(e=this.wh)||void 0===e?void 0:e.aa)&&this.aa();this.xh.I(Y.Pe,{Hh:i}),this.Ch=[],this.xh.I(Y.qe,{zh:t,Hh:i})}}ba({experienceId:t,Bh:i,xa:e}){const s={[M.bt]:Object.assign({[M.Tt]:"viewExp",[M.Nt]:[t],[M.Rt]:[i]},isNaN(e)?{}:{[M.Ht]:e})};this.Ih.log(s,{cookies:this.Mh.cookies,request:this.mh,from:O.tt,visitor:this.Mh})}pa({experienceId:t,Bh:i,wa:e}){var s,n,o;if((null===(s=this.wh)||void 0===s?void 0:s.ua)||!e&&(null===(n=this.Mh.oa)||void 0===n?void 0:n[t]))return;this.Sh.ka(this.Mh.id,{Sa:{[t]:String(i)}});const r={experienceId:String(t),Bh:String(i)},h={_a:_,data:r};this.Ih.track(h,{visitor:this.Mh});const a=this.bh.get(di.Zr)||{},c=Number(null===(o=a[this.Mh.id])||void 0===o?void 0:o[t]);this.ba({experienceId:t,Bh:i,xa:c}),this.$a()}Qh({experienceId:t}){const i=Array.isArray(t)?t:[t];if(!i.length)return;const e=Object.fromEntries(i.map((t=>[t,1])));for(const t of i)this.Mh.Oa[t]&&delete this.Mh.Oa[t],this.Mh.Ma[t]&&delete this.Mh.Ma[t],this.Mh.Ca({experienceId:t});bt(this.Mh.Oa)?this.bh.set(di.Hr,this.Mh.Oa):this.bh.delete(di.Hr),bt(this.Mh.Ma)?this.bh.set(di.Jr,this.Mh.Ma):this.bh.delete(di.Jr),this.Mh.ja=yt(this.Mh.ja,e),this.bh.set(di.Wr,this.Mh.ja),this.Mh.cookies.save(),this.Mh.process(),this.xh.I(Y.Be,{oa:i})}Yh({experienceId:t}){const i=Array.isArray(t)?t:[t];if(i.length){for(const t of i)this.Mh.ja[t]&&delete this.Mh.ja[t],this.Mh.Ea[t]&&delete this.Mh.Ea[t];bt(this.Mh.ja)?this.bh.set(di.Wr,this.Mh.ja):this.bh.delete(di.Wr),bt(this.Mh.Ea)?this.bh.set(di.Kr,this.Mh.Ea):this.bh.delete(di.Kr),this.Mh.Oa=yt(this.Mh.Oa,Object.fromEntries(i.map((t=>[t,1])))),this.bh.set(di.Hr,this.Mh.Oa),this.xh.I(Y.Ve,{oa:i});for(const t of i)this.ia({experienceId:t})}}Zh({experienceId:t,Bh:i}){t&&i&&(this.Mh.Ma[t]&&delete this.Mh.Ma[t],bt(this.Mh.Ma[t])||delete this.Mh.Ma[t],this.Mh.Da({experienceId:t,Bh:i}),bt(this.Mh.Ma)?this.bh.set(di.Jr,this.Mh.Ma):this.bh.delete(di.Jr),this.Mh.Ea[t]=i,this.bh.set(di.Kr,this.Mh.Ea),this.Mh.cookies.save(),this.Mh.process(),this.xh.I(Y.Ue,{experienceId:t,Bh:i}))}Rh({experienceId:t,Bh:i,Aa:e=!0}){if(t&&i&&(this.Mh.ja[t]&&delete this.Mh.ja[t],this.Mh.Ea[t]&&delete this.Mh.Ea[t],bt(this.Mh.ja)?this.bh.set(di.Wr,this.Mh.ja):this.bh.delete(di.Wr),bt(this.Mh.Ea)?this.bh.set(di.Kr,this.Mh.Ea):this.bh.delete(di.Kr),this.Mh.Ma[t]=i,this.bh.set(di.Jr,this.Mh.Ma),this.xh.I(Y.Fe,{experienceId:t,Bh:i}),e)){const e=this.La({experienceId:t});if(e)if("boolean"==typeof e)this.qh({experienceId:t,Bh:i});else if(Array.isArray(e))for(const t of e)this.xh.I(Y.Pe,{locationId:t})}}La({experienceId:t}){var i,e,s,n,o;let r=!1;const h=[];for(const a of this.fh.oa[t].Ta)(null===(i=this.fh.Ta[a])||void 0===i?void 0:i.Na)&&(null===(s=null===(e=this.fh.Ta[a])||void 0===e?void 0:e.Na)||void 0===s?void 0:s.type)!==p?(null===(o=null===(n=this.fh.Ta[a])||void 0===n?void 0:n.Na)||void 0===o?void 0:o.type)===m&&h.push(a):r=!0;return r||!!h.length&&h}$a(){if(Object.values(this.Mh.data.oa).filter((({Ra:t})=>t)).length===Object.keys(this.Mh.oa).length){const t={_a:"testVisitor"};this.Ih.track(t,{visitor:this.Mh}),this.Ih.log({[M.bt]:{[M.Tt]:"tv"}},{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.tt})}}ha({experienceId:t,zh:i,logLevel:e}){var s,n,o,a,c,d,l,u,v;if(!this.fh.oa[t])return;if(this.wh.Pa&&(this.Mh.ja[t]||this.Mh.Ea[t]||!(null===(s=this.wh.qa)||void 0===s?void 0:s[t])))return;if("1"===(null===(n=this.Mh.oa[t])||void 0===n?void 0:n[ct.Ai]))return;if(this.Mh.ja[t])return;const g=this.kh.getData({gh:this.Oh,visitor:this.Mh,experienceId:t});let f;if(this.wh.qa[t]&&(null===(o=this.wh)||void 0===o?void 0:o.Ba))f=this.wh.qa[t];else if(!this.wh.qa[t]&&this.wh.Pa);else if(this.wh.Va[t])f=this.wh.Va[t],this.pa({experienceId:t,Bh:f});else{const i=this.$h.Ua({experienceId:t}),e=!(this.fh.oa[t].type===h||this.fh.oa[t].type===r||i),s=this._h.Fa(this.Mh.id,t,{Ga:g,za:!1,Ha:this.wh.Wa[t],Ja:e,Ka:!0,Qa:null===(a=this.ph)||void 0===a?void 0:a.Qa});if(s){if(Object.values(F).includes(s))return s===F.Wi?this.Ch.push(t):s===F.Hi&&this.Eh.push(t),!1;if(Object.values(C).includes(s))s===C.fi?this.fh.oa[t].status:f=1;else{const n=s;if(n){f=n.id,i&&!i.includes(f)&&this.pa({experienceId:t,Bh:f});const s=this.bh.get(di.Zr)||{};s[this.Mh.id]||(s[this.Mh.id]={}),!s[this.Mh.id][t]&&(null==n?void 0:n.xa)&&(s[this.Mh.id][t]=n.xa,this.bh.set(di.Zr,s)),e&&!(null===(c=this.Mh.oa)||void 0===c?void 0:c[t])&&(this.ba({experienceId:t,Bh:f,xa:null==n?void 0:n.xa}),this.$a())}}}}if(f){if(this.Ah[t])try{clearTimeout(this.Ah[t]),this.Ah[t]=null}catch({message:t}){}try{const i=this.fh.oa[t].name,e=1!==Number(f)&&f.toString(),s=null===(d=this.fh.oa[t].Za[f])||void 0===d?void 0:d.name;this.xh.I(dt.Cs,{data:{experienceId:String(t),Xa:String(t),Bh:e,tc:e,ec:i,sc:i,nc:s,variation_name:s}})}catch({message:t}){}if(1!==Number(f)){(null===(l=this.fh.oa[t])||void 0===l?void 0:l.oc)&&this.$h.rc({code:this.fh.oa[t].oc}),(null===(u=this.fh.oa[t])||void 0===u?void 0:u.hc)&&this.$h.ac({cc:this.fh.oa[t].hc});const e=Number(null===(v=this.fh.oa[t])||void 0===v?void 0:v.version),s=this.Aa({experienceId:t,dc:e,Bh:f,zh:i});return s||this.wh.aa?this.aa({force:s}):this.Mh.ma({experienceId:t,Bh:f}),!0}this.Mh.lc({experienceId:t}),this.Mh.cookies.save(),i&&this.Mh.id}return!1}Aa({experienceId:t,dc:i,Bh:e,zh:s}){var n,o,h;if(!this.wh.Pa||!this.Mh.ja[t]&&!this.Mh.Ea[t]&&(null===(n=this.wh.qa)||void 0===n?void 0:n[t])){if((null===(o=this.fh.oa[t])||void 0===o?void 0:o.type)===r){if(!this.wh.Lh[t])if(String(null===(h=this.fh.oa[t].uc)||void 0===h?void 0:h.id)!==String(e))try{return this.$h.vc({experienceId:t,Bh:e,dc:i}),!0}catch({message:i}){this.Ih.log({[M.zt]:`${i} e: ${t} v: ${e}`},{cookies:this.Mh.cookies,request:this.mh,from:O.Z,visitor:this.Mh})}else try{return this.$h.vc({experienceId:t,Bh:e,dc:i,gc:!0,fc:!this.Mh.cookies.enabled}),!1}catch({message:t}){}}else this.$h.vc({experienceId:t,Bh:e,dc:i});return this.wh.aa}}Uh({experienceId:t,Bh:i,force:e}){var s,n;this.wh.isDisabled||(e?((null===(s=this.wh)||void 0===s?void 0:s.Va)||(this.wh.Va={}),this.wh.Va[t]=i):((null===(n=this.wh)||void 0===n?void 0:n.qa)||(this.wh.qa={}),this.wh.qa[t]=i))}Gh({zh:t,Hh:i=!0}){var e;if(this.wh.isDisabled)return;const s=[];for(let t=0,i=this.Eh.length;t<i;t++)s.push(this.Eh[t]);this.Eh=[];for(let i=0,n=s.length;i<n;i++)this.ha({experienceId:s[i],zh:t}),(null===(e=this.wh)||void 0===e?void 0:e.aa)&&this.aa();this.xh.I(Y.qe,{zh:t,Hh:i})}ia({experienceId:t,zh:i,Hh:e=!0,logLevel:s,ea:n=!1}){var o;this.wh.isDisabled||this.wh.Pa&&!(null===(o=this.wh.qa)||void 0===o?void 0:o[t])||t&&this.fh.oa[t]&&this.xh.I(Y.Pe,{experienceId:t,Hh:e,wc:n})}na({locationId:t,experienceId:i,zh:e,Hh:s=!0}={}){if(this.wh.isDisabled)return;if(!i&&!t)return;if(i){let t=!1;for(const e in this.fh.oa[i].Za){const{status:s}=this.fh.oa[i].Za[e];if(t=Boolean(!s||s===c),t)break}if(!t)return}const n=i?`exp-${i}`:`loc-${t}`;if(this.Dh[n]||(this.Dh[n]=0),this.Ah[n])try{clearTimeout(this.Ah[n]),this.Ah[n]=null}catch({message:t}){}if(this.Dh[n]<this.Th){this.Dh[n]++;const o=Boolean(this.Dh[n]%40==1);this.Ah[n]=setTimeout((()=>{var n;i?this.ia({experienceId:i,zh:e,Hh:s,logLevel:o?B.Ui:(null===(n=this.ph)||void 0===n?void 0:n.logLevel)||B.ERROR}):this.xh.I(Y.Pe,{locationId:t,Hh:s})}),50)}else this.Dh[n]=0}qh({experienceId:t,Bh:i}){var e,s,n,o;if(this.wh.isDisabled)return;if(this.wh.Pa&&!(null===(e=this.wh.qa)||void 0===e?void 0:e[t]))return;if(!(t&&i&&this.fh.oa[t]&&(null===(n=null===(s=this.fh.oa[t])||void 0===s?void 0:s.Za)||void 0===n?void 0:n[i])))return;this.wh.ua=!0;const r=Number(null===(o=this.fh.oa[t])||void 0===o?void 0:o.version),h=this.Aa({experienceId:t,dc:r,Bh:i});this.wh.aa?this.aa({force:h}):this.Mh.ma({experienceId:t,Bh:i}),this.$h.start()}}const pi=[wt.Yn,wt.Zn];class wi{constructor({data:t,request:i,state:e,domain:s,mc:n,path:o,Ic:r,enabled:h,rh:a,t:c,remote:d,oh:l}){this.name="Cookies",this.data=t||{},this.enabled=h,this.mh=i,this.wh=e,this.yc=s||"",this.bc=n||Z,this.xc=o||"/",this.kc=r||false,this.xh=a,this.u=c,this.Ih=d,this.yh=l,t||this.load(),this.yh.Sc=t=>this._c(t),window.convert[Ht("getCookie",!0)]=t=>this.get(t),window.convert[Ht("setCookie",!0)]=(t,i,e)=>this.set(t,i,e)}$c(){return this.yc}Oc(t){this.yc=t}Mc(){return this.bc}Cc(t){this.bc=t}jc(){return this.xc}Ec(t){this.xc=t}Dc(){return this.kc}_c(t){this.wh.isDisabled||(this.kc=t)}get(t){if(this.wh.isDisabled)return;const i=new URLSearchParams(String(document.cookie).replace(/; */g,"&")),e=Object.fromEntries(i.entries());if(e[t])try{return ni(e[t])}catch({message:i}){const s={[M.gt]:t,[M.ft]:e[t],[M.ERROR]:i},n=O.K;this.Ih.log(s,{cookies:this,from:n})}return null}set(t,i,e){if(this.wh.isDisabled)return;const s=new Date,n=new Date;n.setTime(s.getTime()+1e3*(e||this.bc));const o=this.xc?`;path=${this.xc}`:"",r=this.yc?`;domain=${this.yc}`:"",h=this.kc?`;secure=${this.kc}`:"";document.cookie=`${t}=${encodeURIComponent(i)};expires=${n.toUTCString()}${o}${r};SameSite=lax${h}`}delete(t){this.wh.isDisabled||this.set(t,"deleted",-1)}getData(t,i){return!!this.data[t]&&(i?this.data[t][i]:this.data[t])}setData(t,i,e){e?(this.data[t]||(this.data[t]={}),this.data[t][e]=i):this.data[t]=i}save(){this.saveData(pt.Hn,15),this.enabled&&(this.saveData(pt.Gn,15768e3),this.saveData(pt.zn,1200),this.saveData(pt.Ae,15552e3),this.saveData(pt.fn,86400),this.xh.I(dt.Os))}saveData(t,i){if(this.data[t]){const e=this.Ac(this.data[t]);this.set(t,e,i)}else this.data[t]&&delete this.data[t],this.set(t,"Deleted",-16e4)}Ac(t={}){const i=[];if("string"==typeof t)return t;for(const e in t){const s=`${e}:${String(t[e]).replace(/:/g,"").replace(/\*/g," ").replace(/\|/g,"-")}`;i.push(s)}return i.join("*")}Lc(t,i){i?this.data[t][i]?this.data[t][i]++:this.data[t][i]=1:this.data[t]?this.data[t]++:this.data[t]=1}Tc(t,i){i?this.data[t][i]?this.data[t][i]--:this.data[t][i]=0:this.data[t]?this.data[t]--:this.data[t]=0}deleteData(t,i){i?delete this.data[t][i]:delete this.data[t]}Nc(t){this.enabled=t}verify(){if(!this.enabled)return!1;return!!this.get(pt.Gn)}test(){this.set(pt.Wn,1);const t=!!this.get(pt.Wn);return this.delete(pt.Wn),t}load(){const{[pt.Gn]:t,[pt.zn]:i,[pt.Hn]:e}=this.mh.url.query;t&&i?(this.parse(pt.Gn,ni(t)),this.parse(pt.zn,ni(i))):(this.read(pt.Gn),this.read(pt.zn),this.read(pt.Ae),this.read(pt.fn)),e?this.parse(pt.Hn,ni(e)):this.read(pt.Hn),this.read(pt.cn)}parse(t,i){this.data[t]={};let e="*";-1!=i.indexOf("|")&&(e="|");const s=i.split(e);for(let i=0,e=s.length;i<e;i++){const e=s[i].split(":");void 0!==e[1]?this.data[t][e[0]]=pi.includes(e[0])?Number(e[1]):e[1]:this.data[t]=pi.includes(t)?Number(e[0]):e[0]}}read(t){const i=this.get(t);i&&this.parse(t,i)}}class mi{constructor({cookies:t}){this.Rc=t,this.Mh=si(t.getData(pt.Gn,wt.no))||{},this.Oh=si(t.getData(pt.Gn,wt.ni))||{}}Pc(){return this.Rc}get(){const t={},i={},e={};for(const s in this.Mh){t[s]=this.Mh[s][ct.Ai];for(const t in this.Mh[s][ct.$s]||{})i[s]||(i[s]={}),i[s][t]=!0,e[t]=!0}return{Sa:t,qc:i,Bc:e}}set(t,i){const e=this.visitor(i);this.Rc.setData(pt.Gn,ei(e),wt.no);const{gh:s}=i||{};if(s){const t={},i=i=>t[i]=1;(s[Ht("customSegments")]||[]).forEach(i),this.Rc.setData(pt.Gn,ei(Object.assign(Object.assign({},this.Oh),t)),wt.ni)}}visitor(t={}){const{Sa:i={},qc:e}=this.get(),s={},n=(t,i,e={})=>{s[t]={[ct.Ai]:i,[ct.$s]:e}};Object.keys(i).forEach((t=>{if(bt(e[t])){const s=Object.keys(e[t]).reduce(((t,i)=>(t[i]=1,t)),{});n(t,i[t],s)}else n(t,i[t])}));const{Sa:o,Bc:r}=t;return o&&Object.keys(o).forEach((t=>{const i=s[t]?s[t][ct.$s]:{};n(t,o[t],i),r&&((t,i)=>{s[t]||(s[t]={[ct.$s]:{}}),Object.keys(i).forEach((i=>{s[t][ct.$s][i]=1}))})(t,r)})),s}}class Ii{constructor({config:t,data:i,state:e,Vc:s,Uc:n,request:o,Fc:r,remote:h,oh:a,nh:c,rh:d,Gc:l,t:u}){this.name="Visitor",this.zc={},this.fh=t,this.ph=i,this.Hc={},this.wh=e,this.Vc=s,this.data=n,this.mh=o,this.Wc=r,this.Ih=h,this.yh=a,this.bh=c,this.xh=d,this.Jc=l,this.u=u}process(t){var i,e,s;const n=!1===Boolean(this.id),o=!t,r=this.mh.url.object.host.replace(/^www\./,"");this.domain=((t,i)=>{let e;if(t.find((({Kc:t})=>t===i)))return`.${i}`;for(const{Kc:s,Qc:n}of t)if(n.find((t=>t.includes(i)||ii(i,t)))){e=`.${s}`;break}return e||!1})(this.fh.Zc.Yc,r)||"",this.cookies=new wi({data:null==t?void 0:t.data,request:this.mh,state:this.wh,domain:this.domain,enabled:this.Wc,rh:this.xh,t:this.u,remote:this.Ih,oh:this.yh}),this.device=this.device||Wt((null===(i=this.ph)||void 0===i?void 0:i.device)||{},!0),this.Xc=this.Xc||Wt((null===(e=this.ph)||void 0===e?void 0:e.Xc)||{},!0),this.td=this.td||Wt((null===(s=this.ph)||void 0===s?void 0:s.td)||{},!0),this.source=this.source||"",this.ed=this.ed||"",this.sd=this.sd||"",this.nd=this.nd||"",this.od=this.cookies.getData(pt.Gn,wt.Jn),this.rd=this.cookies.getData(pt.Gn,wt.Kn),this.hd=this.cookies.getData(pt.Gn,wt.Qn)||0,this.ad=parseInt(this.cookies.getData(pt.Gn,wt.Yn)||"0"),this.dd=parseInt(this.cookies.getData(pt.Gn,wt.Zn)||"1"),o&&this.dd++,this.ld=parseInt(this.cookies.getData(pt.zn,wt.Zn)||"1"),o&&this.ld++,this.ud=this.cookies.getData(pt.zn,wt.Xn),this.vd=this.cookies.getData(pt.zn,wt.si),this.vd||(this.vd=this.gd(),this.cookies.setData(pt.zn,this.vd,wt.si)),this.fd(n),this.gh=this.pd(si(this.cookies.getData(pt.Gn,wt.ni)),wt.ni),this.oa=this.pd(si(this.cookies.getData(pt.Gn,wt.no)),wt.no),"object"!=typeof this.oa&&(this.oa={});for(const t in this.oa)if(bt(this.oa[t][ct.$s])){this.Hc[t]||(this.Hc[t]={});for(const i in this.oa[t][ct.$s])this.Hc[t][i]=!1}this.wd();const{md:h=[]}=this.fh;h.length&&h.forEach((t=>{this.oa[t]&&delete this.oa[t]})),this.Bc={};for(const t in this.oa)for(const i in this.oa[t][ct.$s])this.Bc[i]||(this.Bc[i]=1);const{zh:a}=this.ph;if(a)this.id=a;else{const t=this.cookies.getData(pt.Gn,wt.gi);this.id=t||"1"}if(o){if(this.Id=!1,!this.ud){this.ad?this.ud=this.ad+1:this.ud=1,this.cookies.setData(pt.zn,this.ud,wt.Xn),this.cookies.Lc(pt.Gn,wt.Yn),this.ad++,this.ad>1&&(this.hd=this.rd,this.cookies.setData(pt.Gn,this.hd,wt.Qn));const t=new Date;this.rd=Math.round(t.getTime()/1e3),this.cookies.setData(pt.Gn,this.rd,wt.Kn),1!==this.ad||this.od||void 0===this.od||(this.od=this.rd,this.cookies.setData(pt.Gn,this.od,wt.Jn))}this.yd=1!==this.ad}}get id(){return"1"===this.bd?this.vd:this.bd}set id(t){this.bd=t,this.cookies.setData(pt.Gn,this.bd,wt.gi)}wd(){var t,i,e;(null===(t=this.wh)||void 0===t?void 0:t.ua)||this.bh.xd(sessionStorage),this.ja=this.bh.get(di.Wr)||{},bt(this.ja)&&this.xh.I(Y.Be,{oa:Object.keys(this.ja),kd:!1}),this.Oa=this.bh.get(di.Hr)||{},bt(this.Oa)&&this.xh.I(Y.Ve,{oa:Object.keys(this.Oa),kd:!1}),this.Ea=this.bh.get(di.Kr)||{},bt(this.Ea)&&Object.keys(this.Ea).forEach((t=>{this.xh.I(Y.Ue,{experienceId:t,Bh:this.Ea[t],kd:!1})})),this.Ma=this.bh.get(di.Jr)||{},bt(this.Ma)&&Object.keys(this.Ma).forEach((t=>{this.xh.I(Y.Fe,{experienceId:t,Bh:this.Ma[t],kd:!1})}));const{[lt.Js]:s,[lt.Di]:n,[lt.Ai]:o}=this.mh.url.query,r=s===ut.In&&n&&o;bt(this.ja)||bt(this.Oa)||bt(this.Ma)||bt(this.Ea)||r?(this.wh.Pa=!0,this.xh.I(Y.He,this.bh.get(di.Xr)||{}),r&&!(null===(i=this.Ea[n])||void 0===i?void 0:i[o])&&this.xh.I(Y.Ge,{experienceId:n,Bh:o,Aa:!1})):(null===(e=this.wh)||void 0===e?void 0:e.ua)||this.bh.xd(localStorage)}fd(t){let i=Boolean(this.source),e=Boolean(this.ed),s=Boolean(this.sd),n=Boolean(this.nd),o=Boolean(i||e||s||n);if(o)return;if(this.ud){const t=this.cookies.getData(pt.Ae,wt.ri),o=this.cookies.getData(pt.Ae,wt.io),r=this.cookies.getData(pt.Ae,wt.eo),h=this.cookies.getData(pt.Ae,wt.so);t&&(this.source=t,i=!0),o&&(this.ed=o,e=!0),r&&(this.sd=r,s=!0),h&&(this.nd=h,n=!0)}else this.mh.Sd?(this.source=this.mh._d.object.host,this.ed="organic",this.sd=this.mh.$d,i=!0,e=!0,n=!0,""!=this.sd&&(s=!0)):this.mh.Od&&this.mh._d.object.host!==this.mh.url.object.host&&(this.source=this.mh._d.object.host,this.ed="referral",this.sd="",i=!0,e=!0,s=!0,n=!0);const{[lt.dn]:r,[lt.ln]:h,[lt.un]:a,[lt.vn]:c,[lt.gn]:d}=this.mh.url.query;r&&(this.source="google",this.ed="cpc google"),o=Boolean(i||e||s||n),(!this.ud||!o&&bt(this.wh.Wa))&&this.mh.Md&&(h&&(this.source=h,i=!0),a&&(this.ed=a,e=!0),c&&(this.nd=c,n=!0),d&&(this.sd=d,s=!0)),o=Boolean(i||e||s||n),o&&(this.cookies.setData(pt.Ae,String(this.source).slice(0,30),wt.ri),this.cookies.setData(pt.Ae,String(this.ed).slice(0,30),wt.io),this.cookies.setData(pt.Ae,String(this.sd).slice(0,30),wt.eo),this.cookies.setData(pt.Ae,String(this.nd).slice(0,30),wt.so))}pd(t,i){const e=Kt(t);switch(i){case wt.ni:for(const i in t)this.fh.gh[i]||delete e[i];break;case wt.no:for(const i in t)if(this.fh.oa[i])for(const s in t[i])if(Object.values(ct).includes(s)){if(s===ct.$s)for(const n in t[i][s])this.fh.Bc[n]||delete e[i][s][n]}else delete e[i][s];else delete e[i]}return e}static Cd(){return{oa:{},qc:{},Bc:{}}}gd(){return`${Date.now()}-${Math.random()}`}jd({experienceId:t,Ed:i}){this.oa[t]=i,this.cookies.setData(pt.Gn,ei(this.oa),wt.no)}Dd({data:t}){let i=this.pd(si(this.cookies.getData(pt.Gn,wt.no)),wt.no);"object"!=typeof i&&(i={});const e=t[wt.no];for(const t in i)e[t]||(e[t]=i[t]);this.cookies.setData(pt.Gn,ei(e),wt.no),this.cookies.setData(pt.Gn,t[wt.gi],wt.gi),this.cookies.save()}ma({experienceId:t,Bh:i}){var e,s;if(!this.fh.oa[t])return;if(this.ja[t])return;if(null===(e=this.Ea[t])||void 0===e?void 0:e[i])return;const n=()=>{var e,s;try{const n=this.fh.oa[t].name,o=null===(e=this.fh.oa[t].Za[i])||void 0===e?void 0:e.name,r=!(String(null===(s=this.oa[t])||void 0===s?void 0:s[ct.Ai])===String(i));this.xh.I(dt.Ms,{data:{experienceId:String(t),Xa:String(t),Bh:String(i),tc:String(i),ec:n,sc:n,nc:o,variation_name:o,Ad:r,Ld:r}})}catch({message:t}){}};if(this.data.oa[t]={Ra:!(String(null===(s=this.oa[t])||void 0===s?void 0:s[ct.Ai])===String(i)),bi:this.fh.oa[t].Za[i]},this.data.oa[t].bi.Td.length||this.data.oa[t].bi.Td.push({name:this.data.oa[t].bi.name}),!this.data.oa[t].Ra)return this.Vc.oa[t]=Kt(this.data.oa[t]),void n();this.fh.oa[t].type!==h&&(this.Id=!0),this.Vc.oa[t]=Kt(this.data.oa[t]),n(),this.oa[t]={[ct.Ai]:i,[ct.$s]:{}},this.cookies.setData(pt.Gn,ei(this.oa),wt.no),this.cookies.save()}da(){return this.zc}Nd({experienceId:t,Bh:i}){this.zc[t]=i}Ia(){this.zc={}}Rd({experienceId:t,Bh:i}){var e;return this.cookies.Ac({[String(t)]:`${i}${(null===(e=this.wh)||void 0===e?void 0:e.Pd)?"preview":""}`})}qd({experienceId:t,Bh:i,Bd:e}){var s;if(!t||!i)return;const n=new li(this.mh.url.href).create(vi),o=e!==n?Et(n):null;this.cookies.setData(pt.Hn,`${i}${(null===(s=this.wh)||void 0===s?void 0:s.Pd)?"preview":""}${o?`+${o}`:""}`,String(t)),(t=>{try{return document.location.hostname===new URL(t).hostname}catch(t){return!1}})(e)&&(this.bh.set(di.Yr,{[t]:{value:i,time:Date.now()+7e3,la:o}}),setTimeout((()=>this.bh.delete(di.Yr)),7e3)),this.cookies.Tc(pt.zn,wt.Zn),this.cookies.Tc(pt.Gn,wt.Zn),this.oa[t]||this.Ca({experienceId:t}),this.cookies.save()}Ca({experienceId:t}){let i=this.pd(si(this.cookies.getData(pt.Gn,wt.no)),wt.no);"object"!=typeof i&&(i={}),delete i[t],delete this.Vc.oa[t],delete this.Vc.qc[t],delete this.data.oa[t],delete this.data.qc[t],this.cookies.setData(pt.Gn,ei(i),wt.no)}Da({experienceId:t,Bh:i}){var e;let s=this.pd(si(this.cookies.getData(pt.Gn,wt.no)),wt.no);"object"!=typeof s&&(s={}),String(null===(e=s[t])||void 0===e?void 0:e[ct.Ai])===String(i)&&delete s[t][ct.Ai],delete this.Vc.oa[t],delete this.Vc.qc[t],delete this.data.oa[t],delete this.data.qc[t],this.cookies.setData(pt.Gn,ei(s),wt.no)}lc({experienceId:t}){this.oa[t]={[ct.Ai]:"1",[ct.$s]:{}},this.cookies.setData(pt.Gn,ei(this.oa),wt.no)}Vd({Ud:t}){this.gh[t]=1,this.Jc.Fd(this.id,[t]),this.cookies.setData(pt.Gn,ei(this.gh),wt.ni)}Gd({Ud:t}){return!!this.gh[t]}zd({Hd:t,experienceId:i}){var e,s,n,o,r;if(!this.ja[i]&&(null===(e=this.fh.oa[i])||void 0===e?void 0:e.type)!==h){(null===(n=null===(s=this.ph)||void 0===s?void 0:s.va)||void 0===n?void 0:n.Wd)===this.fh.Zc.id&&this.Ih.log({[M.Lt]:t},{cookies:this.cookies,request:this.mh,from:O.X,visitor:this});for(const e in this.oa){const s=i||e,n=this.oa[s][ct.Ai];if(null===(o=this.Ea[s])||void 0===o?void 0:o[n])continue;const a=Boolean(String(i)===String(e));if(this.oa[s]&&this.fh.oa[s]&&(null===(r=this.fh.oa[s])||void 0===r?void 0:r.type)!==h&&"1"!==this.oa[s][ct.Ai]){if(this.Hc[s]||(this.Hc[s]={}),this.oa[s][ct.$s][t])this.Hc[s][t]=!1;else{this.oa[s][ct.$s][t]=1,this.Bc[t]||(this.Bc[t]=1),this.Hc[s][t]=!0,this.data.qc[s]||(this.data.qc[s]={}),this.data.qc[s][t]||(this.data.qc[s][t]=Date.now()),this.Vc.qc[s]||(this.Vc.qc[s]={}),this.Vc.qc[s][t]=this.data.qc[s][t],this.data.Bc[t]=1,this.Vc.Bc[t]=this.data.Bc[t];try{this.xh.I(dt.js,{data:{Xa:String(s),tc:String(n),Jd:String(t),sc:this.fh.oa[s].name,variation_name:this.fh.oa[s].Za[n].name}})}catch({message:t}){}}if(a)break}else if(a)break}this.cookies.setData(pt.Gn,ei(this.oa),wt.no)}}}var yi,bi,xi,ki;!function(t){t.Kd="purchase",t.Qd="refund"}(yi||(yi={})),function(t){t.Yd="experience_impression"}(bi||(bi={})),function(t){t.Zd="gtm.js",t.Xd="gtm.dom",t.Or="gtm.load",t.il="gtm.timer"}(xi||(xi={})),function(t){t.el="convert-trigger-experience"}(ki||(ki={}));const Si={sl:l,nl:u,ol:v,rl:g,hl:f,al:"ga_import",cl:"clicks_link",dl:"clicks_element",ll:"submits_form",ul:"visits_page"};class _i{constructor({config:t,data:i,state:e,request:s,remote:n,oh:o,rh:r,t:h,hh:a,uh:c,gh:d,visitor:l}){this.name="Goals",this.fh=t,this.ph=i,this.wh=e,this.mh=s,this.Ih=n,this.yh=o,this.u=h,this.xh=r,this.kh=a,this.$h=c,this.Oh=d,this.Mh=l,this.Ch=[],this.jh=!1,this.vl=[],this.gl=[],this.fl={},this.pl=!1,this.wl={},this.xh.on(F.Hi,(t=>{const{Hd:i}=Wt(t);this.Ch.push(i)})),this.yh.ml=(...t)=>{const[i]=t;if(bt(i))this.Na(i);else{const[i,e]=t;this.Na({Hd:i,experienceId:e})}},this.yh.Il=(...t)=>{const[i]=t;if(bt(i))this.Na(i);else{const[i,e]=t;this.Na({Hd:i,experienceId:e})}},this.yh.yl=(...t)=>{const[i]=t;if(bt(i))this.bl(Object.assign(Object.assign({},i),{xl:"sendRevApi"}));else{const[i,e,s,n,o=!1]=t;this.bl({Hd:n,kl:i,Sl:e,_l:s,xl:"sendRevApi",$l:o})}},this.yh.Ol=(...t)=>{const[i]=t;if(bt(i))this.bl(Object.assign(Object.assign({},i),{xl:"sendRevApi"}));else{const[i,e,s,n=!1,o]=t;this.bl({Hd:s,kl:o,Sl:i,_l:e,xl:"sendRevApi",$l:n})}},this.yh.Ml=()=>{this.wh.isDisabled||(this.mh.process(),this.process())},this.yh.Cl=()=>{this.wh.isDisabled||(this.mh.process(),this.process())}}process({Hh:t=!0}={}){var i;for(const t in this.fh.Bc)this.jl({Hd:t,zh:this.Mh.id});this.Ch.length?this.xh.I(Y.Ne,{zh:this.Mh.id,Hh:t}):(this.xh.I(Y.ze,{zh:this.Mh.id,Hh:t}),(null===(i=this.wh)||void 0===i?void 0:i.El)||(this.wh.El={}),this.wh.El.Bc=!0),this.Dl(),this.Al()}Dl({Ll:t}={}){var i,e,s,n;if(!t)try{const t=Yt(this.vl);for(const o of t){const{Tl:t}=(null===(i=this.fh.Bc[o])||void 0===i?void 0:i.Nl)||{},{href:r}=(null===(e=this.fh.Bc[o])||void 0===e?void 0:e.Nl)||{},{selector:h}=(null===(s=this.fh.Bc[o])||void 0===s?void 0:s.Nl)||{},{action:a}=(null===(n=this.fh.Bc[o])||void 0===n?void 0:n.Nl)||{};if(Array.isArray(t))for(const{selector:i,event:e}of t)this.$h.Rl({selector:i,event:e,Hd:o,Pl:()=>this.Na({Hd:o})});else{const t=a?Ft.Ur:Ut.CLICK;this.$h.Rl({selector:h||this.$h.ql({action:a,href:r}),event:t,Hd:o,Pl:()=>this.Na({Hd:o})})}}}catch({message:t}){}}Al(){this.$h.Bl({Bc:this.gl,Pl:({Hd:t})=>this.Na({Hd:t})})}Vl(t=yi.Kd){try{const i=Yt(this.fl[t]||[]),[e,...s]=i;if(e)return this.Mh.zd({Hd:e}),this.Mh.cookies.save(),s.length,e}catch({message:t}){}}Ul(t){try{if(this.fl[t]){const i=Yt(this.fl[t]);return this.Na({Hd:i})}t&&!Object.values(bi).includes(t)&&!Object.values(xi).includes(t)&&Object.values(ki).some((i=>String(t).includes(i)))}catch({message:t}){}return!1}jl({Hd:t,zh:i}){var e,s,n,o;let r;for(const i in this.Mh.oa)if("1"!==this.Mh.oa[i][ct.Ai]&&!this.Mh.oa[i][ct.$s][t]&&this.fh.oa[i]){r=!0;break}const h=this.fh.Zc.Yc.reduce(((t,{Qc:i})=>t+i.length),0);if(!r&&h<2)return;let a;if(bt(this.fh.Bc[t].rules)){if(a=this.kh.process({Fl:`Goal #${t}`,rules:this.fh.Bc[t].rules,gh:this.Oh,visitor:this.Mh}),Object.values(F).includes(a))return a===F.Wi?this.Ch.push(t):F.Hi,!1}else a=!0;switch(this.fh.Bc[t].type){case Si.rl:break;case Si.nl:case Si.dl:case Si.cl:case Si.ll:case Si.ol:a&&Object.values(Si).includes(this.fh.Bc[t].type)&&(this.fh.Bc[t].type===Si.nl||this.fh.Bc[t].type===Si.dl||this.fh.Bc[t].type===Si.cl||this.fh.Bc[t].type===Si.ll?this.vl.push(t):this.fh.Bc[t].type===Si.ol&&this.gl.push(t));break;case Si.al:if(null===(s=null===(e=this.fh.Bc[t])||void 0===e?void 0:e.Nl)||void 0===s?void 0:s.Gl){const{Gl:i}=this.fh.Bc[t].Nl;this.fl[i]||(this.fl[i]=[]),this.fl[i].push(t)}break;default:a&&(this.fh.Bc[t].type===Si.hl&&(null===(o=null===(n=this.fh.Bc[t])||void 0===n?void 0:n.Nl)||void 0===o?void 0:o.zl)===d||this.Mh.zd({Hd:t}))}}ya({zh:t,Hh:i=!0}){var e;if(!this.jh&&this.Ch.length){this.jh=!0;for(let i=0,e=this.Ch.length;i<e;i++)this.jl({Hd:this.Ch[i],zh:t});this.Dl({Ll:!0}),this.Ch=[],this.xh.I(Y.ze,{zh:t,Hh:i}),(null===(e=this.wh)||void 0===e?void 0:e.El)||(this.wh.El={}),this.wh.El.Bc=!0}}Na({Hd:t,experienceId:i,zh:e}){if(!this.wh.isDisabled){if(Array.isArray(t)){if(!t.length)return;for(const e of t)this.Mh.zd({Hd:e,experienceId:i})}else this.Mh.zd({Hd:t,experienceId:i});return this.Hl()}}Hl(){var t,i,e,s;this.Mh.cookies.save();let n=!1;const o=bt(this.Mh.data.oa),r=bt(this.Mh.data.Bc);if(o||r)if(this.Mh.Id||r){let o=0;for(const n in this.Mh.oa){if(!this.fh.oa[n])continue;if(this.fh.oa[n].type===h)continue;const o={experienceId:n,Bh:this.Mh.oa[n][ct.Ai],Bc:[]};if(this.Mh.oa[n][ct.$s])for(const e in this.Mh.oa[n][ct.$s])(null===(i=null===(t=this.Mh.data.qc)||void 0===t?void 0:t[n])||void 0===i?void 0:i[e])||o.Bc.push(e);null===(s=null===(e=this.Mh.data.oa)||void 0===e?void 0:e[n])||void 0===s||s.Ra}for(const t in this.Mh.Bc)if(this.Mh.data.Bc[t]){o++;const i={Hd:String(t),Wl:{}};for(const e in this.Mh.data.qc)this.Mh.data.qc[e][t]&&(i.Wl[e]=String(this.Mh.oa[e][ct.Ai]));if(bt(i.Wl)){const t={_a:$,data:i};this.Ih.track(t,{visitor:this.Mh}),n=!0,this.Ih.log({[M.bt]:{[M.Tt]:"hitGoal",[M.Nt]:Object.keys(i.Wl),[M.Rt]:Object.values(i.Wl),[M.Pt]:[i.Hd]}},{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.tt})}}o||this.Mh.Id}else this.Mh.Id;return this.Mh.data=Ii.Cd(),n}bl({Hd:t,kl:i,Sl:e,_l:s,xl:n,$l:o}){if(this.wh.isDisabled)return;if(t&&!this.fh.Bc[t])return;const r="number"==typeof e?e:At(e);if(o&&(t?this.wl[t]=!1:this.pl=!1),this.wl[t]||this.pl)return;const a={[M.vt]:n,[M.ai]:this.pl},c=t=>{var i,e,s,n,o,h,c,d;try{const l=(null===(e=null===(i=this.fh.oa[t])||void 0===i?void 0:i.Nl)||void 0===e?void 0:e.Jl)||(null===(n=null===(s=this.fh.Zc)||void 0===s?void 0:s.Nl)||void 0===n?void 0:n.Jl)||0,u=(null===(h=null===(o=this.fh.oa[t])||void 0===o?void 0:o.Nl)||void 0===h?void 0:h.Kl)||(null===(d=null===(c=this.fh.Zc)||void 0===c?void 0:c.Nl)||void 0===d?void 0:d.Kl)||0;if(r<l||r>u)return this.Ih.log(Object.assign(Object.assign({},a),{[M.Yt]:l,[M.Zt]:u}),{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.et}),!0}catch({message:t}){}return!1};let d=!1;const l={};for(const t in this.Mh.oa)this.fh.oa[t]&&this.fh.oa[t].type!==h&&(c(t)||(l[t]=String(this.Mh.oa[t][ct.Ai])));if(!bt(l))return;if(t&&(this.Mh.zd({Hd:t}),1===this.Mh.data.Bc[t])){const i={Hd:String(t),Wl:{}};for(const e in this.Mh.data.qc)this.Mh.data.qc[e][t]&&(i.Wl[e]=String(this.Mh.oa[e][ct.Ai]));bt(i.Wl)||delete i.Wl;const e={_a:$,data:i};this.Ih.track(e,{visitor:this.Mh}),this.Ih.log({[M.bt]:{[M.Tt]:"hitGoal",[M.Nt]:Object.keys(i.Wl),[M.Rt]:Object.values(i.Wl),[M.Pt]:[i.Hd]}},{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.tt}),this.Mh.data=Ii.Cd()}let u=[];if(t&&this.Mh.Vc.Bc[t])u.push(t);else for(const t in this.Mh.Bc)this.Mh.Vc.Bc[t]&&!u.includes(t)&&u.push(t);if(t&&o&&(u=[t]),0!==u.length){{this.Mh.cookies.save(),t?this.wl[t]=!0:this.pl=!0;const e=t=>{const e={Hd:String(t),Ql:[{key:q.Ti,value:r},{key:q.Ni,value:Dt(s)?Number(s):0},{key:q.Ri,value:i}],Wl:l},n={_a:$,data:e};this.Ih.track(n,{visitor:this.Mh}),d=!0,this.Ih.log({[M.bt]:{[M.Tt]:"tr",[M.Nt]:Object.keys(e.Wl),[M.Rt]:Object.values(e.Wl),[M.Pt]:[e.Hd],[M.qt]:e.Ql[0][q.Ri],[M.Ht]:e.Ql[0][q.Ti],[M.Wt]:e.Ql[0][q.Ni]}},{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.tt})};for(const t of u)e(t)}return d}this.Ih.log(a,{cookies:this.Mh.cookies,request:this.mh,visitor:this.Mh,from:O.it})}}class $i{constructor({data:t,state:i,t:e}){var s,n;this.name="VisualEditor",this.ph=t,this.wh=i,this.u=e,this.Yl=new AbortController;try{if(window===(null===window||void 0===window?void 0:window.parent))return;if(null===window||void 0===window?void 0:window._conv_editor)return;window.addEventListener(Pt.zt,this.Zl.bind(this),{signal:this.Yl.signal}),null===(n=null===(s=null===window||void 0===window?void 0:window.parent)||void 0===s?void 0:s.postMessage)||void 0===n||n.call(s,JSON.stringify({type:"helloWebsite",msg:{}}),"*")}catch({stack:t,message:i}){"undefined"!=typeof console&&console.error&&console.error("Convert:",t||i)}}Xl(){this.Yl.abort()}Zl({origin:t,data:i}){try{Boolean(this.tu&&Date.now()-this.tu>5e3);if(/^https{0,1}:\/\/.*?\.convert\.com(:[0-9]+){0,1}$/.test(t)){const{type:t,msg:e}=JSON.parse(i||"{}"),{env:s=null,version:n=null}=e||{};switch(t){case"ackEdFilesLoad":this.iu({Qa:s,version:n});break;case"ackEdFilesLoadV2":this.eu({Qa:s})}}else this.tu||(this.tu=Date.now())}catch({stack:t,message:i}){"undefined"!=typeof console&&console.error&&console.error("Convert:",t||i)}}iu({Qa:t,version:i}={Qa:"app",version:Math.random()}){var e;try{oi({url:"//editor.[env].convert.com/sys/[version]/js/neweditor/bundle-editor-iframe.js".replace("[env]",t).replace("[version]",String(i)),attributes:{nonce:null===(e=this.wh)||void 0===e?void 0:e.su,"data-cfasync":"false",async:"true"}})}catch({message:t}){}}eu({Qa:t}){var i;try{oi({url:"https://[env].convert.com/static/_editor_frame_files/bundle.js".replace("[env]",t),attributes:{nonce:null===(i=this.wh)||void 0===i?void 0:i.su,"data-cfasync":"false",async:"true"}})}catch({message:t}){}}}const Oi=B.Pi;class Mi{constructor(t=console,i=Oi,e){this.nu={[V.Fi]:V.Fi,[V.qi]:V.qi,[V.Bi]:V.Bi,[V.Vi]:V.Vi,[V.ERROR]:V.ERROR,[V.Pi]:V.Pi},this.ou=[],this.ru(t,i,e)}hu(t){return Object.values(B).includes(t)}au(t){return Object.values(V).includes(t)}cu(t,i,...e){this.ou.forEach((s=>{var n,o;if(i>=s.level&&B.Ui!==i){const i=s.du[s.m[t]];i?i.call(s.du,...e):(console.log(`Info: Unable to find method "${t}()" in client sdk:`,null===(o=null===(n=s.du)||void 0===n?void 0:n.constructor)||void 0===o?void 0:o.name),console[t](...e))}}))}log(t,...i){this.hu(t)?this.cu(V.Fi,t,...i):console.error("Invalid Log Level")}trace(...t){this.cu(V.Pi,B.Pi,...t)}debug(...t){this.cu(V.qi,B.qi,...t)}info(...t){this.cu(V.Bi,B.Bi,...t)}warn(...t){this.cu(V.Vi,B.Vi,...t)}error(...t){this.cu(V.ERROR,B.ERROR,...t)}ru(t=console,i=Oi,e){if(!t)return void console.error("Invalid Client SDK");if(!this.hu(i))return void console.error("Invalid Log Level");const s=Object.assign({},this.nu);e&&Object.keys(e).filter(this.au).forEach((t=>{s[t]=e[t]})),this.ou.push({du:t,level:i,m:s})}lu(t,i){if(this.hu(t))if(i){const e=this.ou.findIndex((({du:t})=>t===i));if(-1===e)return void console.error("Client SDK not found");this.ou[e].level=t}else for(let i=0,e=this.ou.length;i<e;i++)this.ou[i].level=t;else console.error("Invalid Log Level")}}class Ci{constructor({config:t,state:i,uu:e,t:s}={}){this.name="Remote",this.fh=t||{},this.wh=i||{},e&&(this.vu=e),s&&(this.u=s),this.gu=[],this.fu=[],window.convert[Ht("sendLog",!0)]=(t,i)=>this.log(t,{from:i})}pu(t){this.Oh=t}log(t,{from:i,cookies:e,request:s,visitor:n}){var o,r,h,a,c,d,l,u;if((null===(o=this.wh)||void 0===o?void 0:o.isDisabled)||(null===(r=this.wh)||void 0===r?void 0:r.ua))return;if(!Boolean((n&&n.cookies.enabled||e&&e.enabled||!n&&!e)&&(null===(h=this.wh)||void 0===h?void 0:h.wu)))return void this.fu.push(t);const v=this.wh?this.Oh.mu():{};if(i===O.J&&v[J.Oe]!==H.ve)return;const g=Wt(Kt(t),!0);if(g[M.hi]=Date.now(),g[M.At]=i,g[M.ri]="v1",g[M.ii]=null===(a=this.wh)||void 0===a?void 0:a.Iu,g[M.ut]=null===(c=this.fh)||void 0===c?void 0:c.yu,g[M.ti]=null===(l=null===(d=this.fh)||void 0===d?void 0:d.Zc)||void 0===l?void 0:l.id,g[Ht(M.ni,!0)]=v,n&&(g[M.ui]=this.bu(n.oa),g[M.gi]=n.id,n.vd&&(g[M.si]=n.vd),(null===(u=this.wh)||void 0===u?void 0:u.xu)&&1===n.ad&&(g[M.Xt]=this.wh.xu)),e&&(g[M.li]=e.get(pt.Gn),g[M.ei]=e.get(pt.zn)),s){g[M.wt]=s.url.href,g[M.It]=s._d.href,g[M.ci]=s.userAgent;for(const t in s.ku)s.ku[t]&&(g[`t_${t}`]=s.ku[t])}this.vu?this.gu.push(g):this.sendBeacon(ui,g),10===this.gu.length?this.Su("size"):1===this.gu.length&&this._u()}track(t,{visitor:i}){var e;(null===(e=this.wh)||void 0===e?void 0:e.ua)||this.vu.enqueue(i.id,t,this.Oh.mu())}Su(t){this.gu.length&&(this.$u(),this.sendBeacon(ui,this.gu.slice()),this.gu=[])}$u(){clearTimeout(this.Ou)}_u(){this.Ou=setTimeout((()=>{this.Su("timeout")}),500)}bu(t){return Object.fromEntries(Object.entries(t).map((([t,i],e)=>[`exp${e+1}`,{[M.Dt]:t,[M.di]:i[M.di],[M.Lt]:Object.keys(i[M.Lt])}])))}sendBeacon(t,i){navigator.sendBeacon(t,JSON.stringify(Kt(i)))||this.Mu(t,Object.assign(Object.assign({},i),{error:1}))}Mu(t,i){const e=document.createElement("img");e.width=1,e.height=1;try{e.src=`${t}?plain=${encodeURIComponent(JSON.stringify(i))}`}catch(s){e.src=`${t}?plain=${encodeURIComponent(`{"senderror":"${(null==i?void 0:i.from)||""}-${s}"}`)}`}}}class ji{constructor({config:t,data:i,state:e,request:s,remote:n,oh:o,rh:r,Gc:h,t:a,hh:c,visitor:d}){this.name="Segments",this.fh=t,this.ph=i,this.wh=e,this.mh=s,this.Ih=n,this.yh=o,this.u=a,this.xh=r,this.Jc=h,this.kh=c,this.Mh=d,this.Cu={},this.Ch=[],this.jh=!1,this.Eh=[],this.Dh={},this.Th=2400,this.xh.on(F.Hi,(t=>{const{Ud:i}=Wt(t);this.Ch.push(i)})),this.xh.on(F.Wi,(t=>{const{Ud:i}=Wt(t);this.Eh.push(i)})),this.yh.ju=(...t)=>{const[i]=t;if(bt(i))this.ju(i);else{const[i,e]=t;this.ju({Ud:i,zh:e})}},this.yh.Eu=(...t)=>{const[i]=t;if(bt(i))this.Du(i);else{const[i]=t;this.Du({zh:i})}},this.yh.Au=(...t)=>{const[i]=t;if(bt(i))this.Au(i);else{const[i,e]=t;this.Au({Ud:i,zh:e})}},window.convert[Ht("getDefaultSegments",!0)]=()=>zt(this.Lu()),window.convert[Ht("getVisitorSegments",!0)]=()=>zt(this.mu())}Lu(){if(!this.wh.isDisabled){try{this.Tu(),this.Nu(),this.Ru(),this.Pu(),this.qu(),this.Bu(),this.Vu()}catch({message:t}){}return this.Cu}}mu(){if(this.wh.isDisabled)return;const t=bt(this.Cu)?this.Cu:this.Lu();t[J.Ee]=[];for(const i in this.Mh.gh)t[J.Ee].push(i);return t}process(){for(const t in this.fh.gh)this.Uu({Ud:t,zh:this.Mh.id});this.Ch.length?this.xh.I(Y.Ne,{zh:this.Mh.id}):this.xh.I(dt.Ls,{zh:this.Mh.id})}Fu({zh:t}){var i;if(!this.jh&&this.Ch.length){this.jh=!0;for(let e=0,s=this.Ch.length;e<s;e++)if(this.Uu({Ud:this.Ch[e],zh:t}),null===(i=this.wh)||void 0===i?void 0:i.aa)throw this.xh.I(Y.Re,{}),at;this.Ch=[],this.xh.I(dt.Ls,{zh:t})}}Uu({Ud:t,zh:i}){if(this.Mh.Gd({Ud:t}))return;if(!this.fh.gh[t])return;const e=this.kh.process({Fl:`Segments #${t}`,rules:this.fh.gh[t].rules,gh:this,visitor:this.Mh});if(Object.values(F).includes(e))return e===F.Wi?this.Ch.push(t):e===F.Hi&&this.Eh.push(t),!1;e&&(this.Mh.Vd({Ud:t}),this.Mh.cookies.save(),i&&this.Mh.id),this.Jc.Gu(this.Mh.id,this.mu())}ju({Ud:t,zh:i}){this.wh.isDisabled||this.fh.gh[t]&&(this.Mh.Vd({Ud:t}),this.Mh.cookies.save(),this.Jc.Gu(this.Mh.id,this.mu()),i&&this.Mh.id)}Du({zh:t}){if(this.wh.isDisabled)return;const i=[];for(let t=0,e=this.Eh.length;t<e;t++)i.push(this.Eh[t]);this.Eh=[];for(let e=0,s=i.length;e<s;e++)this.Uu({Ud:i[e],zh:t});this.xh.I(dt.Ls)}Au({Ud:t,zh:i}){this.wh.isDisabled||(this.Dh[t]||(this.Dh[t]=0),this.Dh[t]<this.Th?(this.Dh[t]++,setTimeout((()=>{this.Uu({Ud:t,zh:i})}),50)):this.Dh[t]=0)}Tu(){switch(this.mh.Hu.zu){case"EDG":this.Cu[J.Oe]=H.ge;break;case"IE":this.Cu[J.Oe]=H.ce;break;case"CH":this.Cu[J.Oe]=H.de;break;case"FF":this.Cu[J.Oe]=H.le;break;case"OP":this.Cu[J.Oe]=H.ue;break;case"SF":this.Cu[J.Oe]=H.ve;break;default:this.Cu[J.Oe]=H.we}}Nu(){var t,i,e,s,n,o,r,h,a,c,d,l;this.Cu[J.Me]=[],(null===(t=this.Mh.device)||void 0===t?void 0:t[Ht("mobile")])&&!(null===(i=this.Mh.device)||void 0===i?void 0:i[Ht("tablet")])&&this.Cu[J.Me].push(W.me),(null===(e=this.Mh.device)||void 0===e?void 0:e[Ht("mobile")])&&/iPhone/.test(navigator.userAgent)&&!window.MSStream&&this.Cu[J.Me].push(W.Ie),!(null===(s=this.Mh.device)||void 0===s?void 0:s[Ht("mobile")])||(null===(n=this.Mh.device)||void 0===n?void 0:n[Ht("tablet")])||/iPhone/.test(navigator.userAgent)&&!window.MSStream||this.Cu[J.Me].push(W.ye),(null===(o=this.Mh.device)||void 0===o?void 0:o[Ht("tablet")])&&this.Cu[J.Me].push(W.be),(null===(r=this.Mh.device)||void 0===r?void 0:r[Ht("tablet")])&&/iPad/.test(navigator.userAgent)&&window.MSStream&&this.Cu[J.Me].push(W.xe),!(null===(h=this.Mh.device)||void 0===h?void 0:h[Ht("tablet")])||/iPad/.test(navigator.userAgent)&&window.MSStream||this.Cu[J.Me].push(W.ke),(null===(a=this.Mh.device)||void 0===a?void 0:a[Ht("desktop")])&&this.Cu[J.Me].push(W.Se),(null===(c=this.Mh.device)||void 0===c?void 0:c[Ht("desktop")])||(null===(d=this.Mh.device)||void 0===d?void 0:d[Ht("mobile")])||(null===(l=this.Mh.device)||void 0===l?void 0:l[Ht("tablet")])||this.Cu[J.Me].push(W._e)}Ru(){"cpc google"==this.Mh.ed||""!==this.Mh.nd?this.Cu[J.ri]=K.Ce:"organic"==this.Mh.ed?this.Cu[J.ri]=K.De:"referral"==this.Mh.ed?this.Cu[J.ri]=K.Ae:this.Cu[J.ri]=K.Le}Pu(){this.Cu[J.Ce]=this.Mh.nd}Bu(){this.Cu[J.je]=this.Mh.yd?Q.Te:Q.NEW}Vu(){var t;this.Cu[J.$e]=null===(t=this.Mh.Xc)||void 0===t?void 0:t[Ht("country")]}qu(){}}const Ei=[{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Trident/",identity:"IE",Ju:"rv",Ku:"Internet Explorer"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Edge/",identity:"EDG",Ju:"Edge",Ku:"Microsoft Edge"},{string:navigator.userAgent,Wu:"Edg/",identity:"EDG",Ju:"Edg",Ku:"Microsoft Edge"},{string:navigator.userAgent,Wu:"EdgiOS/",identity:"EDG",Ju:"EdgiOS",Ku:"Microsoft Edge"},{string:navigator.userAgent,Wu:"EdgA/",identity:"EDG",Ju:"EdgA",Ku:"Microsoft Edge"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Chrome",identity:"CH",Ku:"Google Chrome",Ju:"Chrome"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"OmniWeb",Ju:"OmniWeb/",identity:"OW",Ku:"OmniWeb"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"CriOS",Ju:"CriOS/",identity:"CH",Ku:"Chrome"},{string:null===navigator||void 0===navigator?void 0:navigator.vendor,Wu:"Apple",identity:"SF",Ju:"Version/",Ku:"Safari"},{prop:null===window||void 0===window?void 0:window.opera,identity:"OP",Ju:"Version",Ku:"Opera"},{string:null===navigator||void 0===navigator?void 0:navigator.vendor,Wu:"iCab",identity:"IB",Ju:"iCab",Ku:"iCab"},{string:null===navigator||void 0===navigator?void 0:navigator.vendor,Wu:"KDE",identity:"KO",Ju:"Konqueror",Ku:"Konqueror"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Firefox",identity:"FF",Ku:"Firefox",Ju:"Firefox"},{string:null===navigator||void 0===navigator?void 0:navigator.vendor,Wu:"Camino",identity:"CO",Ju:"Camino",Ku:"Camino"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Netscape",identity:"NS",Ju:"Netscape",Ku:"Netscape"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"MSIE",identity:"IE",Ju:"MSIE",Ku:"Internet Explorer"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Gecko",identity:"MO",Ju:"rv",Ku:"Gecko Browsers"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Mozilla",identity:"NS",Ju:"Mozilla",Ku:"Netscape"}],Di=[{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"Android",identity:"bv",Ku:"Android"},{string:null===navigator||void 0===navigator?void 0:navigator.platform,Wu:"Win",identity:"WIN",Ku:"Microsoft Windows"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"iPhone",identity:"IPH",Ku:"IPhone"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"iPad",identity:"IPA",Ku:"IPad"},{string:null===navigator||void 0===navigator?void 0:navigator.userAgent,Wu:"iPod",identity:"IPO",Ku:"IPod"},{string:null===navigator||void 0===navigator?void 0:navigator.platform,Wu:"Mac",identity:"MAC",Ku:"MacOS"},{string:null===navigator||void 0===navigator?void 0:navigator.platform,Wu:"Linux",identity:"LIN",Ku:"Linux OS"}];class Ai{getInfo(){var t;const{name:i,zu:e,version:s,Qu:n}=this.detect(),{screen:{width:o,height:r}}=window,h={name:i,zu:e,version:s,Qu:n,Yu:o,Zu:r};return"undefined"!=typeof navigator&&(h.lang=null!==(t=null===navigator||void 0===navigator?void 0:navigator.language)&&void 0!==t?t:null===navigator||void 0===navigator?void 0:navigator.userLanguage,"string"==typeof h.lang&&(h.lang=h.lang.split("-")[0])),h}detect(){const t=this.Xu(Ei)||"An unknown browser";return{name:this.tv(t),zu:t,version:this.iv(null===navigator||void 0===navigator?void 0:navigator.appVersion)||this.iv(null===navigator||void 0===navigator?void 0:navigator.userAgent)||"an unknown version",Qu:this.ev(this.Xu(Di))}}tv(t){switch(t){case H.ge:return"microsoft_edge";case H.ce:return"microsoft_ie";case H.de:return"chrome";case H.le:return"firefox";case H.ue:return"opera";case H.ve:return"safari";case H.fe:case H.pe:return"mozilla";default:return"other"}}ev(t){switch(t){case"WIN":return"windows";case"MAC":return"macos";case"bv":return"android";case"IPH":return"iphone";case"IPA":return"ipad";case"IPO":return"ipod";case"LIN":return"linux";default:return"other"}}Xu(t){for(let i=0;i<t.length;i++){const e=t[i].string,s=t[i].prop;if(this.sv=t[i].Ju||t[i].identity,e){if(-1!=e.indexOf(t[i].Wu))return t[i].identity}else if(s)return t[i].identity}}iv(t){try{const i=t.indexOf(this.sv);if(-1==i)return;let e=parseFloat(t.substring(i+this.sv.length+1)).toString();return-1==e.indexOf(".")&&(e+=".0"),e}catch({stack:t,message:i}){"undefined"!=typeof console&&console.error&&console.error("Convert:",t||i)}}}class Li{constructor(){this.name="Request"}process({nv:t}={}){var i,e,s,n,o,r,h,a;this.ed="",this.ov=null!==(i=null===document||void 0===document?void 0:document.referrer)&&void 0!==i?i:"",this.Od=!!this.ov,this.Hu=(new Ai).getInfo(),this.url=new li(null,t),this.rv=Math.round(Date.now()/1e3),this.Md=Boolean((null===(e=this.url.query)||void 0===e?void 0:e[lt.ln])||(null===(s=this.url.query)||void 0===s?void 0:s[lt.un])||(null===(n=this.url.query)||void 0===n?void 0:n[lt.vn])||(null===(o=this.url.query)||void 0===o?void 0:o[lt.gn])),this._d=new li(this.ov),this.userAgent=null===navigator||void 0===navigator?void 0:navigator.userAgent;for(let t=0,i=ot.length;t<i;t++)if(-1!==this.ov.indexOf(null===(r=ot[t])||void 0===r?void 0:r.s)){this.Sd=!0,this._d.query[null===(h=ot[t])||void 0===h?void 0:h.q]&&(this.$d=this._d.query[null===(a=ot[t])||void 0===a?void 0:a.q]);break}this.Sd&&(this.ed="organic"),this.ku={[gt.En]:this.hv(gi[gt.En]),[gt.Dn]:this.hv(gi[gt.Dn]),[gt.An]:this.hv(gi[gt.An]),[gt.Ln]:this.hv(gi[gt.Ln]),[gt.Tn]:this.hv(gi[gt.Tn]),[gt.Nn]:this.hv(gi[gt.Nn]),[gt.Rn]:this.hv(gi[gt.Rn]),[gt.Pn]:this.hv(gi[gt.Pn]),[gt.qn]:this.hv(gi[gt.qn]),[gt.Bn]:this.hv(gi[gt.Bn]),[gt.Vn]:this.hv(gi[gt.Vn])}}av(t){const i=this.hv(gi[t]);return this.ku[t]=i,i}hv(t=[]){let i;for(let e=t.length-1;e>=0;e--)if(void 0!==window[t[e]]){i=window[t[e]];break}return i}}const Ti=!0;class Ni{constructor(t,{t:i}={}){var e,s,n;this.cv=Lt,this.dv="!",this.lv=Ti,this.u=i,this.cv=(null===(e=null==t?void 0:t.rules)||void 0===e?void 0:e.uv)||Lt,this.dv=String((null===(s=null==t?void 0:t.rules)||void 0===s?void 0:s.vv)||"!"),this.lv=(null===(n=null==t?void 0:t.rules)||void 0===n?void 0:n.gv)||Ti,this.p=(null==t?void 0:t.m)||(t=>t)}set uv(t){this.cv=t}get uv(){return this.cv}fv(){return Object.getOwnPropertyNames(this.cv).filter((t=>"function"==typeof this.cv[t]))}pv(t,i,e){let s;if(Object.prototype.hasOwnProperty.call(i,"wv")&&mt(null==i?void 0:i.wv)){for(let e=0,n=i.wv.length;e<n;e++){if(s=this.mv(t,i.wv[e]),!0===s)return s;Object.values(F).includes(s)}if(!1!==s)return s}return!1}Iv(t){return Object.prototype.hasOwnProperty.call(t,"Fr")&&"object"==typeof t.Fr&&Object.prototype.hasOwnProperty.call(t.Fr,"Gr")&&"string"==typeof t.Fr.Gr&&Object.prototype.hasOwnProperty.call(t.Fr,"yv")&&"boolean"==typeof t.Fr.yv&&Object.prototype.hasOwnProperty.call(t,"value")}mv(t,i){let e;if(Object.prototype.hasOwnProperty.call(i,"bv")&&mt(null==i?void 0:i.bv)){for(let s=0,n=i.bv.length;s<n;s++)if(e=this.xv(t,i.bv[s]),!1===e)return!1;return e}return!1}xv(t,i){let e;if(Object.prototype.hasOwnProperty.call(i,"kv")&&mt(null==i?void 0:i.kv)){for(let s=0,n=i.kv.length;s<n;s++)if(e=this.Sv(t,i.kv[s]),!0===e)return e;if(!1!==e)return e}return!1}Sv(t,i){var e;if(this.Iv(i))try{const s=i.Fr.yv||!1,n=i.Fr.Gr;if(-1!==this.fv().indexOf(n)&&t&&"object"==typeof t)if(this._v(t)){if(null==i?void 0:i.$v)for(const o of Object.getOwnPropertyNames(t.constructor.prototype)){if("constructor"===o)continue;const r=jt(`get ${i.$v.replace(/_/g," ")}`);if(o===r||(null===(e=null==t?void 0:t.m)||void 0===e?void 0:e.call(t,o))===r){const e=t[o](i);return Object.values(F).includes(e)||"js_condition"===i.$v?e:this.cv[n](e,i.value,s)}}}else if(bt(t))for(const e of Object.keys(t)){const o=this.lv?e:e.toLowerCase();if(o===(this.lv?i.key:String(i.key).toLowerCase()))return this.cv[n](t[e],i.value,s)}}catch(t){}return!1}_v(t){return bt(t)&&Object.prototype.hasOwnProperty.call(t,"name")&&"RuleData"===t.name}}var Ri;!function(t){t.th="config",t.Ov="signals"}(Ri||(Ri={}));const Pi="convert";function qi(){return new Promise(((t,i)=>{try{const e=indexedDB.open(Pi,1);e.onupgradeneeded=t=>{const i=t.target.result;i.objectStoreNames.contains(Ri.th)||i.createObjectStore(Ri.th,{keyPath:"id",autoIncrement:!0}),i.objectStoreNames.contains(Ri.Ov)||i.createObjectStore(Ri.Ov,{keyPath:"id",autoIncrement:!0})},e.onsuccess=i=>t(i.target.result),e.onerror=t=>i(t.target.error)}catch(t){i(t)}}))}const Bi={add:({key:t,data:i,store:e=Ri.Ov})=>qi().then((s=>new Promise(((n,o)=>{try{const r=s.transaction([e],"readwrite"),h=r.objectStore(e).add(t?Object.assign(Object.assign({},i),{id:t}):i);h.onsuccess=()=>n(h.result),h.onerror=t=>o(t.target.error)}catch(t){o(t)}})))),get:({key:t,store:i=Ri.Ov}={})=>qi().then((e=>new Promise(((s,n)=>{try{const o=e.transaction([i],"readonly").objectStore(i),r=t?o.get(t):o.getAll();r.onsuccess=t=>s(t.target.result),r.onerror=t=>n(t.target.error)}catch(t){n(t)}})))),set:({key:t,data:i,store:e=Ri.Ov})=>qi().then((s=>new Promise(((n,o)=>{try{const r=s.transaction([e],"readwrite"),h=r.objectStore(e).put(Object.assign(Object.assign({},i),{id:t}));h.onsuccess=t=>n(t.target.result),h.onerror=t=>o(t.target.error)}catch(t){o(t)}})))),delete:({key:t,store:i=Ri.Ov}={})=>t?qi().then((e=>new Promise(((s,n)=>{try{const o=e.transaction([i],"readwrite"),r=o.objectStore(i).delete(t);r.onsuccess=t=>s(t.target.result),r.onerror=t=>n(t.target.error)}catch(t){n(t)}})))):qi().then((t=>new Promise(((e,s)=>{try{const n=t.transaction([i],"readwrite"),o=n.objectStore(i).clear();o.onsuccess=()=>e(),o.onerror=t=>s(t.target.error)}catch(t){s(t)}})))),destroy:()=>new Promise(((t,i)=>{try{const e=indexedDB.deleteDatabase(Pi);e.onsuccess=()=>t(),e.onerror=t=>i(t.target.error),e.onblocked=()=>i(new Error(`delete operation for dataabse "${Pi}" is blocked`))}catch(t){i(t)}}))};var Vi;!function(t){t[t.Mv=0]="JSR",t[t.Cv=1]="DEC",t[t.jv=2]="RAG",t[t.Ev=3]="STS",t[t.Dv=4]="SHM",t[t.Av=5]="QUB",t[t.Lv=6]="ZOI",t[t.Tv=7]="BRP",t[t.Nv=8]="RFL",t[t.Rv=9]="RDL",t[t.Pv=10]="HES",t[t.qv=11]="SLO",t[t.Bv=12]="CHA",t[t.Vv=13]="REN",t[t.Uv=14]="SHW"}(Vi||(Vi={}));class Ui{constructor({config:t,data:i,request:e,gh:s,visitor:n,experienceId:o,locationId:r,rh:h,t:a}){this.name="RuleData",this.fh=t,this.ph=i,this.mh=e,this.Oh=s,this.Mh=n,this.xh=h,this.u=a,this.Fv=o,this.Gv=r,this.zv=new Date,this.Hv=this.zv.getDay(),0===this.Hv&&(this.Hv=7);let c=this.zv.getTime()+6e4*this.zv.getTimezoneOffset()+1e3*t.Zc.Wv;(t=>{const i=new Date,e=new Date(i.getFullYear(),0,1),s=new Date(i.getFullYear(),6,1),n=Math.max(e.getTimezoneOffset(),s.getTimezoneOffset());return Boolean(t.getTimezoneOffset()<n)})(this.zv)&&(c+=36e5),this.Jv=new Date(c),this.Kv=this.Jv.getDay(),0===this.Kv&&(this.Kv=7),this.m=t=>Ht(t,!0)}get(){return this.Oh.mu()}Qv(t){const i=Gt(this.mh.url.href,t,!1);return new li(i).sh()}Yv(t){return Gt(this.mh.url.href,t,!0)}Zv(t){t.value;return this.mh.url.object.query}Xv(t){jt(`get ${t.replace(/_/g," ")}`)}tg(t){t.value;const i=this.mh.av(gt.En);return void 0===i?(this.Xv("page_tag_page_type"),F.Hi):i}ig(t){t.value;const i=this.mh.av(gt.Dn);return void 0===i?(this.Xv("page_tag_category_id"),F.Hi):i}eg(t){t.value;const i=this.mh.av(gt.An);return void 0===i?(this.Xv("page_tag_category_name"),F.Hi):i}sg(t){t.value;const i=this.mh.av(gt.Ln);return void 0===i?(this.Xv("page_tag_product_sku"),F.Hi):i}ng(t){t.value;const i=this.mh.av(gt.Tn);return void 0===i?(this.Xv("page_tag_product_name"),F.Hi):i}og(t){t.value;const i=this.mh.av(gt.Nn);return void 0===i?(this.Xv("page_tag_product_price"),F.Hi):i}rg(t){t.value;const i=this.mh.av(gt.Rn);return void 0===i?(this.Xv("page_tag_customer_id"),F.Hi):i}hg(t){t.value;const i=this.mh.av(gt.Pn);return void 0===i?(this.Xv("page_tag_custom_1"),F.Hi):i}ag(t){t.value;const i=this.mh.av(gt.qn);return void 0===i?(this.Xv("page_tag_custom_2"),F.Hi):i}cg(t){t.value;const i=this.mh.av(gt.Bn);return void 0===i?(this.Xv("page_tag_custom_3"),F.Hi):i}dg(t){t.value;const i=this.mh.av(gt.Vn);return void 0===i?(this.Xv("page_tag_custom_4"),F.Hi):i}lg(t){var i,e,s;t.value;return(null===(s=null===(e=null===(i=this.Mh.td)||void 0===i?void 0:i[Ht("current")])||void 0===e?void 0:e[Ht("condition")])||void 0===s?void 0:s[Ht("text")])||F.Wi}ug(t){var i;let e;try{let i=t.value;const convertContext={experienceId:this.Fv,locationId:this.Gv};switch(typeof i){case"string":i=this.Fv||this.Gv?i.replace(/convert_recheck_(experiment|experience)[\s]*\([\s]*\)/g,`convert.executeExperienceLooped(${this.Fv?`{experienceId: '${this.Fv}'}`:`{locationId: '${this.Gv}'}`})`).replace(/convert_trigger_(experiment|experience)[\s]*\([\s]*\)/g,`convert.executeExperience(${this.Fv?`{experienceId: '${this.Fv}'}`:`{locationId: '${this.Gv}'}`})`):i.replace(/convert_recheck_(experiment|experience)[\s]*\([\s]*\).*[;]?/g,"").replace(/convert_trigger_(experiment|experience)[\s]*\([\s]*\).*[;]?/g,""),e=Function(`return ${i}`)(),"function"==typeof e&&(e=e(convertContext));break;case"function":e=i(convertContext)}}catch({stack:s,message:n}){if(e=!1,null===(i=this.ph)||void 0===i?void 0:i.vg){const i={data:{type:Vi.Mv,experienceId:this.Fv,locationId:this.Gv,code:String(t.value),stack:s,message:n}};Bi.add(i),this.xh.I(dt.Bs,i)}}return e}gg(t){var i;t.value;return null===(i=this.Mh.device)||void 0===i?void 0:i[Ht("desktop")]}fg(t){var i;t.value;return null===(i=this.Mh.device)||void 0===i?void 0:i[Ht("mobile")]}pg(t){var i;t.value;return null===(i=this.Mh.device)||void 0===i?void 0:i[Ht("tablet")]}wg(t){t.value;return this.mh.userAgent}mg(t){t.value;return this.mh.Hu.Qu}Ig(t){t.value;return this.mh.Hu.version}yg(t){t.value;return this.mh.Hu.name}bg(t){t.value;return this.Jv.getMinutes()}xg(t){t.value;return this.Jv.getHours()}kg(t){t.value;return this.Kv}Sg(t){t.value;return this.zv.getMinutes()}_g(t){t.value;return this.zv.getHours()}$g(t){t.value;return this.Hv}Og(t){t.value;return this.Mh.gh}Mg(t){var i;let e=!1;for(const t in this.Mh.oa)if(this.Mh.oa[t]&&"1"!==this.Mh.oa[t][ct.Ai]&&(null===(i=this.fh.oa[t])||void 0===i?void 0:i.type)!==h&&t!==this.Fv&&this.fh.oa[t]){e=!0;break}t.value;return e}Cg(t){t.value;return this.Mh.ad}jg(t){t.value;return this.Mh.yd?Q.Te:Q.NEW}Eg(t){t.value;return this.Mh.cookies.get(t.key)}Dg(t){const i=new Date,e=Math.round(i.getTime()/1e3);t.value;return e-this.Mh.rd}Ag(t){t.value;return this.Mh.Bc}Lg(t){t.value;return this.Mh.dd}Tg(t){t.value;return this.mh.Hu.lang}Ng(t){t.value;return this.Mh.hd?(this.mh.rv-this.Mh.hd)/86400:0}Rg(t){var i,e;t.value;return"string"==typeof(null===(i=this.Mh.Xc)||void 0===i?void 0:i[Ht("state")])?null===(e=this.Mh.Xc)||void 0===e?void 0:e[Ht("state")]:F.Wi}Pg(t){var i,e;t.value;return"string"==typeof(null===(i=this.Mh.Xc)||void 0===i?void 0:i[Ht("country")])?null===(e=this.Mh.Xc)||void 0===e?void 0:e[Ht("country")]:F.Wi}qg(t){var i,e;t.value;return"string"==typeof(null===(i=this.Mh.Xc)||void 0===i?void 0:i[Ht("city")])?null===(e=this.Mh.Xc)||void 0===e?void 0:e[Ht("city")]:F.Wi}Bg(t){t.value;return Math.round((this.mh.rv-this.Mh.od)/this.Mh.dd)}Vg(t){t.value;return this.Mh.source}Ug(t){t.value;return this.Mh.ed}Fg(t){t.value;return this.Mh.sd}Gg(t){t.value;return this.Mh.nd}}class Fi{constructor({config:t,data:i,request:e,zg:s,rh:n,t:o}){this.name="RuleProcessor",this.fh=t,this.ph=i,this.mh=e,this.Hg=s,this.xh=n,this.u=o}getData({gh:t,visitor:i,experienceId:e,locationId:s}){return new Ui({config:this.fh,data:this.ph,request:this.mh,gh:t,visitor:i,experienceId:e,locationId:s,rh:this.xh,t:this.u})}process({rules:t,gh:i,visitor:e,experienceId:s,locationId:n,Fl:o}){if(!t)return!1;const r=this.getData({gh:i,visitor:e,experienceId:s,locationId:n}),h=Array.isArray(t)?t:[t];for(const t of h){const i=this.Hg.pv(r,t,o);if(!1!==i)return i}return!1}}class Gi{constructor(t,{t:i}={}){var e,s;this.Wg=1e4,this.Jg=9999,this.u=i,this.Wg=(null===(e=null==t?void 0:t.Sa)||void 0===e?void 0:e.Kg)||1e4,this.Jg=(null===(s=null==t?void 0:t.Sa)||void 0===s?void 0:s.Qg)||9999}Yg(t,i,e=0){let s=null,n=0;return Object.keys(t).some((o=>(n+=100*t[o]+e,i<n&&(s=o,!0)))),s||null}Zg(t,i){const{seed:e=this.Jg,experienceId:s=""}=i||{},n=Et(s+String(t),e)/4294967296*this.Wg;return parseInt(String(n),10)}Xg(t,i,e){const s=this.Zg(i,e),n=this.Yg(t,s,null==e?void 0:e.tf);return n?{Bh:n,xa:s}:null}}const zi={"Content-Type":"application/json"},Hi="https://cdn-4.convertexperiments.com/api/v1/config-js",Wi="https://[project_id].metrics.convertexperiments.com/v1";class Ji{constructor(t,{rh:i,t:e}={}){var s,n,o,r,h,a,c,d,l,u,v,g;this.if=Hi,this.ef=Wi,this.sf=zi,this.nf=10,this.rf=1e4,this.u=e,this.xh=i,this.if=(null===(n=null===(s=null==t?void 0:t.hf)||void 0===s?void 0:s.endpoint)||void 0===n?void 0:n.config)||Hi,this.ef=(null===(r=null===(o=null==t?void 0:t.hf)||void 0===o?void 0:o.endpoint)||void 0===r?void 0:r.track)||Wi,this.ph=It(t,"data"),this.af=!It(t,"dataStore"),this.cf=null==t?void 0:t.Qa,this.p=(null==t?void 0:t.m)||(t=>t),this.nf=Number(null===(h=null==t?void 0:t.df)||void 0===h?void 0:h.lf)||10,this.rf=Number(null===(a=null==t?void 0:t.df)||void 0===a?void 0:a.uf)||1e4,this.vf=null===(c=this.ph)||void 0===c?void 0:c.yu,this.gf=null===(l=null===(d=this.ph)||void 0===d?void 0:d.Zc)||void 0===l?void 0:l.id,this.ff=(null==t?void 0:t.pf)||`${this.vf}/${this.gf}`,(null==t?void 0:t.wf)&&(this.sf.mf=`Bearer ${null==t?void 0:t.wf}`),this.If={yf:this.af,bf:this.vf,Wd:this.gf,xf:[]},this.kf=null===(u=null==t?void 0:t.Sf)||void 0===u?void 0:u._f,this.$f=(null===(v=null==t?void 0:t.Sf)||void 0===v?void 0:v.source)||"js-sdk",this.Of=null===(g=null==t?void 0:t.Sf)||void 0===g?void 0:g.Mf,this.gu={length:0,items:[],push(t,i,e){const s=this.items.findIndex((i=>i.zh===t));if(-1!==s)this.items[s].df.push(i);else{const s={zh:t,df:[i]};e&&(s.gh=e),this.items.push(s)}this.length++},reset(){this.items=[],this.length=0}}}request(t,e){return i(this,arguments,void 0,(function*(t,i,e={},s={}){const n=Object.assign(Object.assign({},this.sf),s),o={method:t,path:i.Cf,kr:i.jf,headers:n,data:e,responseType:"json"};return Rt.request(o)}))}enqueue(t,i,e){this.gu.push(t,i,e),this.kf&&(1===this.gu.length?this._u():this.gu.length===this.nf&&this.Su("size").then())}Su(t){if(!this.gu.length)return;this.$u();const i=this.If;return i.xf=this.gu.items.slice(),i.source=this.$f,this.request("post",{jf:this.ef.replace("[project_id]",this.gf.toString()),Cf:`/track/${this.ff}`},this.p(i)).then((e=>{var s,n;this.gu.reset(),null===(n=null===(s=this.xh)||void 0===s?void 0:s.I)||void 0===n||n.call(s,G.Qi,{reason:t,result:e,xf:i.xf})})).catch((i=>{var e,s;this._u(),null===(s=null===(e=this.xh)||void 0===e?void 0:e.I)||void 0===s||s.call(e,G.Qi,{reason:t},i)}))}$u(){clearTimeout(this.Ou)}_u(){this.Ou=setTimeout((()=>{this.Su("timeout")}),this.rf)}Ja(){this.kf=!0,this.Su("trackingEnabled")}Ef(){this.kf=!1}setData(t){var i;this.ph=t,this.vf=null==t?void 0:t.yu,this.gf=null===(i=null==t?void 0:t.Zc)||void 0===i?void 0:i.id,this.If.bf=this.vf,this.If.Wd=this.gf}Df(){let t="low"===this.Of||this.cf?"?":"";return this.cf&&(t+=`environment=${this.cf}`),"low"===this.Of&&(t+="_conv_low_cache=1"),new Promise(((i,e)=>{this.request("get",{jf:this.if,Cf:`/config/${this.ff}${t}`}).then((({data:t})=>i(t))).catch(e)}))}}class Ki{constructor(t,{nh:i,rh:e,t:s}={}){var n,o;this.nf=1,this.rf=5e3,this.u=s,this.xh=e,this.nf=Number(null===(n=null==t?void 0:t.df)||void 0===n?void 0:n.lf)||1,this.rf=Number(null===(o=null==t?void 0:t.df)||void 0===o?void 0:o.uf)||5e3,this.nh=i,this.p=(null==t?void 0:t.m)||(t=>t),this.gu={}}set(t,i){var e,s;try{null===(s=null===(e=this.nh)||void 0===e?void 0:e.set)||void 0===s||s.call(e,t,i)}catch(t){}}get(t){var i,e;try{return null===(e=null===(i=this.nh)||void 0===i?void 0:i.get)||void 0===e?void 0:e.call(i,t)}catch(t){}return null}enqueue(t,i){const e={};e[t]=i,this.gu=yt(this.gu,e),Object.keys(this.gu).length>=this.nf?this.Su("size"):1===Object.keys(this.gu).length&&this._u()}Su(t){var i,e;this.$u();for(const t in this.gu)this.set(t,this.gu[t]);null===(e=null===(i=this.xh)||void 0===i?void 0:i.I)||void 0===e||e.call(i,G.ee,{reason:t||""})}$u(){clearTimeout(this.Ou)}_u(){this.Ou=setTimeout((()=>{this.Su("timeout")}),this.rf)}set nh(t){t&&this.Af(t)&&(this.bh=t)}get nh(){return this.bh}Af(t){return"object"==typeof t&&"function"==typeof t.get&&"function"==typeof t.set}}class Qi{constructor(t,{Lf:i,zg:e,rh:s,uu:n,t:o},{Tf:r=!0}={}){var h,a,c;this.Nf=E,this.Rf=1e4,this.Pf=new Map,this.cf=null==t?void 0:t.Qa,this.vu=n,this.qf=i,this.Hg=e,this.u=o,this.xh=s,this.fh=t,this.p=(null==t?void 0:t.m)||(t=>t),this.Bf=r,this.ph=It(t,"data"),this.vf=null===(h=this.ph)||void 0===h?void 0:h.yu,this.gf=null===(c=null===(a=this.ph)||void 0===a?void 0:a.Zc)||void 0===c?void 0:c.id,this.Vf=null==t?void 0:t.nh}set data(t){var i;this.Uf(t)&&(this.ph=t,this.vf=null==t?void 0:t.yu,this.gf=null===(i=null==t?void 0:t.Zc)||void 0===i?void 0:i.id)}get data(){return this.ph}set Vf(t){this.Ff=null,t&&(this.Ff=new Ki(this.fh,{nh:t,rh:this.xh,t:this.u}))}get Vf(){return this.Ff}Gf(t){this.Ff=null,t&&(this.Ff=new Ki(this.fh,{nh:t,rh:this.xh,t:this.u}))}zf(t,i,e="key",o){var r;const{Ga:h,Hf:a,Ka:c,Qa:d=this.cf}=o,l=this.Wf(i,"oa",e);if(!l)return null;if(!!this.Jf("md").find((t=>String(null==l?void 0:l.id)===String(t))))return null;if(!(!(null==l?void 0:l.Qa)||l.Qa===d))return null;let u=[];const{Sa:v}=this.getData(t)||{},{[l.id.toString()]:g}=v||{};let f=!1;g&&this.Kf(l.id,String(g))&&(f=!0);let p=!0===c;if(!p&&a)if(Array.isArray(null==l?void 0:l.Ta)&&l.Ta.length){let i=[];const s=this.Qf(l.Ta,"Ta");if(s.length&&(i=this.Yf(t,s,{Hf:a,Zf:e}),u=i.filter((t=>Object.values(F).includes(t))),u.length))return u[0];p=Boolean(i.length)}else if(null==l?void 0:l.Xf){if(p=this.Hg.pv(a,l.Xf,"SiteArea"),Object.values(F).includes(p))return p}else p=!0;if(!p)return null;let w=[],m=[],I=[],y=[],b=[],x=!1,k=!1;if(h)if(Array.isArray(null==l?void 0:l.tp)&&l.tp.length)if(w=this.Qf(l.tp,"tp"),b=w.filter((t=>!(f&&t.type===s))),b.length){if(I=this.ip(b,h,"audience",e),u=I.filter((t=>Object.values(F).includes(t))),u.length)return u[0];if(I.length)for(const t of I);x=l.Nl.ep.tp===n?Boolean(I.length===b.length):Boolean(I.length)}else x=!0;else x=!0;if(m=this.Qf(l.tp,"gh"),m.length){if(y=this.sp(m,t),y.length)for(const t of y);k=Boolean(y.length)}else k=!0;return x&&k&&(null==l?void 0:l.Za)&&(null===(r=null==l?void 0:l.Za)||void 0===r?void 0:r.length)?l:null}np(t,i,e="key",s){const{Ga:n,Hf:o,za:r,Ha:h,Ja:a=!0,Ka:c,Qa:d=this.cf}=s,l=this.zf(t,i,e,{Ga:n,Hf:o,Ka:c,Qa:d});return l?Object.values(F).includes(l)?l:this.op(t,n,r,l,h,a):null}op(t,i,e,s,n,o=!0){var r,h,a;if(!t||!s)return null;if(!(null==s?void 0:s.id))return null;let d,l,u=null,v=null;this.rp(t),n&&(u=this.Kf(s.id,String(n)))&&(d=n);const{Sa:g,gh:f}=this.getData(t)||{},{[s.id.toString()]:p}=g||{};if(!p||d&&String(d)!==String(p)||!(u=this.Kf(s.id,String(p)))){const n=s.Za.filter((t=>!(null==t?void 0:t.status)||t.status===c)).filter((t=>(null==t?void 0:t.hp)>0||isNaN(null==t?void 0:t.hp))).reduce(((t,i)=>((null==i?void 0:i.id)&&(t[i.id]=(null==i?void 0:i.hp)||100),t)),{}),v=this.qf.Xg(n,t,(null===(h=null===(r=this.fh)||void 0===r?void 0:r.Sa)||void 0===h?void 0:h.ap)?null:{experienceId:s.id.toString()});if(d=d||(null==v?void 0:v.Bh),l=null==v?void 0:v.xa,!d)return C.fi;if(e?this.ka(t,Object.assign({Sa:{[s.id.toString()]:d}},i?{gh:i}:{})):this.ka(t,{Sa:{[s.id.toString()]:d}}),o){const e={experienceId:s.id.toString(),Bh:d.toString()},n={_a:_,data:e},o=this.Hg._v(i)?(null===(a=null==i?void 0:i.get)||void 0===a?void 0:a.call(i))||{}:f;this.vu.enqueue(t,n,o)}u=this.Kf(s.id,String(d))}else d=p;return u&&(v=Object.assign(Object.assign({experienceId:null==s?void 0:s.id,ec:null==s?void 0:s.name,cp:null==s?void 0:s.key},{xa:l}),u)),v}Kf(t,i){return this.dp("oa",t,"Za",i,"id","id")}reset(){this.Pf=new Map}ka(i,e={}){const s=this.rp(i),n=this.getData(i)||{};if(!xt(n,e)){const i=yt(n,e);if(this.Pf.set(s,i),this.Pf.size>this.Rf)for(const[t]of this.Pf){this.Pf.delete(t);break}if(this.Vf){const{gh:o={}}=n,r=t(n,["gh"]),{gh:h={}}=this.lp(o),{gh:a}=this.lp((null==e?void 0:e.gh)||{});a?this.Bf?this.Vf.enqueue(s,yt(r,{gh:Object.assign(Object.assign({},h),a)})):this.Vf.set(s,yt(r,{gh:Object.assign(Object.assign({},h),a)})):this.Bf?this.Vf.enqueue(s,i):this.Vf.set(s,i)}}}getData(t){const i=this.rp(t),e=this.Pf.get(i)||null;return this.Vf?yt(e||{},this.Vf.get(i)||{}):e}rp(t){return`${this.vf}-${this.gf}-${t}`}Yf(t,i,e){var s,n,o,r,h,a,c,d,l,u;const{Hf:v,Zf:g="key",up:f}=e,{Ta:p=[]}=this.getData(t)||{},w=[];let m;if(mt(i))for(let e=0,I=i.length;e<I;e++){if(!(null===(s=null==i?void 0:i[e])||void 0===s?void 0:s.rules))continue;m=this.Hg.pv(v,i[e].rules,`ConfigLocation #${i[e][g]}`);const I=null===(r=null===(o=null===(n=null==i?void 0:i[e])||void 0===n?void 0:n[g])||void 0===o?void 0:o.toString)||void 0===r?void 0:r.call(o);if(!0===m)p.includes(I)&&!f||this.xh.I(G.Xi,{zh:t,location:{id:null===(h=null==i?void 0:i[e])||void 0===h?void 0:h.id,key:null===(a=null==i?void 0:i[e])||void 0===a?void 0:a.key,name:null===(c=null==i?void 0:i[e])||void 0===c?void 0:c.name}},null,!0),p.includes(I)||p.push(I),w.push(i[e]);else if(!1!==m)w.push(m);else if(!1===m&&p.includes(I)){this.xh.I(G.te,{zh:t,location:{id:null===(d=null==i?void 0:i[e])||void 0===d?void 0:d.id,key:null===(l=null==i?void 0:i[e])||void 0===l?void 0:l.key,name:null===(u=null==i?void 0:i[e])||void 0===u?void 0:u.name}},null,!0);const s=p.findIndex((t=>t===I));p.splice(s,1)}}return this.ka(t,{Ta:p}),w}vp(t,i,e){return this.np(t,i,"key",e)}gp(t,i,e){return this.np(t,i,"id",e)}convert(t,i,e,s,n,o){const r="string"==typeof i?this.fp(i,"Bc"):this.pp(i,"Bc");if(!(null==r?void 0:r.id))return;if(e){if(!(null==r?void 0:r.rules))return;const t=this.Hg.pv(e,r.rules,`ConfigGoal #${i}`);if(Object.values(F).includes(t))return t;if(!t)return}const h=null==o?void 0:o[j.pi],{Sa:a,Bc:{[i.toString()]:c}={}}=this.getData(t)||{};if(!c||h)return this.ka(t,{Bc:{[i.toString()]:!0}}),c||function(){const i={Hd:r.id};a&&(i.Wl=a);const e={_a:$,data:i};this.vu.enqueue(t,e,n)}.call(this),!s||c&&!h||function(){const i={Hd:r.id,Ql:s};a&&(i.Wl=a);const e={_a:$,data:i};this.vu.enqueue(t,e,n)}.call(this),!0}ip(t,i,e,s="id"){var n;const o=[];let r;if(mt(t))for(let h=0,a=t.length;h<a;h++)(null===(n=null==t?void 0:t[h])||void 0===n?void 0:n.rules)&&(r=this.Hg.pv(i,t[h].rules,`${jt(e)} #${t[h][s]}`),!0===r?o.push(t[h]):!1!==r&&o.push(r));return o}sp(t,i){var e;const{gh:{[J.Ee]:s=[]}={}}=this.getData(i)||{},n=[];if(mt(t))for(let i=0,o=t.length;i<o;i++)(null===(e=null==t?void 0:t[i])||void 0===e?void 0:e.id)&&s.includes(t[i].id)&&n.push(t[i]);return n}lp(t){const i=Object.values(J).map((t=>t)),e={},s={};for(const n in t)i.includes(n)?e[n]=t[n]:s[n]=t[n];return{properties:Object.keys(s).length?s:null,gh:Object.keys(e).length?e:null}}Jf(t){let i=[];const e=D[t]||t;return-1!==this.Nf.indexOf(e)&&(i=It(this.ph,e)||[]),i}wp(t,i="id"){return this.Jf(t).reduce(((t,e)=>(t[e[i]]=e,t)),{})}Wf(t,i,e="key"){var s;const n=D[i]||i,o=this.Jf(n);if(mt(o))for(let i=0,n=o.length;i<n;i++)if(o[i]&&String(null===(s=o[i])||void 0===s?void 0:s[e])===String(t))return o[i];return null}fp(t,i){return this.Wf(t,i,"key")}mp(t,i){return this.Ip(t,i)}pp(t,i){return this.Wf(t,i,"id")}yp(t,i){return this.Qf(t,i)}Ip(t,i){var e;const s=this.Jf(i),n=[];if(mt(s))for(let i=0,o=s.length;i<o;i++)-1!==t.indexOf(null===(e=s[i])||void 0===e?void 0:e.key)&&n.push(s[i]);return n}Qf(t,i){var e;const s=[];if(mt(t)){const n=this.Jf(i);if(mt(n))for(let i=0,o=n.length;i<o;i++)-1!==t.indexOf(null===(e=n[i])||void 0===e?void 0:e.id)&&s.push(n[i])}return s}dp(t,i,e,s,n,o){const r=this.Wf(i,t,n);for(const t of r[e])if(t[o]===s)return t;return null}Uf(t){var i;return bt(t)&&(!!(null==t?void 0:t.yu)&&!!(null===(i=null==t?void 0:t.Zc)||void 0===i?void 0:i.id)||Boolean(t.error))}}class Yi{constructor(t,{ah:i,t:e}){this.Sh=i,this.u=e}bp(){return this.Sh.Jf("oa")}xp(t){return this.Sh.fp(t,"oa")}kp(t){return this.Sh.pp(t,"oa")}Sp(t){return this.Sh.Ip(t,"oa")}_p(t,i,e){return this.Sh.vp(t,i,e)}Fa(t,i,e){return this.Sh.gp(t,i,e)}$p(t,i){return this.bp().map((e=>this._p(t,null==e?void 0:e.key,i))).filter((t=>t&&!Object.values(F).includes(t)&&!Object.values(C).includes(t)))}Op(t,i){return this.Sh.dp("oa",t,"Za",i,"key","key")}Mp(t,i){return this.Sh.dp("oa",t,"Za",i,"id","id")}}var Zi;!function(t){t.Cp="js",t.jp="custom_js",t.Ep="css",t.Dp="page_id",t.oi="selector",t.Ap="original_pattern",t.Lp="variation_pattern",t.Tp="case_sensitive"}(Zi||(Zi={}));class Xi{constructor(){this.Np=[]}get clone(){return[].concat(this.Np)}get size(){return this.Np.length}get Rp(){return 0===this.Np.length}get Pp(){return this.Np[0]}enqueue(t){-1===this.Np.findIndex((i=>xt(i,t)))&&this.Np.push(t)}qp(){return this.Np.shift()}remove(t){const i=this.Np.findIndex((i=>xt(i,t)));if(-1!==i)return this.Np.splice(i,1)}}const te={get(t=0){return this.element?(Array.isArray(this.element)&&(this.element=this.element[t]),this):this},find(t){const i=bt(this)?document:this;return"object"==typeof t?this.element=t:(t.startsWith(">")&&(t=`* ${t}`),this.element=Array.prototype.slice.apply(i.querySelectorAll(t))),Array.isArray(this.element)&&(this.element=1===this.element.length?this.element[0]:this.element),this},filter(t){return this.element?"function"==typeof t?(this.element=Array.prototype.filter.call(this,t),this):this.find(t):this},after(t){return this.element?(Array.isArray(this.element)||this.element.insertAdjacentHTML("afterend",t),this):this},before(t){return Array.isArray(this.element)||this.element.insertAdjacentHTML("beforebegin",t),this},clone(){var t,i,e,s,n,o;return this.element?(Array.isArray(this.element)||(this.element=null===(i=null===(t=this.element)||void 0===t?void 0:t.cloneNode)||void 0===i?void 0:i.call(t,!0),(null===(s=null===(e=this.element)||void 0===e?void 0:e.getAttribute)||void 0===s?void 0:s.call(e,"id"))&&this.element.setAttribute("id",`${this.element.getAttribute("id")}-${performance.now()}`),(null===(o=null===(n=this.element)||void 0===n?void 0:n.getAttribute)||void 0===o?void 0:o.call(n,"name"))&&this.element.setAttribute("name",`${this.element.getAttribute("name")}-${performance.now()}`)),this):this},empty(){if(!this.element)return this;if(Array.isArray(this.element))return this;for(;this.element.firstChild;)this.element.removeChild(this.element.firstChild);return this},each(t,i){if(!this.element)return this;if(Array.isArray(t))t.forEach(((t,e)=>i(e,t)));else{if(Array.isArray(this.element))return this;Array.prototype.forEach.call(this.element,((i,e)=>t(e,i)))}return this},next(){return this.element?(Array.isArray(this.element)||(this.element=this.element.nextElementSibling),this):this},prev(){return this.element?(Array.isArray(this.element)||(this.element=this.element.previousElementSibling),this):this},parent(){return this.element?(this.element=this.element.parentNode,this):this},append(t){return this.element?(Array.isArray(this.element)||("string"==typeof t?this.element.insertAdjacentHTML("beforeend",t):this.element.appendChild(t)),this):this},prepend(t){return this.element?(Array.isArray(this.element)||("string"==typeof t?this.element.insertAdjacentHTML("afterbegin",t):this.element.insertBefore(t,this.element.firstChild)),this):this},Bp(t){if(!this.element)return this;if(Array.isArray(this.element))return this;const i=this.find("string"==typeof t?t:null==t?void 0:t.element);return i?(Array.isArray(i)||("string"==typeof t?i.insertAdjacentHTML("afterbegin",t):i.insertBefore(this.element,i.firstChild)),this):this},remove(){var t,i;return this.element?(Array.isArray(this.element)||null===(i=null===(t=this.element.parentNode)||void 0===t?void 0:t.removeChild)||void 0===i||i.call(t,this),this):this},html(t){return this.element?Array.isArray(this.element)?this:t?(this.element.innerHTML=t,this):this.element.innerHTML:this},text(t){return this.element?Array.isArray(this.element)?this:t?(this.element.textContent=t,this):this.element.textContent:this},val(t){return this.element?Array.isArray(this.element)?this:t?(this.element.value=t,this):this.element.value:this},addClass(t){return this.element?(Array.isArray(this.element)||this.element.classList.add(t),this):this},removeClass(t){return this.element?(Array.isArray(this.element)||this.element.classList.remove(t),this):this},hasClass(t){return this.element?Array.isArray(this.element)?this:this.element.classList.contains(t):this},toggleClass(t){return this.element?(Array.isArray(this.element)||this.element.classList.toggle(t),this):this},replaceWith(t){return this.element?(Array.isArray(this.element)||(this.element.outerHTML=t),this):this},show(){return this.element?(Array.isArray(this.element)||(this.element.style.display="initial"),this):this},hide(){return this.element?(Array.isArray(this.element)||(this.element.style.display="none"),this):this},prop(t,i){return this.element?Array.isArray(this.element)?this:i?(this.element[t]=i,this):this.element[t]:this},attr(t,i){return this.element?Array.isArray(this.element)?this:i?(this.element.setAttribute(t,i),this):this.element.getAttribute(t):this},removeAttr(t){return this.element?(Array.isArray(this.element)||this.element.removeAttribute(t),this):this},css(t,i){if(!this.element)return this;if(Array.isArray(this.element))return this;if(i){if("cssText"===t){const t=Object.fromEntries(i.split(";").map((t=>t.split(":").map((t=>t.trim())))).filter((t=>2===t.length)));let e=this.element.getAttribute("style")||"";e.endsWith(";")&&(e=e.slice(0,-1));for(const i in t)new RegExp(`${i}:(\\s+|\\s)?${t[i]}`,"i").test(e)||this.element.setAttribute("style",`${e?`${e};`:""}${i}: ${t[i]}`)}else this.element.style[jt(t)]=i;return this}return getComputedStyle(this.element)[t]},height(t){return this.element?Array.isArray(this.element)?this:t?("function"==typeof t?t():this.element.style.height="string"==typeof t?t:`${t}px`,this):parseFloat(getComputedStyle(this.element,null).height.replace(/(px|em|rem)/g,"")):this},width(t){return this.element?Array.isArray(this.element)?this:t?("function"==typeof t?t():this.element.style.width="string"==typeof t?t:`${t}px`,this):parseFloat(getComputedStyle(this.element,null).width.replace(/(px|em|rem)/g,"")):this},outerHeight(t){if(!this.element)return this;if(Array.isArray(this.element))return this;if(t){let t=this.element.offsetHeight;const i=getComputedStyle(this.element);return t+=parseInt(i.marginTop)+parseInt(i.marginBottom),t}return this.element.offsetHeight},outerWidth(t){if(!this.element)return this;if(Array.isArray(this.element))return this;if(t){let t=this.element.offsetWidth;const i=getComputedStyle(this.element);return t+=parseInt(i.marginLeft)+parseInt(i.marginRight),t}return this.element.offsetWidth},ready(t){return document.readyState!==qt.LOADING?t():document.addEventListener(Vt.Tr,t),this}};function ie(t){return"function"==typeof t?(te.ready(t),this):te.find(t)}var ee,se,ne;Object.assign(ie,te),function(t){t.Vp="legacy",t.Up="latest"}(ee||(ee={})),function(t){t.Fp="a",t.Gp="body",t.zp="form"}(se||(se={})),function(t){t.Hp="in_view",t.CHANGE="change"}(ne||(ne={}));const oe={attributes:!0,childList:!0,subtree:!0,characterData:!0};class re{constructor({config:t,data:i,state:e,nh:s,request:n,visitor:o,Vc:r,Wp:h,remote:a,oh:c,rh:d,t:l}){var u,v,g,f;this.name="Render",this.Jp=new Map,this.Kp=new Map,this.fh=t,this.ph=i,this.bh=s,this.wh=e,this.mh=n,this.Mh=o,this.Qp=r,this.Yp=h,this.Ih=a,this.yh=c,this.xh=d,this.u=l,this.reset(),this.Zp=!0,this.Xp=null,this.tw=0,this.iw=!1,this.ew=!1,this.sw=Date.now(),this.nw=0,this.ow={rw:[],hw:[]},this.aw=[],this.cw=!1,this.dw=1,this.lw={};const{[lt.en]:p=X}=this.mh.url.query;this.uw=Number(p),null===(u=this.ph)||void 0===u||u.gw,this.fw=[],this.Yl=new AbortController,this.pw=(null===(v=this.ph)||void 0===v?void 0:v.ww)||50,(null===(g=this.ph)||void 0===g?void 0:g.mw)&&!this.wh.isDisabled&&(this.Iw=!1,this.yw=new MutationObserver((t=>this.bw(t)))),(null===(f=window.convert)||void 0===f?void 0:f.$)||(window.convert.$=(null===window||void 0===window?void 0:window.jQuery)||ie),window.convert._$=this.query.bind(this),this.yh.xw=()=>this.xw({force:!0}),this.yh.redirect=(t,i)=>this.redirect({url:t,nv:i}),this.yh.refresh=()=>this.refresh(),window.convert[Ht("redirect",!0)]=this.yh.redirect,window.convert[Ht("refresh",!0)]=this.yh.refresh}query(t){var i;(null===(i=window.convert.$)||void 0===i?void 0:i.kw)||this.cw||(this.cw=!0,this.Ih.log({[M.oi]:t},{from:O.ht}));const e=window.convert.$;if(!t)return e;let s;if(t.startsWith("none_"))s=e;else try{s=e(t)}catch({message:t}){}return s}reset({Sw:t}={}){var i,e,s;if(this._w)for(const{node:t}of this._w)null===(i=null==t?void 0:t.remove)||void 0===i||i.call(t);if(this._w=[],this.$w={},this.Ow={},this.Mw={},this.ow={rw:[],hw:[]},this.aw=[],this.Cw=new Xi,this.jw=new Xi,this.Ew=new Xi,this.Dw=new Xi,!t)try{if(bt(this.wh.Aw)){this.stop();const t=Array.from((null===(e=null===document||void 0===document?void 0:document.querySelectorAll)||void 0===e?void 0:e.call(document,`head style[${tt}]`))||[]);for(const i of t){const t=i.getAttribute(tt);if(this.Lw({Tw:t}))try{null===(s=null==i?void 0:i.remove)||void 0===s||s.call(i)}catch(t){}}this.Nw()&&this.start()}}catch(t){}}Rw(){var t,i;this.Xp=!0;const e=document.querySelector(`style#${it}`);if(this.Pw=setTimeout((()=>this.xw({force:!0})),this.uw),!(null===window||void 0===window?void 0:window._conv_prevent_bodyhide)&&!e){const s=null===(t=document.querySelectorAll("script"))||void 0===t?void 0:t[0];if(s){const t=(null===(i=this.wh)||void 0===i?void 0:i.su)?`nonce="${this.wh.su}"`:"";s.insertAdjacentHTML("afterend",`<style id="${it}" type="text/css" media="all" ${tt} ${t}>body{position:relative;overflow:hidden}body::after{position:absolute;top:0;bottom:0;left:0;right:0;content:"";background:#fff;z-index:2147483647}</style>`);const n=new AbortController;this.fw.push(n),ai((()=>{if(e){const t=getComputedStyle(document.body).getPropertyValue("background-color");e.textContent+=`body::after{background:${t}}`}}),n.signal)}}}xw({force:t,delay:i}={}){var e,s,n,o,r;if(this.Pw&&(clearTimeout(this.Pw),this.Pw=null),(t||this.Zp)&&(!this.Nw()||t)){(this.Cw.size||this.jw.size||this.Ew.size||this.Dw.size)&&(h.call(this),this.qw());const t=[];for(const i in this.$w)for(const e in this.$w[i])for(const s of this.$w[i][e]){const{selector:i,Bw:e}=s;e||t.push(i)}if(t.length)for(const i of t);h.call(this),this.wh.Vw(),this.xh.I(dt.Ps);try{if(!this.Uw){this.Uw=!0;const t=Array.from(this.Kp.values()).reduce(((t,{start:i,end:e})=>t+e-i),0);if(t&&(null===(e=this.ph)||void 0===e?void 0:e.vg)){const i={data:{type:Vi.Vv,element:{id:null===(s=null===document||void 0===document?void 0:document.body)||void 0===s?void 0:s.id,cls:null===(o=null===(n=null===document||void 0===document?void 0:document.body)||void 0===n?void 0:n.classList)||void 0===o?void 0:o.value,tgn:null===(r=null===document||void 0===document?void 0:document.body)||void 0===r?void 0:r.tagName,rnd:t}}};Bi.add(i),this.xh.I(dt.Bs,i)}}}catch({message:t,stack:i}){}}function h(){var t,e,s,n,o,r,h;if(document.querySelector(`style#${it}`)&&!this.Fw){i?(this.Fw=!0,setTimeout((()=>{var t,i;null===(i=null===(t=document.querySelector(`style#${it}`))||void 0===t?void 0:t.remove)||void 0===i||i.call(t)}),i)):null===(e=null===(t=document.querySelector(`style#${it}`))||void 0===t?void 0:t.remove)||void 0===e||e.call(t);try{if(this.Xp){const t=Date.now()-this.sw;if(t&&(null===(s=this.ph)||void 0===s?void 0:s.vg)){const i={data:{type:Vi.Uv,element:{id:null===(n=null===document||void 0===document?void 0:document.body)||void 0===n?void 0:n.id,cls:null===(r=null===(o=null===document||void 0===document?void 0:document.body)||void 0===o?void 0:o.classList)||void 0===r?void 0:r.value,tgn:null===(h=null===document||void 0===document?void 0:document.body)||void 0===h?void 0:h.tagName,shw:t}}};Bi.add(i),this.xh.I(dt.Bs,i)}}}catch({message:t,stack:i}){}this.Xp=!1}}}Nw(){return!this.Xp}Gw(){let t=0;const i=()=>{if(document.readyState===qt.Er||t>=3e3||this.iw)return this.iw=!0,clearTimeout(this.zw),void(this.zw=null);this.process(),t+=50,this.zw=setTimeout(i,50)};i()}Hw(){this.stop(),this.start()}start(){var t;if(!this.ew){if(this.ew=!0,null===(t=this.ph)||void 0===t?void 0:t.mw){if(Boolean(void 0===this.zw)&&!this.iw&&this.Gw(),!this.Nw()&&!this.Iw){this.yw.observe(document,oe),this.Iw=!0;const t=new AbortController;this.fw.push(t),ai((()=>this.process()),t.signal)}}this.process()}}stop(){var t;if(this.ew){this.ew=!1,this.tw=0,this.sw=Date.now(),(null===(t=this.ph)||void 0===t?void 0:t.gw)&&this.Ww&&(clearTimeout(this.Ww),this.Ww=null);for(const t in this.Ow)for(const i in this.Ow[t])for(const e of this.Ow[t][i]){const{event:i,Pl:s}=e;this.Jw({selector:t,event:i,Pl:s})}}}destroy(){var t;try{this.stop(),(null===(t=this.ph)||void 0===t?void 0:t.mw)&&this.yw.disconnect(),this.reset();for(const t of this.fw)t.abort();this.Yl.abort()}catch({message:t}){}}Kw({selector:t,event:i,Pl:e}){i===Ft.Ur?document.removeEventListener(i,(i=>this.Qw({selector:t,event:i,Pl:e})),!0):document.removeEventListener(i,(i=>this.Qw({selector:t,event:i,Pl:e})))}Yw({selector:t,event:i,Pl:e}){const s=`${t}-${i}`;this.Jp.has(s)||this.Jp.set(s,new Set),this.Jp.get(s).has(e)||(this.Jp.get(s).add(e),document.addEventListener(i,(i=>this.Qw({selector:t,event:i,Pl:e})),Boolean(this.Zw)))}Qw({selector:t,event:i,Pl:e}){let s=i.target;s.nodeType===Node.TEXT_NODE&&(s=s.parentElement);let n=[];if("function"==typeof i.composedPath)n=i.composedPath();else{let t=s;for(;t;)n.push(t),t=t.parentElement}for(const i of n)if(i instanceof HTMLElement){if(i.matches&&i.matches(t))return void e();if(i.shadowRoot){if(Array.from(i.shadowRoot.querySelectorAll(t)).length>0)return void e()}}}Jw({selector:t,event:i,Pl:e}){Object.values(ne).includes(i)?this.Xw({selector:t,event:i,Pl:e}):this.Kw({selector:t,event:i,Pl:e})}tm({selector:t,event:i,Pl:e}){Object.values(ne).includes(i)?this.im({selector:t,event:i,Pl:e}):this.Yw({selector:t,event:i,Pl:e})}sm(){this.nm&&(document.removeEventListener(Vt.Nr,this.nm),document.addEventListener(Vt.Nr,this.nm,{passive:!0,signal:this.Yl.signal}))}om(t){const i=t.getBoundingClientRect();return i.top>=0&&i.left>=0&&i.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&i.right<=(window.innerWidth||document.documentElement.clientWidth)}im({selector:t,event:i,Pl:e}){const s=document.querySelector(t);switch(i){case ne.Hp:this.lw[t]=new IntersectionObserver((t=>{t.forEach((t=>{document.readyState!==qt.Er||this.Xp||t.intersectionRatio<.15||e()}))}),{threshold:.15}),this.om(s)&&e(),this.lw[t].observe(s);break;case ne.CHANGE:this.lw[t]=new MutationObserver((()=>{document.readyState!==qt.Er||this.Xp||e()})),this.lw[t].observe(s,oe)}}Xw({selector:t,event:i,Pl:e}){var s,n;switch(i){case ne.Hp:case ne.CHANGE:null===(n=null===(s=this.lw[t])||void 0===s?void 0:s.disconnect)||void 0===n||n.call(s),delete this.lw[t]}}rm({Tw:t,selector:i}){var e;const s=`${t}-${i}`;if(this.Kp.has(s)||this.Kp.set(s,{start:performance.now(),end:0}),this.Kp.get(s).end)return;this.Kp.get(s).end=performance.now();const n=document.querySelector(i);if(!n)return;const{start:o,end:r}=this.Kp.get(s),h=r-o;if(h)try{if(null===(e=this.ph)||void 0===e?void 0:e.vg){const i={data:{type:Vi.Bv,element:{id:n.id,cls:n.classList.value,tgn:n.tagName,Tw:t,rnd:h}}};Bi.add(i),this.xh.I(dt.Bs,i)}}catch({message:t,stack:i}){}}hm(){var t,i,e,s;const{rw:n,hw:o}=this.ow;for(const n of this.aw){if((null===(t=null==n?void 0:n.querySelector)||void 0===t?void 0:t.call(n,se.Gp))||document.body===n){this.sm();for(const t in this.Ow)for(const i in this.Ow[t])for(const e of this.Ow[t][i]){const{event:i,Pl:s}=e;this.tm({selector:t,event:i,Pl:s})}for(const t in this.Mw)for(const i in this.Mw[t])for(const e of this.Mw[t][i]){const{event:i,Pl:s}=e;i===ne.CHANGE&&(document.readyState!==qt.Er&&this.Xp||s()),this.tm({selector:t,event:i,Pl:s})}}for(const t in this.$w)for(const o in this.$w[t])for(const r of this.$w[t][o]){const{selector:t}=r,o=document.querySelector(t),h=null===(i=null==n?void 0:n.querySelector)||void 0===i?void 0:i.call(n,t),a=null===(s=null===(e=null==n?void 0:n.parentNode)||void 0===e?void 0:e.querySelector)||void 0===s?void 0:s.call(e,t);Boolean(document.readyState!==qt.LOADING&&!((null==o?void 0:o.hasAttribute(tt))&&o!==n)&&(h||o===n||a||(null==n?void 0:n.nodeType)===Node.TEXT_NODE&&o===(null==n?void 0:n.parentNode)))&&o&&r.update()}}for(const{Tw:t,experienceId:i,Bh:e,code:s}of n)this.rc({Tw:t,experienceId:i,Bh:e,code:s});for(const t of o)document.head.insertAdjacentHTML("beforeend",t);this.ow={rw:[],hw:[]},this.aw=[]}Lw({Tw:t}){for(const i in this.wh.Aw){const{Za:e}=this.fh.oa[i];for(const i in e)for(const{id:s}of e[i].Td)if(String(s)===String(t))return!0}return!1}bw(t){var i,e,s,n;if(this.ew&&!this.wh.isDisabled){const o=Date.now();if(null===(i=this.ph)||void 0===i?void 0:i.am){for(const i of t)"childList"===i.type&&(i.removedNodes.length&&i.removedNodes.forEach((t=>{var i,e;const s="STYLE"===t.nodeName?t:null;if((null==s?void 0:s.id)===it&&!this.Xp)return;if(null===(i=null==s?void 0:s.hasAttribute)||void 0===i?void 0:i.call(s,tt)){const t=s.getAttribute(tt);if(this.Lw({Tw:t}))return void this.ow.hw.push(s.outerHTML)}const n=this._w.filter((({html:i})=>String((null==t?void 0:t.outerHTML)||"").includes(i)));if(n.length)this.ow.rw.push(...n);else{if(null===(e=null==t?void 0:t.hasAttribute)||void 0===e?void 0:e.call(t,tt))return;this.aw.push(t)}})),i.addedNodes.length&&i.addedNodes.forEach((t=>{var i;(null===(i=null==t?void 0:t.hasAttribute)||void 0===i?void 0:i.call(t,tt))||this.aw.push(t)}))),"attributes"!==i.type||(null===(s=null===(e=i.target)||void 0===e?void 0:e.hasAttribute)||void 0===s?void 0:s.call(e,tt))||this.aw.push(i.target);this.aw.length||(this.iw=!0)}o-this.nw>=this.pw&&(this.dm?ti((()=>this.hm()),this.dm):this.hm(),this.process(),(null===(n=this.ph)||void 0===n?void 0:n.am)&&this.lm(),this.nw=o)}}lm(){var t,i;location.href.toLowerCase()===String(this.wh.um).toLowerCase()||(null===(t=this.wh)||void 0===t?void 0:t.vm)||(null===(i=this.wh)||void 0===i?void 0:i.gm)||this.xh.I(dt.Rs,{to:location.href,from:this.wh.um})}process(){var t,i,e,s,n;if((null===(i=null===(t=this.wh)||void 0===t?void 0:t.El)||void 0===i?void 0:i.oa)&&0===this.Cw.size&&0===this.jw.size&&this.xw(),0!==this.Cw.size||0!==this.jw.size||0!==this.Ew.size||0!==this.Dw.size)if((null===(e=this.ph)||void 0===e?void 0:e.gw)&&(this.Ww&&(clearTimeout(this.Ww),this.Ww=null),this.tw++),this.qw(),this.jw.size>0||this.Cw.size>0||this.Ew.size>0||this.Dw.size>0)if(null===(s=this.ph)||void 0===s?void 0:s.mw)document.readyState!==qt.LOADING&&this.Xp&&this.xw({delay:500});else if(null===(n=this.ph)||void 0===n?void 0:n.gw)if(document.readyState!==qt.LOADING)this.tw++,this.qw();else{Date.now()-this.sw>this.uw&&this.xw(),this.Ww=setTimeout((()=>this.process()),50)}else this.xw();else this.xw()}qw(){const t=this.jw.clone,i=this.Cw.clone,e=[];for(const{experienceId:i,Bh:s,code:n,url:o}of t)e.push(...this.fm({experienceId:i,Bh:s,code:n,url:o,version:ee.Vp}));for(const{Tw:t,experienceId:s,Bh:n,code:o,selector:r,url:h}of i)e.push(...this.fm({Tw:t,experienceId:s,Bh:n,selector:r,code:o,url:h}));const s=[];for(const{experienceId:i,Bh:n,code:o,url:r}of t)this.pm({wm:e,experienceId:i,code:o,url:r})&&s.push({experienceId:i,Bh:n,code:o,url:r});if(s.length)for(const{experienceId:t,Bh:i,code:e,url:n}of s)this.rc({experienceId:t,Bh:i,code:e,url:n})&&this.jw.remove({experienceId:t,Bh:i,code:e,url:n});const n=[];for(const{Tw:t,experienceId:s,Bh:o,code:r,selector:h,url:a}of i)this.pm({wm:e,experienceId:s,code:r,url:a})&&n.push({Tw:t,experienceId:s,Bh:o,code:r,selector:h,url:a});if(n.length)for(const t of n){const{Tw:i,experienceId:e,Bh:s,code:n,selector:o,url:r}=t;this.rc({Tw:i,experienceId:e,Bh:s,code:n,url:r})&&(this.rm({Tw:i,selector:o}),this.Cw.remove(t))}const o=[];for(const t of this.Ew.clone){const{selector:i,event:e,Hd:s,Pl:n}=t;try{if(document.querySelector(i)){o.push({selector:i,event:e,Hd:s});const r=this.Im({selector:i,event:e,Hd:s,Pl:n});this.tm({selector:i,event:e,Pl:r}),this.Ew.remove(t)}}catch(i){this.Ew.remove(t)}}if(o.length)for(const{selector:t,event:i,Hd:e}of o);const r=[];for(const t of this.Dw.clone){const{selector:i,event:e,locationId:s,Pl:n}=t;if(document.querySelector(i)){r.push({selector:i,event:e,locationId:s});const o=this.bm({selector:i,event:e,locationId:s,Pl:n});this.tm({selector:i,event:e,Pl:o}),this.Dw.remove(t)}}if(r.length)for(const{selector:t,event:i,locationId:e}of r);}pm({wm:t,experienceId:i,code:e,url:s}){return Boolean(t.some((({experienceId:t,code:n,url:o})=>i===t&&e.toString()===n.toString()&&s===o)))}xm({Tw:t,experienceId:i,Bh:e,code:s,selector:n,url:o,version:r}){return{uh:this,Tw:t,experienceId:i,Bh:e,selector:n,code:s,url:o,version:r,Bw:!1,update(){this.uh.rc({Tw:this.Tw,experienceId:this.experienceId,Bh:this.Bh,code:this.code,url:this.url})}}}fm({Tw:t,experienceId:i,Bh:e,code:s,selector:n,url:o,version:r=ee.Up}){if(!s)return[];if(!this.fh.oa[i])for(const t in this.$w)this.$w[t][i]&&delete this.$w[t][i];if(n){this.rm({Tw:t,selector:n}),this.$w[n]||(this.$w[n]={}),this.$w[n][i]||(this.$w[n][i]=[]);let h=this.$w[n][i].find((({selector:t,code:i,url:e})=>n===t&&s.toString()===i.toString()&&o===e));h||(h=this.xm({Tw:t,experienceId:i,Bh:e,selector:n,code:s,url:o,version:r}),this.$w[n][i].push(h));const a=document.querySelector(n);if(a)return h.Bw=!0,[{element:a,experienceId:i,code:s,url:o}]}else{const t=this.km(s.toString());if(t.length){const n=[];for(const h of t){this.$w[h]||(this.$w[h]={}),this.$w[h][i]||(this.$w[h][i]=[]);let t=this.$w[h][i].find((({selector:t,code:i,url:e})=>h===t&&s.toString()===i.toString()&&o===e));t||(t=this.xm({experienceId:i,Bh:e,selector:h,code:s,url:o,version:r}),this.$w[h][i].push(t));const a=document.querySelector(h);a&&(t.Bw=!0,n.push({element:a,experienceId:i,code:s,url:o}))}return n}}return[]}Im({selector:t,event:i,Hd:e,Pl:s}){this.Ow[t]||(this.Ow[t]={}),this.Ow[t][e]||(this.Ow[t][e]=[]);let n=this.Ow[t][e].find((({event:t,Pl:e})=>i===t&&s.toString()===e.toString()));return n||(n={event:i,Pl:()=>{s(e)}},this.Ow[t][e].push(n)),n.Pl}bm({selector:t,event:i,locationId:e,Pl:s}){this.Mw[t]||(this.Mw[t]={}),this.Mw[t][e]||(this.Mw[t][e]=[]);let n=this.Mw[t][e].find((({event:t,Pl:e})=>i===t&&s.toString()===e.toString()));return n||(n={event:i,Pl:()=>{s(e)}},this.Mw[t][e].push(n)),n.Pl}Ua({experienceId:t}){const i=[];for(const e in this.fh.oa[t].Za){const s=Wt(this.fh.oa[t].Za[e].Td,!0);for(const{data:t,type:n}of s)if(t&&Object.keys(t).includes(Zi.Cp)){const s=t[Zi.Cp];if(!s)continue;(String(s).includes("convert.redirect")||String(s).includes("convert.refresh"))&&i.push(e)}}return i.length?i:null}vc({experienceId:t,Bh:i,dc:e=1,gc:s,fc:n}){var o,r,h,a;if(this.Sm={experienceId:t,Bh:i},this.dw=e,s){if(String(i)===String(null===(o=this.Mh.oa[t])||void 0===o?void 0:o[ct.Ai]))return;return void this._m({fc:n})}const c=Wt(this.fh.oa[t].Za[i].Td,!0);for(const{id:e,data:s,type:n}of c)if(s&&(Object.keys(s).includes(Zi.Ep)&&this.ac({experienceId:t,Bh:i,Tw:e,cc:s[Zi.Ep],url:null===(r=this.fh.oa[t].$m[s[Zi.Dp]])||void 0===r?void 0:r.url}),n===z.he?this._m({Om:s[Zi.Ap],bi:s[Zi.Lp],nv:s[Zi.Tp]}):(Object.keys(s).includes(Zi.jp)||n===z.ne)&&this.rc({Tw:e,experienceId:t,Bh:i,code:s[Zi.jp]||s[Zi.Cp],url:null===(h=this.fh.oa[t].$m[s[Zi.Dp]])||void 0===h?void 0:h.url}),Object.keys(s).includes(Zi.Cp)&&n!==z.ne)){const o=s[Zi.oi],r=s[Zi.Cp],h=null===(a=this.fh.oa[t].$m[s[Zi.Dp]])||void 0===a?void 0:a.url;if(!r)continue;o&&document.querySelector(o)&&n===z.se?(this.fm({Tw:e,experienceId:t,Bh:i,selector:o,code:r,url:h}),this.rc({Tw:e,experienceId:t,Bh:i,code:r,url:h}),this.rm({Tw:e,selector:o})):this.Mm({Tw:e,experienceId:t,Bh:i,type:n,code:r,selector:o,url:h})}}Mm({Tw:t,experienceId:i,Bh:e,type:s,code:n,selector:o,url:r}){var h,a,c;if(n&&(null===(h=null==n?void 0:n.toString)||void 0===h?void 0:h.call(n))){if(s===z.se)this.Cw.enqueue({Tw:t,experienceId:i,Bh:e,code:n,selector:o,url:r});else if(this.Nw()||!(null===(a=this.ph)||void 0===a?void 0:a.gw)&&!(null===(c=this.ph)||void 0===c?void 0:c.mw)){const t=new AbortController;this.fw.push(t),ai((()=>this.rc({experienceId:i,Bh:e,code:n,url:r})),t.signal)}else this.jw.enqueue({experienceId:i,Bh:e,code:n,url:r});this.Xp||this.qw()}}_m({Om:t,bi:i,fc:e,nv:s}){try{if(t||i){this.mh.process({nv:s});let e=new li(this.mh.url.href,s).create(vi);const n=new RegExp(t,"i");e=n.test(e)?e.replace(n,i):i,e=e.replace("&&","&").replace("?&","?").replace("&?","&"),e.endsWith("&")&&(e=e.slice(0,-1)),e.endsWith("?")&&(e=e.slice(0,-1)),e.match(new RegExp("http|https"))||(e=`${this.mh.url.object.protocol}${e}`),this.redirect({url:e,nv:s})}else this.refresh({fc:e})}catch({stack:t,message:i}){"undefined"!=typeof console&&console.error&&console.error("Convert:",t||i)}}redirect({url:t,nv:i}){var e,s,n,o;if(this.wh.isDisabled)return;const{experienceId:r,Bh:h}=this.Sm||{};if(this.wh.Lh[r])return;const a=this.bh.get(di.Zr)||{},c=Number(null===(e=a[this.Mh.id])||void 0===e?void 0:e[r]);this.mh.process({nv:i});const d=new li(this.mh.url.href,i).create(vi);let l=this.Yp.Cm({url:new li(t,i).create(vi),jm:!0,Em:this.Mh.Rd(this.Sm)});d!==l?((null===(s=this.wh)||void 0===s?void 0:s.ua)&&!(null===(n=this.wh)||void 0===n?void 0:n.Pd)&&(l+=`${t.startsWith("?")?"&":"?"}${lt.Js}=${ut.In}`),this.wh.aa=!0,this.wh.vm=!0,(null===(o=this.wh)||void 0===o?void 0:o.gm)||(null===window||void 0===window?void 0:window.convertcom_insideApp)||(null===window||void 0===window?void 0:window.Reed_designer)||(this.Mh.qd(Object.assign(Object.assign({},this.Sm),{Bd:l})),setTimeout((()=>{this.Ih.log({[M.zt]:`failed to redirect to: ${t}`,[M.bt]:Object.assign({[M.Nt]:[r],[M.Rt]:[h]},isNaN(c)?{}:{[M.Ht]:c})},{request:this.mh,from:O.rt})}),5e3),document.head.insertAdjacentHTML("afterbegin",`<meta http-equiv="refresh" content="0;URL='${l}'">`),location.replace(l))):this.wh.aa&&(this.wh.aa=!1),d===l&&this.Ih.log({[M.zt]:"failed to redirect destination URL same as current URL",[M.bt]:Object.assign({[M.Nt]:[r],[M.Rt]:[h]},isNaN(c)?{}:{[M.Ht]:c})},{request:this.mh,from:O.rt})}refresh({fc:t}={}){var i,e,s;if(this.wh.isDisabled||(null===(i=this.wh)||void 0===i?void 0:i.ua))return;const{experienceId:n,Bh:o}=this.Sm||{};if(this.wh.Lh[n])return;const r=this.bh.get(di.Zr)||{},h=Number(null===(e=r[this.Mh.id])||void 0===e?void 0:e[n]);if((null===(s=this.wh)||void 0===s?void 0:s.gm)||(null===window||void 0===window?void 0:window.convertcom_insideApp)||(null===window||void 0===window?void 0:window.Reed_designer));else{const i=new li(this.mh.url.href).create(vi);if(t)return void this.Mh.Nd(this.Sm);this.Mh.qd(Object.assign(Object.assign({},this.Sm),{Bd:i})),this.wh.aa=!0,setTimeout((()=>{this.Ih.log({[M.zt]:"failed to refresh page",[M.bt]:Object.assign({[M.Nt]:[n],[M.Rt]:[o]},isNaN(h)?{}:{[M.Ht]:h})},{request:this.mh,from:O.ot})}),5e3),location.reload()}}Dm(t){try{const i=new li(this.mh.url.href).create(vi),e=new li(i),s=e.sh(),n=new li(t).create(vi),o=new li(n);if(e.href===o.href)return!0;let r=o.sh();if(r.startsWith("http://www.")||r.startsWith("https://www.")?(r.startsWith("http://www.")&&(r=r.replace("http://www.","http://(www.)?")),r.startsWith("https://www.")&&(r=r.replace("https://www.","https://(www.)?"))):r.startsWith("http://")?r=r.replace("http://","http://(www.)?"):r.startsWith("https://")&&(r=r.replace("https://","https://(www.)?")),r.endsWith("/")||(r+="/"),s.match(r+"?$"))return!0}catch(t){return!1}return!1}rc({code:t,url:i,Tw:e,experienceId:s,Bh:n,Pl:o,Am:r}){var h,a;try{if(!t||!(null===(h=null==t?void 0:t.toString)||void 0===h?void 0:h.call(t)))return;if(i&&!this.Dm(i))return!0;if(this.dw>10&&(String(t).includes("convert._$")||String(t).includes("convert.$")))return!0;this.Lm(t);let s=!1;if(this._w.some((t=>String(t.Tw)===String(e)))){const t=document.querySelectorAll(`[${tt}="${e}"]`);s=!!t.length}const n=t=>`function(){\n          Object.assign(convert.T, {\n            skipInsertedElements: ${s}\n          });\n          return ${t}\n        }`;let a;if("function"==typeof t?a=t({skipInsertedElements:s}):t&&(a=Function(`return ${this.Lm(t)?n(t):t.trim().startsWith("function")?t:`function(activate, options){\n            ${t}\n          }`}`)()),"function"==typeof a&&(a=a(o,Wt(r,!0))),void 0===a)return!0;if(a){const{insertedElements:i=[]}=a;for(const s of i)s&&(e&&s.setAttribute(tt,e),this._w.push({code:t,Tw:String(e),html:(null==s?void 0:s.outerHTML)||"",node:s}))}return a}catch({stack:o,message:r}){if(null===(a=this.ph)||void 0===a?void 0:a.vg){const h={data:{type:Vi.Mv,experienceId:s,Bh:n,Tw:e,code:String(t),url:i,stack:o,message:r}};Bi.add(h),this.xh.I(dt.Bs,h)}"undefined"!=typeof console&&console.error&&console.error("Convert:",o||r)}return!1}ac({cc:t,url:i,experienceId:e,Bh:s,Tw:n}){var o,r,h;try{if(!t||!(null===(o=null==t?void 0:t.toString)||void 0===o?void 0:o.call(t)))return;if(i&&!this.Dm(i))return;if("function"==typeof t)return t();{const i=e?` class="${et} ${et}-${e}"`:"",s=(null===(r=this.wh)||void 0===r?void 0:r.su)?` nonce="${this.wh.su}"`:"";let o="";o=t.includes('<style type="text/css" media="screen"')?t.replace('<style type="text/css" media="screen"',`<style type="text/css" media="screen"${i}${s}`):`<style type="text/css" media="screen" ${tt}="${n}" ${i}${s}>${t}</style>`,document.head.insertAdjacentHTML("beforeend",o)}}catch({stack:n,message:o}){if(null===(h=this.ph)||void 0===h?void 0:h.vg){const r={data:{type:Vi.Mv,experienceId:e,Bh:s,sty:String(t),url:i,stack:n,message:o}};Bi.add(r),this.xh.I(dt.Bs,r)}"undefined"!=typeof console&&console.error&&console.error("Convert:",n||o)}}Rl({selector:t,event:i,Hd:e,Pl:s}){this.Ew.enqueue({selector:t,event:i,Hd:e,Pl:s}),this.qw()}Bl({Bc:t,Pl:i}){const e=[];(()=>{this.Yl.abort(),this.Yl=new AbortController})(),this.nm=Xt((()=>{var s;const n=Math.ceil(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100);try{const o=Yt(t);for(const t of o){const{Tm:i}=(null===(s=this.fh.Bc[t])||void 0===s?void 0:s.Nl)||{};n>i&&!e.includes(t)&&e.push(t)}i({Hd:e})}catch({message:t}){}}),200),this.sm()}Nm({selector:t,event:i,locationId:e,Pl:s}){this.Dw.enqueue({selector:t,event:this.Rm(i),locationId:e,Pl:s}),this.qw()}Rm(t){switch(t){case I:return Ut.Rr;case b:return ne.CHANGE;case y:return ne.Hp;default:return t}}ql({action:t,href:i}){return t?`form[action="${t.replace(/"/g,'\\"')}"]`:i?`a[href*="${i.replace(/"/g,'\\"')}"]`:void 0}km(t){const i=/_\$\(['|"](.*?)['|"]\)/gm,e=[];let s;for(;null!==(s=i.exec(t));){s.index===i.lastIndex&&i.lastIndex++;const[,t]=s;e.push(t)}return Yt(e)}Lm(t){return String(t).includes("convert.T.applyChange")}}class he{constructor({key:t,du:i,enabled:e=!0}={}){this.ph={},"undefined"!=typeof localStorage&&(this.Pm=t||"convert.com",this.qm=i||localStorage,this.Bm=e)}getData(){return JSON.parse(this.qm.getItem(this.Pm)||"{}")}xd(t){this.qm=t}Nc(t){this.Bm=t}get(t){return this.getData()[t]||this.ph[t]}set(t,i){if(this.Bm)if(t&&i){const e=this.getData();e[t]=i,this.qm.setItem(this.Pm,JSON.stringify(e))}else bt(this.ph)&&this.qm.setItem(this.Pm,JSON.stringify(this.ph));else t&&i&&(this.ph[t]=i)}delete(t){delete this.ph[t];const i=this.getData();if(i[t]){if(delete i[t],!this.Bm)return;bt(i)?this.qm.setItem(this.Pm,JSON.stringify(i)):this.qm.removeItem(this.Pm)}}destroy(){this.ph={},this.qm.removeItem(this.Pm)}}class ae{constructor({config:t,state:i,Vm:e,cookies:s,request:n,rh:o,t:r,remote:h,oh:a}){this.fh=t,this.wh=i,this.kf=e,this.mh=n,this.xh=o,this.u=r,this.Ih=h,this.yh=a,this.fw=new AbortController,this.Um=this.mh.url.object.host.replace(/^www\./,""),this.Rc=new wi({data:null==s?void 0:s.data,request:this.mh,state:this.wh,domain:`.${this.Um}`,enabled:this.kf,rh:this.xh,t:this.u,remote:this.Ih,oh:this.yh}),window.convert[Ht("cookieUrl",!0)]=t=>this.Cm({url:t})}Fm(t){const i=window.location.origin;return t.startsWith(i)?t.replace(i,""):t}Gm(t){if("string"!=typeof t)return;if(this.fh.Zc.Yc.reduce(((t,{Qc:i})=>t+i.length),0)>1){if(t.startsWith("#"))return!1;const{object:i}=new li(t),e=i.host.replace(/^www\./,""),s=this.fh.Zc.Yc.find((({Qc:t})=>t.includes(this.Um))),n=this.fh.Zc.Yc.find((({Qc:t})=>t.includes(e)));return Boolean(n&&s&&n.Kc!==s.Kc&&this.Um!==e)}return!1}process(){ai((()=>ti((()=>{var t,i;if(!(null===(i=null===(t=this.fh.Zc)||void 0===t?void 0:t.Nl)||void 0===i?void 0:i.zm))return;const e=Array.prototype.slice.apply(document.querySelectorAll("a"));for(const t of e){if("done"===t.dataset[Ht("convertLinkingBinding")])continue;const i=t.getAttribute("href")||t.href;i&&!this.Gm(i)||!i||(t.addEventListener(Ut.CLICK,(t=>{const e=t.target;if("done"!==e.dataset[Ht("convertLinking")]){const t=this.Cm({url:i});e.setAttribute("href",t),e.dataset[Ht("convertLinking")]="done"}})),t.dataset[Ht("convertLinkingBinding")]="done")}const s=Array.prototype.slice.apply(document.querySelectorAll("form"));for(const t of s){if("done"===t.dataset[Ht("convertLinkingBinding")])continue;const i=t.getAttribute("action")||t.action;i&&!this.Gm(i)||!i||(t.addEventListener(Ft.Ur,(e=>{var s,n;const o=e.target;if("done"!==o.dataset[Ht("convertLinking")]){if("GET"===((null===(n=null===(s=t.method)||void 0===s?void 0:s.toUpperCase)||void 0===n?void 0:n.call(s))||"GET"))return o.insertAdjacentHTML("beforeend",`<input type="hidden" name="${pt.Gn}" value="${encodeURI(this.Rc.get(pt.Gn))}"><input type="hidden" name="${pt.zn}" value="${encodeURI(this.Rc.get(pt.zn))}">`),!0;const e=this.Cm({url:i});return o.setAttribute("action",e),o.dataset[Ht("convertLinking")]="done",!0}})),t.dataset[Ht("convertLinkingBinding")]="done")}}),200)()),this.fw.signal)}Cm({url:t,Em:i,jm:e}){if(this.wh.isDisabled)return;if("string"!=typeof t)return;const{object:s}=new li(t),n=s.hash?`#${s.hash}`:"";let o=t.replace(n,"");return e||(o=this.Fm(o)),this.Gm(t)?`${o}${t.includes("?")?"&":"?"}${pt.Gn}=${encodeURI(this.Rc.get(pt.Gn))}&${pt.zn}=${encodeURI(this.Rc.get(pt.zn))}&${pt.Hn}=${encodeURI(i||this.Rc.get(pt.Hn))}${n}`:`${o}${n}`}Xl(){this.fw.abort()}}var ce,de,le;!function(t){t[t.An=2]="V2",t[t.Ln=3]="V3",t[t.Tn=4]="V4"}(ce||(ce={})),function(t){t.Hm="kissmetrics",t.Wm="luckyorange",t.Jm="googletagmanager",t.Km="yandex"}(de||(de={})),function(t){t.Qm="ga4",t.Ym="ga3"}(le||(le={}));class ue{constructor({config:t,state:i,Zm:e,t:s}){this.name="Integrations",this.fh=t,this.wh=i,this.Xm=e,this.u=s,this.tI=new AbortController}static isEnabled(t){return!!bt(t)&&(void 0===t.enabled||!0===t.enabled)}Na({experienceId:t}={}){var i;(null===(i=this.wh)||void 0===i?void 0:i.ua)||ai((()=>{let i,e;this.Xm[o.T].iI(t);for(const t in this.fh.oa)if(i||(i=this.Xm[o.T].eI({experienceId:t,type:le.Ym})),e||(e=this.Xm[o.T].eI({experienceId:t,type:le.Qm})),i&&e)break;if(i)try{this.Xm[o.T].sI()}catch({message:t}){}if(e)try{this.Xm[o.T].nI()}catch({message:t}){}const s=Object.values(o).concat(Object.values(de)).filter((t=>t!==o.T));for(const i of s)try{const e=this.Xm[i];e.iI(t),e.process()}catch({message:t}){}}),this.tI.signal)}Xl(){this.tI.abort()}}class ve{constructor({config:t,data:i,Vc:e,state:s,request:n,remote:o,visitor:r,oa:h,rh:a,t:c}){this.name="Integration",this.fh=t,this.Qp=e,this.wh=s,i&&(this.ph=i),n&&(this.mh=n),o&&(this.Ih=o),r&&(this.Mh=r),h&&(this.oI=h),a&&(this.xh=a),this.u=c}rI({hI:t,aI:i}){var e,s;const n=null===(s=null===(e=this.wh)||void 0===e?void 0:e.cI)||void 0===s?void 0:s[Ht(t)];if(n){if(i)return String(n);switch(typeof n){case"string":return window[n];case"object":return n;case"function":return n();default:return}}}dI(t,i){var e,s;return t?(null===(s=null===(e=this.fh.Zc)||void 0===e?void 0:e.Nl)||void 0===s?void 0:s.lI)?i:t.replace(/[^a-zA-Z\-_.\s0-9]/g,"").slice(0,40):""}iI(t){this.uI=t}vI({hI:t,gI:i,fI:e,pI:s,force:n}){var o,r,h,a,c,d;if(!(null===(o=this.wh)||void 0===o?void 0:o.ua)){i&&i();for(const i in this.Qp.oa){if(this.uI&&i!==this.uI)continue;if(this.Mh.ja[i])continue;const o=t===de.Hm;if(o&&!n&&!ue.isEnabled(null===(a=null===(h=null===(r=this.fh.Zc)||void 0===r?void 0:r.Nl)||void 0===h?void 0:h.Zm)||void 0===a?void 0:a[Ht(t)])||!o&&!n&&!ue.isEnabled(this.fh.oa[i].Zm[Ht(t)]))continue;const l=this.Qp.oa[i].bi.id;if(null===(c=this.Mh.Ea[i])||void 0===c?void 0:c[l])continue;const u=this.dI((null===(d=this.fh.oa[i])||void 0===d?void 0:d.name)||"unknown experience name",i),v=this.dI(this.Qp.oa[i].bi.name||"unknown variation name",l),g=`Convert: ${u} - ${v}`;if(e&&e({experienceId:i,ec:u.replace("Test #","Test "),Bh:l,nc:v.replace("Var #","ExperienceVariationConfig "),wI:g}),s)return}}}}class ge extends ve{constructor({config:t,Vc:i,oa:e,visitor:s,t:n}){super({config:t,Vc:i,oa:e,visitor:s,t:n}),this.name="ClickTale"}process(){(()=>{i(this,void 0,void 0,(function*(){yield ci("ClickTaleEvent",{zr:st}),yield ci("ClickTaleField",{zr:st}),"function"==typeof(null===window||void 0===window?void 0:window.ClickTaleEvent)&&"function"==typeof(null===window||void 0===window?void 0:window.ClickTaleField)&&this.vI({hI:o.M,fI:({experienceId:t,Bh:i,wI:e})=>{const s=`${t}_${i}`;try{window.ClickTaleEvent(e),window.ClickTaleField(lt.Di,s)}catch({message:t}){}},pI:!0})}))})()}mI(){(()=>{i(this,void 0,void 0,(function*(){var t,i;yield ci("ClickTaleIsPlayback",{zr:st}),yield ci("ClickTaleContext",{zr:st}),"function"==typeof(null===window||void 0===window?void 0:window.ClickTaleIsPlayback)&&(null===window||void 0===window?void 0:window.ClickTaleIsPlayback())&&("object"!=typeof(null===window||void 0===window?void 0:window.ClickTaleContext)&&"function"!=typeof(null===(t=null===window||void 0===window?void 0:window.ClickTaleContext)||void 0===t?void 0:t.getRecordingContextAsync)||null===(i=null===window||void 0===window?void 0:window.ClickTaleContext)||void 0===i||i.getRecordingContextAsync("1.1",(t=>{var i;if(void 0===(null===(i=null==t?void 0:t.II)||void 0===i?void 0:i[lt.Di]));else{const[i,e]=t.II[lt.Di].split("_");this.oI.qh({experienceId:i,Bh:e})}})))}))})()}}class fe extends ve{constructor({config:t,data:i,Vc:e,state:s,remote:n,visitor:o,rh:r,t:h}){if(super({config:t,data:i,Vc:e,state:s,remote:n,visitor:o,rh:r,t:h}),this.name="GoogleAnalytics",this.transactions={},this.customEvents={},this.yI={},this.bI={},this.xI=[],this.configure(),this.kI(),"undefined"==typeof performance);else try{this.yw=new PerformanceObserver((t=>{for(const i of t.getEntries())i.name.includes("/collect")&&this.SI({request:i.name})})),this.yw.observe({type:"resource",buffered:!0})}catch(t){}}configure(){this._I=this.rI({hI:o.T,aI:!0})||"dataLayer",window[this._I]=window[this._I]||[],this.gtag=function(){window[this._I].push(arguments)}}intercept({enable:t}){var i;if("undefined"!=typeof Proxy||"undefined"!=typeof Reflect){if(this.$I=t,window._gaq=window._gaq||[],(null===window||void 0===window?void 0:window._gaq)&&(window._gaq=new Proxy(window._gaq,{set:(t,i,e,s)=>{try{this.OI(e)}catch({message:t}){}return Reflect.set(t,i,e,s)}})),window.ga=window.ga||function(){(window.ga.q=window.ga.q||[]).push(arguments)},window.ga.l=Date.now(),window.ga.getAll=window.ga.getAll||function(){return!1},(null===(i=null===window||void 0===window?void 0:window.ga)||void 0===i?void 0:i.q)&&(window.ga.q=new Proxy(window.ga.q,{set:(t,i,e,s)=>{try{this.MI(e)}catch({message:t}){}return Reflect.set(t,i,e,s)}})),this.configure(),window[this._I]){for(const t of window[this._I])this.CI(t,"GA");window[this._I].push=new Proxy(window[this._I].push,{apply:(t,i,e)=>{try{const t=null==e?void 0:e[0];t&&this.CI(t,"GA")}catch({message:t}){}return Reflect.apply(t,i,e)}}),ci("google_tag_manager").then((t=>{t&&ci((()=>((t,i)=>{const e=[];let s=0;const n=t=>{if(1e3!=s){if(s++,!t||"object"!=typeof t&&!Array.isArray(t))return!1;if(t[i])return!0;if(Array.isArray(t)){const i=e.length?e.pop():"";for(let s=0;s<t.length;s++){e.push(`${i}[${s}]`);const o=n(t[s]);if(o)return o;e.pop()}}else for(const i in t){e.push(i);const s=n(t[i]);if(s)return s;e.pop()}return!1}};return n(t),e.join(".")})(window.google_tag_manager,"messageContext")),{zr:st}).then((t=>{if(t){const[i,e]=t.replace(/\[\d+\]/g,"").split(".");i&&e&&ci(i,{scope:window.google_tag_manager}).then((()=>{ci(e,{scope:window.google_tag_manager[i]}).then((()=>{for(const{message:t}of window.google_tag_manager[i][e])"object"==typeof t&&"event"===t[0]&&this.CI(t,"GTM");window.google_tag_manager[i][e].push=new Proxy(window.google_tag_manager[i][e].push,{apply:(t,i,e)=>{try{const{message:t}=e[0];"object"==typeof t&&"event"===t[0]&&this.CI(t,"GTM")}catch({message:t}){}return Reflect.apply(t,i,e)}})}))}))}}))}))}this.wh.jI=!0}}OI(t){if(this.$I){this.version=ce.An;try{if(hi(t)){const[i]=t;if("_addTrans"===i){const[,i,e,s]=t;this.transactions[i]||(this.transactions[i]={}),this.transactions[i]=Object.assign(this.transactions[i],{Sl:parseFloat(s),_l:0,version:this.version})}else if("_addItem"===i){const[,i,e,s,n,o,r]=t;this.transactions[i]||(this.transactions[i]={}),this.transactions[i]._l+=parseInt(r)}bt(this.transactions)&&this.xh.I(dt.Es,{transactions:Kt(this.transactions)})}}catch({message:t}){}}}MI(t){if(this.$I){this.version=ce.Ln;try{if(hi(t)){const[i,e,s]=t;if("ecommerce:addTransaction"===i){const{id:t,EI:i}=Wt(e)||{};this.transactions[t]||(this.transactions[t]={version:this.version}),this.transactions[t].Sl=parseFloat(i)}else if("ecommerce:addItem"===i){const{id:t,DI:i}=Wt(e)||{};this.transactions[t]||(this.transactions[t]={_l:0,version:this.version}),this.transactions[t]._l+=parseInt(i)}else if("ec:setAction"===i&&e===yi.Kd){const{id:t,EI:i}=Wt(s)||{};this.transactions[t]||(this.transactions[t]={version:this.version}),this.transactions[t].Sl=parseFloat(i)}else if("ec:addProduct"===i){const{id:t,DI:i}=Wt(e)||{};this.transactions[t]||(this.transactions[t]={_l:0,version:this.version}),this.transactions[t]._l+=parseInt(i)}bt(this.transactions)&&this.xh.I(dt.Es,{transactions:Kt(this.transactions)})}}catch({message:t}){}}}CI(t,i){if(this.$I){this.version=ce.Tn;try{let i;const e=t=>!t||Object.values(bi).includes(t)||Object.values(xi).includes(t)||Object.values(ki).some((i=>String(t).includes(i))),s=(t,e,s,n,o)=>{var r,h,a,c;if(!Boolean(o&&this.AI(o)||!o))return;Boolean(e&&Dt(s)&&parseFloat(String(s))>0)?(null===(c=null===(a=null===(h=null===(r=this.fh.Zc)||void 0===r?void 0:r.Nl)||void 0===h?void 0:h.Zm)||void 0===a?void 0:a.LI)||void 0===c?void 0:c.TI)&&(i=t,this.transactions[e]={Sl:s,_l:n}):t===yi.Kd||(this.customEvents[t]=t)},n=(t=[])=>t.reduce(((t,i)=>t+("DI"in i?Number(i.DI):1)),0);if(hi(t)){const[i,o,r]=t;if("consent"===i&&"update"===o){const{ad_user_data:t,ad_personalization:i,ad_storage:e,analytics_storage:s}=Wt(r)||{}}else if("event"===i){const{transaction_id:t,value:i,items:h=[],send_to:a=""}=Wt(r)||{},c=At(i);if(e(o))return;s(o,t,c,n(h),a)}}else if(bt(t)){const{event:i=null,ecommerce:o=null,NI:r}=Wt(t)||{},{transaction_id:h,value:a,items:c=[],send_to:d=""}=o||{},l=At(a||r);if(e(i))return;s(i,h,l,n(c),d)}bt(this.transactions)&&i&&this.xh.I(dt.Es,{transactions:Kt(this.transactions),event:i}),bt(this.customEvents)&&this.xh.I(dt.Ds,{customEvents:Kt(this.customEvents)})}catch({message:t}){}}}kI(){this.RI=[];for(const t in this.fh.oa){const i=this.eI({experienceId:t,type:le.Qm}),e=this.eI({experienceId:t,type:le.Ym});(i||e)&&(i&&!this.RI.includes(i)&&this.RI.push(i),e&&!this.RI.includes(e)&&this.RI.push(e))}}AI(t=""){const[i=""]=String(t).toUpperCase().match(/(G|UA)-/)||[];return Array.isArray(t)?Boolean(i)&&t.some((t=>this.RI.includes(t))):Boolean(i)&&this.RI.includes(String(t))}SI({request:t}){var i;if(!t||(null===(i=this.fh.Zc.Nl.Zm.LI)||void 0===i?void 0:i.qI)||this.BI)return;const e=new li(t).query,s=String(e[Ht("tid")]).toUpperCase(),n=String(e[Ht("en")]).toLowerCase();this.AI(s)&&!this.bI[s]&&"page_view"===n&&(this.BI=!0,this.bI[s]=!0,this.$I&&this.VI(s))}VI(t){if(!this.xI.length)return;const i=Yt(this.xI).filter((({UI:t})=>!t));if(i.length)for(const{experienceId:e,Bh:s,FI:n}of i)n!==t&&t||this.GI({experienceId:e,Bh:s,FI:n})}GI({experienceId:t,Bh:i,FI:e}){var s,n,o,r,h,a,c,d,l;const u=this.xI.find((s=>s.FI===e&&s.experienceId===t&&s.Bh===i));if(null==u?void 0:u.UI)return;if(e?this.gtag("event",bi.Yd,{send_to:e,exp_variant_string:`CONV-${t}-${i}`}):this.gtag("event",bi.Yd,{exp_variant_string:`CONV-${t}-${i}`}),u&&(u.UI=!0),(null===(n=null===(s=this.ph)||void 0===s?void 0:s.va)||void 0===n?void 0:n.Wd)!==this.fh.Zc.id)return;const v=window[this._I]||[],g=(null===(r=Wt(null===(o=v.find((t=>"config"===t[0]&&t[1]===e)))||void 0===o?void 0:o[2]))||void 0===r?void 0:r.zI)||(null===(a=null===(h=Wt(v.find((t=>"HI"in Wt(t)))))||void 0===h?void 0:h.WI)||void 0===a?void 0:a.zI)||(null===(c=Wt(v.find((t=>"zI"in Wt(t)))))||void 0===c?void 0:c.zI),f=null===(l=Wt(null===(d=v.find((t=>"config"===t[0]&&t[1]===e)))||void 0===d?void 0:d[2]))||void 0===l?void 0:l.JI;this.Ih.log({[M.bt]:{[M.Tt]:"ga",[M.Nt]:[t],[M.Rt]:[i],[M.Pt]:[e],[M.qt]:this.Mh.cookies.get("_ga"),[M.Bt]:g,[M.Vt]:f}},{cookies:this.Mh.cookies,request:this.mh,from:O.nt,visitor:this.Mh})}eI({type:t,experienceId:i}={}){let e,s;const n=i=>{var n,r;const h=null===(r=null===(n=this.fh.oa[i])||void 0===n?void 0:n.Zm)||void 0===r?void 0:r[Ht(o.T)];if(e=null==h?void 0:h.enabled,e)switch(t){case le.Qm:s=null==h?void 0:h.FI;break;case le.Ym:s=null==h?void 0:h.KI}};if(i)n(i);else for(const t in this.fh.oa)if(n(t),s)break;return s?String(s).toUpperCase():null}process(){}sI({retry:t}={retry:0}){var i,e,s,n,r,h,a,c,d,l,u,v,g,f;if(0===t&&this.uw)return;const p=[];try{if(window.ga&&"function"==typeof(null===(i=window.ga)||void 0===i?void 0:i.getAll)){const t=window.ga.getAll();for(const i of t){if(i.get("trackingId")==(null===(r=null===(n=null===(s=null===(e=this.fh.Zc)||void 0===e?void 0:e.Nl)||void 0===s?void 0:s.Zm)||void 0===n?void 0:n.LI)||void 0===r?void 0:r.KI)){p.push(i);break}}if(!p.length&&!(null===(d=null===(c=null===(a=null===(h=this.fh.Zc)||void 0===h?void 0:h.Nl)||void 0===a?void 0:a.Zm)||void 0===c?void 0:c.LI)||void 0===d?void 0:d.KI)&&t.length){const i=t[0].get("trackingId");i&&p.push(i)}p.length}if(this.uw&&(clearTimeout(this.uw),this.uw=null),!p.length&&(t>st||(this.uw=setTimeout((()=>this.sI({retry:++t})),100)),t))return}catch({message:t}){}for(const t in this.fh.oa){if(this.uI&&t!==this.uI)continue;if(!ue.isEnabled(null===(u=null===(l=this.fh.oa[t])||void 0===l?void 0:l.Zm)||void 0===u?void 0:u[Ht(o.T)]))continue;if(!this.Qp.oa[t])continue;const i=this.dI(this.Qp.oa[t].bi.name||"unknown variation name",this.Qp.oa[t].bi.id),e=null===(f=null===(g=null===(v=this.fh.oa[t])||void 0===v?void 0:v.Zm)||void 0===g?void 0:g[Ht(o.T)])||void 0===f?void 0:f.QI;if(!this.yI[t]&&p.length)for(const s of p)e&&s.set(`dimension${e}`,i),s.send({YI:"event",ZI:"Convert_Events",XI:"View_var",ty:i,iy:1}),this.yI[t]=!0}}nI(){var t;for(const i in this.fh.oa){if(this.uI&&i!==this.uI)continue;const e=this.eI({experienceId:i,type:le.Qm});if(!e)continue;if(!this.Qp.oa[i])continue;const{bi:{id:s}}=this.Qp.oa[i];try{(null===(t=this.fh.Zc.Nl.Zm.LI)||void 0===t?void 0:t.qI)||this.bI[String(e).toUpperCase()]&&this.$I?(this.VI(e),this.GI({experienceId:i,Bh:s,FI:e})):this.xI.some((t=>t.FI===e&&t.experienceId===i&&t.Bh===s))||this.xI.push({FI:e,experienceId:i,Bh:s,UI:!1})}catch({message:t}){}}}stop(){var t,i;this.uw&&(clearTimeout(this.uw),this.uw=null),null===(i=null===(t=this.yw)||void 0===t?void 0:t.disconnect)||void 0===i||i.call(t)}}class pe extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="KissMetrics",window._kmq=window._kmq||[]}process(){this.vI({hI:de.Hm,fI:({experienceId:t,nc:i})=>{window._kmq.push(["set",{[`CONVERT-${t}`]:i}])},pI:!0})}}class we extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="MixPanel"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;yield ci("mixpanel",{zr:st}),yield ci("track",{zr:st,scope:null===window||void 0===window?void 0:window.mixpanel}),"function"==typeof(null===(t=null===window||void 0===window?void 0:window.mixpanel)||void 0===t?void 0:t.track)&&this.vI({hI:o.B,fI:({experienceId:t,ec:i,nc:e})=>{try{window.mixpanel.track("View_Convert_Experience",{[`CONVERT - ${i}`]:e})}catch({message:t}){}}})}))})()}}class me extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="CrazyEgg"}process(){this.vI({hI:o.D,fI:({experienceId:t,wI:i})=>{window.CE_SNAPSHOT_NAME=i},pI:!0})}}class Ie extends ve{constructor({config:t,Vc:i,request:e,visitor:s,t:n}){super({config:t,Vc:i,request:e,visitor:s,t:n}),this.name="LuckyOrange"}process(){this.vI({hI:de.Wm,fI:({experienceId:t})=>{try{const i=this.mh.url.sh(),e=this.mh.url.query,s=`${i}${Nt(Object.assign(Object.assign({},e),{[lt.Us]:ut.wn,[lt.Di]:t,[lt.Ai]:this.Qp.oa[t].bi.id}),"get",{runtime:"browser"})}`;window.__wtw_lucky_override_save_url=s}catch({message:t}){}},pI:!0})}}class ye extends ve{constructor({config:t,Vc:i,state:e,visitor:s,t:n}){super({config:t,Vc:i,state:e,visitor:s,t:n}),this.name="GoogleTagManager"}process(){const t=this.rI({hI:de.Jm})||(null===window||void 0===window?void 0:window.dataLayer)||[];this.vI({force:!0,hI:de.Jm,fI:({experienceId:i,nc:e})=>{var s;const n=`${ki.el}-${i}`,r=null===(s=this.fh.oa[i].Zm[Ht(o.T)])||void 0===s?void 0:s.QI;t.push(Object.assign({event:n,experienceId:i,experiment_id:i,nc:e,variation_name:e},r?{ey:r}:{}))}})}}class be extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="HotJar",window.hj=window.hj||function(){(window.hj.q=window.hj.q||[]).push(arguments)}}process(){(()=>{i(this,void 0,void 0,(function*(){var t;if(yield ci("hj",{zr:st}),yield ci("eventStream",{zr:st,scope:null===window||void 0===window?void 0:window.hj}),null===(t=null===window||void 0===window?void 0:window.hj)||void 0===t?void 0:t.eventStream){const t=[];this.vI({hI:o.P,fI:({experienceId:i,Bh:e,wI:s})=>{const n=s.replace(i,`****${i.slice(4)}`).replace(e,`****${e.slice(4)}`);t.push(n)}});try{for(const i of t)window.hj("event",i)}catch({message:t}){}}}))})()}}class xe extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Baidu",window._hmt=window._hmt||[]}process(){this.vI({hI:o.O,fI:({experienceId:t,ec:i,nc:e})=>{var s;const n=null===(s=this.fh.oa[t].Zm[Ht(o.O)])||void 0===s?void 0:s.QI;window._hmt.push(["_setCustomVar",n,i,e,1])}})}}class ke extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Clicky",(null===window||void 0===window?void 0:window.clicky_custom)&&(window.clicky_custom.visitor={},window.clicky_custom.visitor_keys_cookie=[])}process(){this.vI({hI:o.C,fI:({ec:t,nc:i})=>{(null===window||void 0===window?void 0:window.clicky_custom)&&(window.clicky_custom.visitor[`test${t}`]=t,window.clicky_custom.visitor[`variation${i}`]=i,window.clicky_custom.visitor_keys_cookie.push(`test${t}`),window.clicky_custom.visitor_keys_cookie.push(`variation${i}`))}})}}class Se extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Cnzz",window._czc=window._czc||[]}process(){this.vI({hI:o.j,fI:({experienceId:t,ec:i,nc:e})=>{var s;const n=null===(s=this.fh.oa[t].Zm[Ht(o.j)])||void 0===s?void 0:s.QI;window._czc.push(["_setCustomVar",n,i,e,1])}})}}class _e extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){var n;super({config:t,Vc:i,visitor:e,t:s}),this.name="Econda",(null===window||void 0===window?void 0:window.emosGlobalProperties)||(window.emosGlobalProperties={}),(null===(n=null===window||void 0===window?void 0:window.emosGlobalProperties)||void 0===n?void 0:n.abtest)||(window.emosGlobalProperties.abtest=[])}process(){this.vI({hI:o.A,fI:({ec:t,nc:i})=>{window.emosGlobalProperties.abtest.push([t,i,1])}}),window.emosGlobalProperties.abtest.length&&"function"==typeof(null===window||void 0===window?void 0:window.emosPropertiesEvent)&&window.emosPropertiesEvent({})}}class $e extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Eulerian"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;yield ci("_oEa"),"function"==typeof(null===(t=null===window||void 0===window?void 0:window._oEa)||void 0===t?void 0:t.uparam)&&this.vI({hI:o.L,fI:({experienceId:t,nc:i})=>{window._oEa.uparam({[t]:i})}})}))})()}}class Oe extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="GoSquared"}process(){(()=>{i(this,void 0,void 0,(function*(){if(yield ci("_gs"),"function"==typeof(null===window||void 0===window?void 0:window._gs)){const t={};this.vI({hI:o.N,fI:({experienceId:i,nc:e})=>{t[`Test${i}`]=e}}),bt(t)&&window._gs("set","visitor",t)}}))})()}}class Me extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="HeapAnalytics"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;if(yield ci("heap"),"function"==typeof(null===(t=null===window||void 0===window?void 0:window.heap)||void 0===t?void 0:t.track)){const t={};this.vI({hI:o.R,fI:({experienceId:i,nc:e})=>{t[`Test${i}`]=e}}),bt(t)&&window.heap.track("Convert Event",t)}}))})()}}class Ce extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="MouseFlow"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;yield ci("_mfq"),"function"==typeof(null===(t=null===window||void 0===window?void 0:window._mfq)||void 0===t?void 0:t.push)&&this.vI({hI:o.V,fI:({experienceId:t,nc:i})=>{window._mfq.push(["setVariable",`Test${t}`,i])}})}))})()}}class je extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Piwik",window._paq=window._paq||[]}process(){let t=!1;this.vI({hI:o.U,fI:({experienceId:i,ec:e,nc:s})=>{var n;const r=null===(n=this.fh.oa[i].Zm[Ht(o.U)])||void 0===n?void 0:n.QI;window._paq.push(["setCustomVariable",r,e,s,"visit"]),t=!0}}),t&&window._paq.push(["trackPageView"])}}class Ee extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Segmentio"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;if(yield ci("analytics"),"function"==typeof(null===(t=null===window||void 0===window?void 0:window.analytics)||void 0===t?void 0:t.track)){const t={};this.vI({hI:o.F,fI:({experienceId:i,nc:e})=>{t[`Test${i}`]=e}}),bt(t)&&window.analytics.track("Convert Event",t)}}))})()}}class De extends ve{constructor({config:t,Vc:i,state:e,visitor:s,t:n}){super({config:t,Vc:i,state:e,visitor:s,t:n}),this.name="SiteCatalyst"}process(){(()=>{i(this,void 0,void 0,(function*(){const t=this.rI({hI:o.G})||(yield ci("s",{zr:st}));if("function"==typeof(null==t?void 0:t.tl)){let i=!1;this.vI({hI:o.G,fI:({experienceId:e,ec:s,nc:n})=>{var r;const h=null===(r=this.fh.oa[e].Zm[Ht(o.G)])||void 0===r?void 0:r.sy;t[`eVar${h}`]=`Convert - ${s} - ${n}`,i=!0}}),i&&(null==t||t.tl())}}))})()}}class Ae extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Woopra"}process(){(()=>{i(this,void 0,void 0,(function*(){var t;if(yield ci("woopra"),"function"==typeof(null===(t=null===window||void 0===window?void 0:window.woopra)||void 0===t?void 0:t.track)){const t={};this.vI({hI:o.H,fI:({experienceId:i,nc:e})=>{t[`Test${i}`]=e}}),bt(t)&&window.woopra.track("Convert Event",t)}}))})()}}class Le extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Ysance",window._wt1Q=window._wt1Q||[]}process(){this.vI({hI:o.W,fI:({experienceId:t,ec:i,nc:e})=>{var s;const n=null===(s=this.fh.oa[t].Zm[Ht(o.W)])||void 0===s?void 0:s.QI;window._wt1Q.push(["setCustomData",n,`${i}-${e}`])}})}}class Te extends ve{constructor({config:t,Vc:i,visitor:e,t:s}){super({config:t,Vc:i,visitor:e,t:s}),this.name="Yandex",window.yaParams=window.yaParams||{},window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)}}process(){let t="";const e=[];this.vI({hI:de.Km,fI:({experienceId:i,ec:s,Bh:n,nc:o})=>{t+=`${t?", ":""}[${i}] ${s} - [${n}] ${o}`,e.push(`CONV-${i}-${n}`)}}),window.yaParams.convert_experiences=t,(()=>{i(this,void 0,void 0,(function*(){if(yield ci("Ya",{zr:st}),null===window||void 0===window?void 0:window.Ya){const t=this.ny();if(t)for(const i of e)window.ym(t,"params",{exp_variant_string:i})}}))})()}ny(){for(const t in window)if(t.startsWith("yaCounter"))return t.replace("yaCounter","")}}class Ne{constructor(t,{ah:i,zg:e,t:s}){this.Sh=i,this.Hg=e,this.u=s,this.ph=It(t,"data")}oy(t){const i=this.Sh.getData(t)||{},{gh:e}=this.Sh.lp(null==i?void 0:i.gh);return e}Gu(t,i){const{gh:e}=this.Sh.lp(i);e&&this.Sh.ka(t,{gh:e})}hy(t,i,e){var s;const n=this.Sh.getData(t)||{},{gh:{[J.Ee]:o=[]}={}}=n,r=[];let h,a=!1;for(const t of i){if(e&&!a&&(a=this.Hg.pv(e,null==t?void 0:t.rules,`ConfigSegment #${null==t?void 0:t.id}`),Object.values(F).includes(a)))return a;if(!e||a){const i=null===(s=null==t?void 0:t.id)||void 0===s?void 0:s.toString();o.includes(i)||r.push(i)}}return r.length&&(h=Object.assign(Object.assign({},n.gh||{}),{[J.Ee]:[...o,...r]}),this.Gu(t,h)),h}ly(t,i,e){const s=this.Sh.mp(i,"gh");return this.hy(t,s,e)}Fd(t,i,e){const s=this.Sh.yp(i,"gh");return this.hy(t,s,e)}}var Re;const Pe={level:2,uy:nt,vy(t){if(Object.values(B).includes(t))this.level=t;else switch(t){case V.qi:this.level=B.qi;break;case V.Bi:this.level=B.Bi;break;case V.Vi:this.level=B.Vi;break;case V.ERROR:this.level=B.ERROR;break;default:this.level=B.Pi}switch(this.level){case B.qi:this.uy=["debug","info","warn","error","log"];break;case B.Bi:this.uy=["info","warn","error","log"];break;case B.Vi:this.uy=["warn","error"];break;case B.ERROR:this.uy=["error"];break;default:this.uy=["trace","debug","info","warn","error","log"]}},label:"Convert",gy(t){t&&(this.label=t)},py:{wy:{my:"#da275a",background:"rgba(218,39,90,0.2)"},Iy:{my:"#788797"}},yy({my:t,background:i}={}){t&&(this.py.wy.my=t),i&&(this.py.wy.background=i)},by(){return[`color: ${this.py.wy.my}`,`background: ${this.py.wy.background}`,`border: 1px solid ${this.py.wy.my}`,"border-radius: 4px","padding: 2px 4px","margin-right: 4px"].join(";")},xy(){return[`color: ${this.py.Iy.my}`,`border: 1px solid ${this.py.Iy.my}`,"border-radius: 4px","padding: 2px 4px","margin-right: 4px"].join(";")},ky(){return[`color: ${this.py.Iy.my}`].join(";")}},qe=performance.now();"undefined"==typeof window||(null===(Re=window.convert)||void 0===Re?void 0:Re.console)||(()=>{if("undefined"==typeof window)return;let t=[],i=!0;window.convert.console={};for(const e of nt)String(console[e])===`function ${e}() { [native code] }`?window.convert.console[e]=console[e]:(i=!1,window.convert.console[e]=(...i)=>t.push({method:e,k:i}));i||ai((()=>{const i=document.createElement("iframe");if(i.setAttribute(tt,""),i.style.display="none",document.body.appendChild(i),window.convert.console=i.contentWindow.console,t.length)for(const{method:i,k:e}of t)window.convert.console[i](...e);t=null}))})();for(const t of Object.getOwnPropertyNames("undefined"!=typeof window?window.convert.console:console))Pe[t]=(i,...e)=>{var s;if(Pe.uy.includes(t)){const n=(null===(s=null==i?void 0:i.toString)||void 0===s?void 0:s.call(i))||"",o=n.endsWith("()"),r=Number((performance.now()-qe)/1e3).toFixed(3).toString().padStart(2,"0"),h=[];for(const t of[...e])"object"==typeof t?h.push(zt(t)):h.push(t);"undefined"!=typeof window&&(null===window||void 0===window?void 0:window.isEmulator)?("undefined"!=typeof window?window.convert.console:console)[t](`${Pe.label} [${r} sec]`,`${n}${bt(h)?":":""}`,...h):Pe.level<=1?("undefined"!=typeof window?window.convert.console:console)[t](`%c${Pe.label}%c[${r} sec] ${o?`%c${n}`:n}`,Pe.by(),Pe.ky(),...o?[Pe.xy()]:[],...h):("undefined"!=typeof window?window.convert.console:console)[t](`%c${Pe.label}%c[${r} sec]${o||!n?"":` ${n}`}`,Pe.by(),Pe.ky(),...h)}};class Be{constructor({config:t,data:i}){var e,s,n,o,r,h;if(this.name="Workflow",this.Sy="1.1.5",this._y=null,this.$y=!0,this.Oy=!0,!t)return void console.error("Missing Convert Configuration!");if(!i)return void console.error("Missing Convert Data!");this.bh=new he,this.mh=new Li,this.mh.process(),this.ph=i?Wt(Kt(i)):{},(null===(e=this.ph)||void 0===e?void 0:e.logLevel)&&Pe.vy(this.ph.logLevel);const{[lt.Fs]:a}=this.mh.url.query;a&&Pe.vy(a),this.My=Pe.level,this.u=new Mi(Pe,this.My),this.Cy=new Xi,this.yh={},this.cf=null===(s=this.ph)||void 0===s?void 0:s.Qa,this.jy=!(null===(n=this.ph)||void 0===n?void 0:n.td),this.fh={},this.Ey={};const c=this.Dy(t);this.Ay(c),this.Qp=Ii.Cd(),this.Ly=Ii.Cd(),this.Ty={},this.Ny=new AbortController,this.Ry=new AbortController;if(!this.initialize())return;this.wh.isDisabled||this.$h.Rw(),(null===(o=this.ph)||void 0===o?void 0:o.gw)||(null===(r=this.ph)||void 0===r?void 0:r.mw)?this.$h.start():this.$h.xw(),document.addEventListener(Vt.Ar,(()=>{var t,i,e;document.visibilityState!==Bt.HIDDEN||(null===(t=this.wh)||void 0===t?void 0:t.ua)||(null===(i=this.wh)||void 0===i?void 0:i.vm)||(null===(e=this.wh)||void 0===e?void 0:e.aa)||!this.fh.Sf._f||this.vu.Su("beforeunload")})),this.Py("activeLocations",new Promise((t=>this.qy=t))),this.Py("historicalData",this.By.bind(this)),this.Py("data",null===(h=this.fh)||void 0===h?void 0:h.data),this.Py("currentData",(()=>this.Qp)),this.Py("isRedirect",(()=>this.wh.vm)),this.Py("version",(()=>this.Sy)),this.yh.Vy=this.Vy.bind(this),this.yh.Uy=()=>{this.wh.isDisabled||this.$h&&(this.$h.Zp=!1)},this.yh.run=Xt((({config:t,Fy:i}={})=>this.run({config:t,Fy:i,Gy:!0})),500),this.yh.fc=this.fc.bind(this),this.yh.zy=this.zy.bind(this),this.yh.setParameters=this.setParameters.bind(this),this.yh.Hy=this.Hy.bind(this),this.yh.Wy=(t={})=>this.Wy(Object.assign(Object.assign({},t),{ea:!0})),this.yh.Jy=this.Jy.bind(this),this.yh.Ky=this.Ky.bind(this),this.yh.destroy=this.destroy.bind(this),this.yh.disable=this.disable.bind(this),window.convert[Ht("runPreview",!0)]=t=>this.Qy({config:t}),window.convert[Ht("ready",!0)]=this.ready.bind(this),window.convert[Ht("onAditionalDataReturn",!0)]=window.convert[Ht("onAdditionalData",!0)]=this.Yy.bind(this),window.convert[Ht("getCspNonce",!0)]=()=>this.Zy(),window.convert[Ht("getAllVisitorData",!0)]=()=>zt(this.Xy()),window.convert[Ht("getCurrentVisitorData",!0)]=()=>zt(this.tb()),window.convert[Ht("getUserData",!0)]=()=>zt(this.ib()),window.convert[Ht("getUrlParameter",!0)]=t=>this.eb(t);const{[lt.fn]:d}=this.mh.url.query;if(d)throw this.Mh.cookies.setData(pt.fn,d),this.Mh.cookies.save(),this.sb(),at;if(!Be.nb()){const t=this.Mh.cookies.getData(pt.fn);if(t){const i=new URL(location.href);throw i.searchParams.set(lt.fn,t),i.searchParams.set(lt.pn,"crossdomain"),location.replace(i.toString()),at}}if(window._conv_q&&Array.isArray(window._conv_q)){const t=["sendRevenue","pushRevenue","triggerConversion"];for(const i of window._conv_q)this.ob(i,{rb:t})}window[Ht("_conv_q",!0)]={push:(...t)=>{if(ri(t))for(const i of t)this.ob(i)}}}initialize(){var t,i,s,n,r,h;const{[lt.Ks]:a}=this.mh.url.query;this.ph.vg=!Zt(a)&&!1!==(null===(t=this.ph)||void 0===t?void 0:t.vg)&&window.self===window.top,this.Oy=this.ph.vg;const{[lt.Vs]:c}=this.mh.url.query;if(c&&(this.ph.gw=!0,this.ph.mw=!1),(null===(i=this.ph)||void 0===i?void 0:i.gw)&&!(null===(s=this.ph)||void 0===s?void 0:s.mw)?(this.ph.gw=Boolean((null===(n=this.ph)||void 0===n?void 0:n.gw)||"IE"!==this.mh.Hu.zu||(null===window||void 0===window?void 0:window._conv_notag)),this.ph.gw||(this.ph.mw=!0)):null===(r=this.ph)||void 0===r||r.mw,this.hb(),this.ab=new Promise((t=>this.wh.Vw=t)),this.xh=new e(this.fh,{t:this.u}),this.Hg=new Ni(this.fh,{t:this.u}),this.kh=new Fi({config:this.Ey,data:this.ph,request:this.mh,zg:this.Hg,rh:this.xh,t:this.u}),this.qf=new Gi(this.fh,{t:this.u}),this.vu=new Ji(this.fh,{rh:this.xh,t:this.u}),this.Sh=new Qi(this.fh,{Lf:this.qf,zg:this.Hg,rh:this.xh,uu:this.vu,t:this.u},{Tf:!1}),this._h=new Yi(this.fh,{ah:this.Sh,t:this.u}),this.Jc=new Ne(this.fh,{ah:this.Sh,zg:this.Hg,t:this.u}),this.cb=new $i({data:this.ph,state:this.wh,t:this.u}),this.Ih=new Ci({config:this.Ey,state:this.wh,uu:this.vu,t:this.u}),this.Mh=new Ii({config:this.Ey,data:this.ph,state:this.wh,nh:this.bh,Uc:this.Ly,Vc:this.Qp,request:this.mh,Fc:this.fh.Sf._f||(null===(h=this.wh)||void 0===h?void 0:h.ua),rh:this.xh,Gc:this.Jc,t:this.u,remote:this.Ih,oh:this.yh}),this.Mh.process(),this.lb||(this.lb=this.Mh.cookies.getData(pt.cn),this.lb&&(this.fh.Sf._f=!1)),this.ub=new mi({cookies:this.Mh.cookies}),this.Sh.Gf(this.ub),this.Yp=new ae({config:this.Ey,state:this.wh,Vm:this.fh.Sf._f,cookies:this.Mh.cookies,request:this.mh,rh:this.xh,t:this.u,remote:this.Ih,oh:this.yh}),this.$h||(this.$h=new re({config:this.Ey,data:this.ph,state:this.wh,nh:this.bh,request:this.mh,visitor:this.Mh,Vc:this.Qp,Wp:this.Yp,remote:this.Ih,oh:this.yh,rh:this.xh,t:this.u})),this.check({gb:!1}))return this.xh.on(Y.Ne,this.fb.bind(this)),this.xh.on(Y.Re,this.pb.bind(this)),this.xh.on(Y.Pe,this.wb.bind(this)),this.xh.on(Y.qe,this.mb.bind(this)),this.xh.on(Y.He,this.Jy.bind(this)),this.xh.on(Y.Be,this.Ib.bind(this)),this.xh.on(Y.Ve,this.yb.bind(this)),this.xh.on(Y.Ue,this.bb.bind(this)),this.xh.on(Y.Fe,this.xb.bind(this)),this.xh.on(Y.ze,this.kb.bind(this)),this.xh.on(dt.Es,this.Sb.bind(this)),this.xh.on(dt.Ds,this._b.bind(this)),this.xh.on(dt.Rs,this.$b.bind(this)),this.xh.on(G.Qi,this.Ob.bind(this)),this.Oh=new ji({config:this.Ey,data:this.ph,state:this.wh,request:this.mh,remote:this.Ih,oh:this.yh,rh:this.xh,Gc:this.Jc,t:this.u,hh:this.kh,visitor:this.Mh}),this.Ih.pu(this.Oh),this.oI=new fi({config:this.Ey,data:this.ph,state:this.wh,nh:this.bh,request:this.mh,remote:this.Ih,oh:this.yh,rh:this.xh,t:this.u,hh:this.kh,ah:this.Sh,dh:this._h,uh:this.$h,gh:this.Oh,visitor:this.Mh}),this.Mb=new _i({config:this.Ey,data:this.ph,state:this.wh,request:this.mh,remote:this.Ih,oh:this.yh,rh:this.xh,t:this.u,hh:this.kh,uh:this.$h,gh:this.Oh,visitor:this.Mh}),this.Xm={[o.T]:new fe({config:this.Ey,data:this.ph,Vc:this.Qp,state:this.wh,remote:this.Ih,visitor:this.Mh,rh:this.xh,t:this.u}),[de.Hm]:new pe({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.B]:new we({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.D]:new me({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[de.Wm]:new Ie({config:this.Ey,Vc:this.Qp,request:this.mh,visitor:this.Mh,t:this.u}),[o.M]:new ge({config:this.Ey,Vc:this.Qp,oa:this.oI,visitor:this.Mh,t:this.u}),[de.Jm]:new ye({config:this.Ey,Vc:this.Qp,state:this.wh,visitor:this.Mh,t:this.u}),[o.P]:new be({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.O]:new xe({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.C]:new ke({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.j]:new Se({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.A]:new _e({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.L]:new $e({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.N]:new Oe({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.R]:new Me({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.V]:new Ce({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.U]:new je({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.F]:new Ee({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.G]:new De({config:this.Ey,Vc:this.Qp,state:this.wh,visitor:this.Mh,t:this.u}),[o.H]:new Ae({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[o.W]:new Le({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u}),[de.Km]:new Te({config:this.Ey,Vc:this.Qp,visitor:this.Mh,t:this.u})},this.Cb=new ue({config:this.Ey,state:this.wh,Zm:this.Xm,t:this.u}),!0}Dy(t){const i=Wt(t);for(let t=0,e=i.oa.length;t<e;t++){const e=i.oa[t];if((null==e?void 0:e.Qa)&&!this.cf&&delete e.Qa,!e.Ta.length&&(null==e?void 0:e.Xf)){const s=`site-area-${e.id}`,n={id:s,name:`Site Area ${e.id}`,key:s,Na:{type:p},rules:null==e?void 0:e.Xf};i.Ta.push(n),i.oa[t].Ta=[s],delete i.oa[t].Xf}}return i}Ay(t){var i,e,s,n,o,r;const h="string"==typeof(null===(i=t.Zc)||void 0===i?void 0:i.jb)?null===(e=t.Zc)||void 0===e?void 0:e.jb:null===(n=null===(s=t.Zc)||void 0===s?void 0:s.jb)||void 0===n?void 0:n.domain,a=h?`https://${h}/v1`:"https://[project_id].metrics.convertexperiments.com/v1";Jt(this.fh,{Qa:this.cf,data:Kt(t),hf:{endpoint:{track:a}},Sf:{_f:!("_f"in this.ph)||this.ph._f,source:"v1"},df:{lf:(null===(o=this.ph)||void 0===o?void 0:o.nf)||1,uf:(null===(r=this.ph)||void 0===r?void 0:r.rf)||1},m:t=>Wt(t,!0)}),this.fh.Sf._f,Jt(this.Ey,this.Eb(this.fh.data))}Eb(i){const e=Kt(i);function s(t){if(t.type===r)return t.Za.find((({Td:t})=>{const{data:i={}}=t.find((({type:t})=>t===z.he))||{};return i[Zi.Ap]===i[Zi.Lp]}))}return i.tp&&(e.tp=Qt(i.tp,"id")),i.Ta&&(e.Ta=Qt(i.Ta,"id")),i.gh&&(e.gh=Qt(i.gh,"id")),i.Bc&&(e.Bc=Qt(i.Bc,"id")),i.features&&(e.features=Qt(i.features,"id")),i.oa&&(e.oa=Qt(i.oa.map((i=>Object.assign(Object.assign({},i),{uc:s(i),Za:Qt(i.Za.map((i=>{var{Td:e}=i,s=t(i,["changes"]);return Object.assign({Td:e.sort(((t,i)=>t.id-i.id))},s)})),"id"),Zm:Qt(i.Zm,"provider"),$m:i[Ht("multipage_pages")]?Qt(i[Ht("multipage_pages")],"id"):{}}))),"id")),e}hb(){var t,i,e,s,n,o,r,h,a,c,d,l,u,v,g,f,p,w;const{[lt.Us]:m,[lt.Gs]:I}=this.mh.url.query,{[lt.Ys]:y}=this.mh.url.query,{[lt.Hs]:b}=this.mh.url.query,{[lt.sn]:x}=this.mh.url.query;if(!this.lb){const{[lt.cn]:t}=this.mh.url.query;this.lb=t,this.lb&&(this.fh.Sf._f=!1)}this.ph.am=!Zt(x)&&(null===(t=this.ph)||void 0===t?void 0:t.am),this.wh||(this.wh={});const k=(null===(i=this.wh)||void 0===i?void 0:i.Pd)||Boolean(m===ut.wn)||Boolean(I===ut.mn),S=(null===(e=this.wh)||void 0===e?void 0:e.ua)||(null===(s=this.ph)||void 0===s?void 0:s.Qy)||k;S&&(this.fh.Sf._f=!1),Jt(this.wh,{um:this.mh.url.href,Vw:null===(n=this.wh)||void 0===n?void 0:n.Vw,isDisabled:(null===(o=this.ph)||void 0===o?void 0:o.disabled)||Boolean(y),ua:S,Pd:k,Pa:null===(r=this.wh)||void 0===r?void 0:r.Pa,Db:k||(null===(h=this.wh)||void 0===h?void 0:h.Db),Ba:k||(null===(a=this.wh)||void 0===a?void 0:a.Ba),vm:!1,gm:(null===(c=this.ph)||void 0===c?void 0:c.Ab)||Boolean(b),wu:this.fh.Sf._f,Iu:Math.random(),su:this.Zy(),aa:!1,El:{},qa:(null===(d=this.wh)||void 0===d?void 0:d.qa)||this.Lb()||{},Wa:(null===(l=this.wh)||void 0===l?void 0:l.Wa)||this.Tb(),Va:(null===(u=this.wh)||void 0===u?void 0:u.Va)||{},jI:null===(v=this.wh)||void 0===v?void 0:v.jI,Nb:null===(g=this.wh)||void 0===g?void 0:g.Nb,xu:(null===(f=this.wh)||void 0===f?void 0:f.xu)||this.Rb(),Lh:(null===(p=this.wh)||void 0===p?void 0:p.Lh)||{},cI:(null===(w=this.wh)||void 0===w?void 0:w.cI)||{},Aw:{}})}static nb(){try{return JSON.parse(sessionStorage.getItem(di.th)||"false")}catch(t){return}}sb(){try{const t=document.createElement("script");t.id="convert-ts-qa-overlay-loader",t.setAttribute("tokens",JSON.stringify([Number(this.Ey.Zc.id)])),t.src="https://app.convert.com/static/_editor_frame_files/qaOverlayLoader.bundle.js",document.head.append(t)}catch({message:t,stack:i}){console.trace("Convert:",i||t)}}Zy(){if(!this.wh.isDisabled)try{const t=document.querySelector("[nonce]");if(t)return t.nonce||t.getAttribute("nonce")}catch({message:t}){}}Lb(){const{[lt.Ai]:t,[lt.zs]:i,[lt.Di]:e}=this.mh.url.query,{[lt.Ai]:s,[lt.zs]:n,[lt.Di]:o}=this.mh.url.hash,r=e||o,h=t||i||s||n;if(r&&h)return{[String(r)]:String(h)}}Tb(){var t,i,e,s,n;const o=(null===(s=null===(e=(null===(t=this.mh.url.query)||void 0===t?void 0:t[lt.Ws])||(null===(i=this.mh.url.query)||void 0===i?void 0:i[lt.Qs]))||void 0===e?void 0:e.split)||void 0===s?void 0:s.call(e,","))||[],r={};for(const t of o){const[i,e]=(null===(n=null==t?void 0:t.split)||void 0===n?void 0:n.call(t,"."))||[];i&&e&&(r[i]=e)}return r}Rb(){return window._conv_plugin_id||window.REED_plugin_id}fb(t){var i;const{zh:e,Hh:s=!0}=Wt(t);if(this.Pb&&this.Yy(Object.assign(Object.assign({},this.Pb),{zh:e,Hh:s})),!this.qb){this.qb=!0;try{oi({url:`https://cdn-3.convertexperiments.com/getjs/extra/data.js?vid=${this.Mh.id}${this.jy?"&iw=1":""}`,attributes:{nonce:null===(i=this.wh)||void 0===i?void 0:i.su}})}catch({message:t}){}}}Yy(t){if(this.wh.isDisabled)return;const i=Wt(t),e=null==i?void 0:i.zh,s=!1!==(null==i?void 0:i.Hh);this.Pb={Xc:Wt((null==i?void 0:i.Xc)||{},!0),td:Wt((null==i?void 0:i.td)||{},!0)},this.jy&&(this.jy=!(null==i?void 0:i.td)),this.qb=!1;for(const t in this.Pb.Xc)this.Mh.Xc[t]=this.Pb.Xc[t];for(const t in this.Pb.td)this.Mh.td[t]=this.Pb.td[t];this.Oh.Fu({zh:e}),this.oI.ya({zh:e,Hh:s}),this.Mb.ya({zh:e,Hh:s}),this.Mh.cookies.save(),e&&this.Mh.id}pb(){try{this.bh.set(di.Qr,{timestamp:Date.now()+1e4,data:document.referrer})}catch({message:t}){}}Bb({Vb:t,locationId:i,experienceId:e,Hh:s=!0,ea:n}){var o;if(null===(o=null==t?void 0:t.Na)||void 0===o?void 0:o.Ub){const o={locationId:i,isActive:!!this.Ty[i]};this.$h.rc({code:t.Na.Ub,Pl:()=>this.Fb({Vb:t,locationId:i,experienceId:e,Am:o,Hh:s,ea:n}),Am:o})}else this.Fb({Vb:t,locationId:i,experienceId:e,Hh:s,ea:n})}wb(t={}){var i,e;const{locationId:s,experienceId:n,Hh:o=!0,wc:r=!1}=Wt(t);let h=[];if(s)h=[this.Ey.Ta[s]],h.length;else if(n){const t=this.fh.data.Ta.filter((t=>{var i,e,s;return null===(s=null===(e=null===(i=this.Ey.oa[n])||void 0===i?void 0:i.Ta)||void 0===e?void 0:e.includes)||void 0===s?void 0:s.call(e,t.id)}));h=t.filter((t=>{var i,e;return!(null==t?void 0:t.Na)||(null===(i=null==t?void 0:t.Na)||void 0===i?void 0:i.type)===m||(null===(e=null==t?void 0:t.Na)||void 0===e?void 0:e.type)===p})),h.length}else{const t=this.fh.data.Ta.filter((t=>{var i;return(null===(i=null==t?void 0:t.Na)||void 0===i?void 0:i.type)===w}));for(const{id:i,Na:e}of t){const t=(null==e?void 0:e.df)||[];for(const s of t)this.$h.Nm({locationId:i,selector:e.selector,event:s,Pl:()=>this.Wy({locationId:i})})}h=this.fh.data.Ta.filter((t=>{var i,e;return!(null==t?void 0:t.Na)||(null===(i=null==t?void 0:t.Na)||void 0===i?void 0:i.type)===m||(null===(e=null==t?void 0:t.Na)||void 0===e?void 0:e.type)===p}))}if(h.length){for(let t=0,s=h.length;t<s;t++){const s=h[t].id,o=this.Ey.Ta[s];(o||(null===(i=this.wh)||void 0===i?void 0:i.ua))&&((null===(e=this.wh)||void 0===e?void 0:e.Pd)?(Object.keys(this.wh.qa).some((t=>{var i,e,n;return null===(n=null===(e=null===(i=this.Ey.oa[t])||void 0===i?void 0:i.Ta)||void 0===e?void 0:e.includes)||void 0===n?void 0:n.call(e,s)}))||r)&&this.Bb({Vb:o,locationId:s,experienceId:n}):this.Bb({Vb:o,locationId:s,experienceId:n}))}n&&(r?this.Mb.process({Hh:o}):this.Mh.cookies.enabled&&o&&this.Cb.Na({experienceId:n})),n||s||(this.qy(Object.values(this.Ty).map((t=>({id:null==t?void 0:t.id,name:null==t?void 0:t.name})))),this.xh.I(Y.qe,{zh:this.Mh.id,Hh:o}))}else n||s||this.xh.I(Y.qe,{zh:this.Mh.id,Hh:o})}mb(t={}){var i;const{ra:e,Hh:s=!0}=Wt(t);e||this.xh.I(dt.Ts,{zh:this.Mh.id}),(null===(i=this.wh)||void 0===i?void 0:i.El)||(this.wh.El={}),this.wh.El.oa=!0,this.Mb.process({Hh:s})}Ib(t){const{oa:i,kd:e=!0}=Wt(t);for(const t of i){const i=this.fh.data.oa.find((({id:i})=>String(i)===String(t)));if(i)for(const{id:e}of i.Za)this.bb({experienceId:t,Bh:e,kd:!1})}e&&(this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize())}yb(t){const{oa:i,kd:e=!0}=Wt(t);for(const t of i){const i=this.fh.data.oa.find((({id:i})=>String(i)===String(t)));if(i)for(const{id:e}of i.Za)this.xb({experienceId:t,Bh:e,kd:!1})}e&&(this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize())}bb(t){var i,e;const{experienceId:s,Bh:n,kd:o=!0}=Wt(t);if(!this.Ey.oa[s])return;const r=this.fh.data.oa.findIndex((({id:t})=>String(t)===String(s)));if(-1===r)return;(null===(e=null===(i=this.wh)||void 0===i?void 0:i.qa)||void 0===e?void 0:e[s])===n&&delete this.wh.qa[s];const h=this.fh.data.oa[r].Za.findIndex((({id:t})=>String(t)===String(n)));-1!==h&&(this.fh.data.oa[r].Za[h].status=a,o&&(this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize()))}xb(t){const{experienceId:i,Bh:e,kd:s=!0}=Wt(t);if(!this.Ey.oa[i])return;const n=this.fh.data.oa.findIndex((({id:t})=>String(t)===String(i)));if(-1===n)return;this.oI.Uh({experienceId:i,Bh:e});const o=this.fh.data.oa[n].Za.findIndex((({id:t})=>String(t)===String(e)));-1!==o&&(this.fh.data.oa[n].Za[o].status=c,s&&(this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize()))}kb(t={}){const{ra:i,Hh:e=!0}=Wt(t);i||this.xh.I(dt.Ns,{zh:this.Mh.id}),this.Mb.Hl(),this.qw(),this.Mh.cookies.enabled&&e&&this.Cb.Na(),this.intercept({enable:this.Mh.cookies.enabled&&e})}Sb(t){const{transactions:i,event:e}=Wt(t);if(!this.wh.isDisabled&&bt(i)){const t=this.Mb.Vl(e);if(t)for(const e in i){const{Sl:s,_l:n,version:r}=i[e];if(Array.isArray(this.Xm[o.T].transactions[e].Bc)||(this.Xm[o.T].transactions[e].Bc=[]),this.Xm[o.T].transactions[e].Bc.includes(String(t)));else{this.Mb.bl({Hd:t,kl:e,Sl:s,_l:n,xl:`ga_v${r}`})&&this.Xm[o.T].transactions[e].Bc.push(String(t))}}}}_b(t){const{customEvents:i}=Wt(t);if(!this.wh.isDisabled)for(const t in i){this.Mb.Ul(t)&&delete this.Xm[o.T].customEvents[t]}}$b(t){const{to:i,from:e}=Wt(t);this.wh.um=i,this.wh.isDisabled||this.run()}Ob(t,i){i&&this.xh.I(dt.qs,{reason:"network_error",details:(null==i?void 0:i.message)||"Unknown network error"})}Gb({doNotTrack:t,globalPrivacyControl:i}){var e,s,n,o;return t&&Boolean(1===Number(null===navigator||void 0===navigator?void 0:navigator.doNotTrack))||Boolean(1===Number(null===navigator||void 0===navigator?void 0:navigator.msDoNotTrack))||Boolean(1===Number(null===window||void 0===window?void 0:window.doNotTrack))?null===(s=null===(e=this.Ey.Zc)||void 0===e?void 0:e.Nl)||void 0===s?void 0:s.zb:i&&(null===navigator||void 0===navigator?void 0:navigator.globalPrivacyControl)?null===(o=null===(n=this.Ey.Zc)||void 0===n?void 0:n.Nl)||void 0===o?void 0:o.Hb:void 0}check({gb:t}={gb:!0}){var i,e,s,n,o,r;if(this.wh.isDisabled&&t)return;const h=this.Gb({doNotTrack:!0})||this.Gb({globalPrivacyControl:!0});if(h&&(h===S||h===k&&(rt[null===(e=null===(i=this.ph)||void 0===i?void 0:i.Xc)||void 0===e?void 0:e[Ht("country")]]||ht[null===(n=null===(s=this.ph)||void 0===s?void 0:s.Xc)||void 0===n?void 0:n[Ht("country")]])||h===x&&rt[null===(r=null===(o=this.ph)||void 0===o?void 0:o.Xc)||void 0===r?void 0:r[Ht("country")]]))return;const{[lt.rn]:a,[lt.an]:c,[lt.nn]:d,[lt.hn]:l}=this.mh.url.query;if(a||d)return void(window.parent[`codefound_${c||l}`]=!0);const{[lt.Xs]:u,[lt.tn]:v}=this.mh.url.query;u&&(this.Mh.cookies.delete("convert_optout"),"1"!==String(v)&&t&&alert(`Congratulations, you are not anymore opt-out for any tracking initiated by Convert.com scripts on ${this.mh.url.object.host} domain.`));const{[lt.Zs]:g,[lt.tn]:f}=this.mh.url.query;if(g)return this.Mh.cookies.set("convert_optout",1,Z),void("1"!==String(f)&&t&&alert(`You've been opted out for any tracking initiated by Convert.com scripts on ${this.mh.url.object.host} domain.\nIf you want to cancel the opt-out, just clear your browser's cookies or follow the instructions at http://www.convert.com/opt-out`));const p=this.Mh.cookies.get("convert_optout");if("1"!==String(p)){if(this.Mh.domain&&!window.convertcom_insideApp)return!0}else this.Mh.cookies.set("convert_optout",1,Z)}Wb(){var t;null===(t=this.qy)||void 0===t||t.call(this,[]),this.$h.xw()}run(){return i(this,arguments,void 0,(function*({config:t,Fy:i,Gy:e}={}){var s,n,r,h,a,c,d,l,u,v,g;if(bt(t)){const i=this.Dy(t);if((null==i?void 0:i.yu)!==this.Ey.yu||(null===(s=null==i?void 0:i.Zc)||void 0===s?void 0:s.id)!==this.Ey.Zc.id)return this.wh.isDisabled=!0,this.Wb(),void this.Ih.log({[M.ERROR]:{bf:null==t?void 0:t.yu,Wd:null===(n=null==t?void 0:t.Zc)||void 0===n?void 0:n.id}},{from:O.lt});this.Ay(i),this.Py("data",this.fh.data)}if(!this.check())return this.wh.isDisabled=!0,void this.Wb();if((null===(r=this.ph)||void 0===r?void 0:r.vg)&&!this.$y&&this.Jb(),this.$h.reset({Sw:this.$y}),e&&this.Kb)return void(this.Kb=!1);if(this.$y=!1,this.mh.process(),(null===(h=this.wh)||void 0===h?void 0:h.ua)&&!i||(Jt(this.Qp,Ii.Cd()),Jt(this.Ly,Ii.Cd()),this.Mh.Hc={}),i?(this.Mh.cookies.deleteData(pt.zn),this.Mh.cookies.deleteData(pt.Gn),this.Mh.cookies.save(),this.Mh.process()):this.Mh.process(this.ub.Pc()),!(null===(a=this.Mh)||void 0===a?void 0:a.id))return void this.Wb();if(this.hb(),(null===(c=this.wh)||void 0===c?void 0:c.ua)&&(null===(d=this.wh)||void 0===d?void 0:d.Pd)&&!this.Qb){const t=this.Lb();if(!t)return;{const[[i,e]]=Object.entries(t);if(!Dt(i)||!Dt(e))return;const s=`https://no-cdn.convertexperiments.com/getjs/global/data.js?client_id=${this.Ey.yu}&project_id=${this.Ey.Zc.id}&exp=${i}&do=preview&_rnd=${Date.now()}&version=${this.Yb()}&env=production`;try{this.Qb=!0,yield oi({url:s,attributes:{nonce:null===(l=this.wh)||void 0===l?void 0:l.su,"data-cfasync":"false"}})}catch(t){return}}}if(this.fh.Sf._f,(this.$h.Nw()||i)&&this.$h.Hw(),this.Mh.cookies.test()||(this.xh.I(dt.qs,{reason:"cookies_blocked"}),this.fc({Zb:!1},{Xb:!0})),this.Mh.cookies.Lc(pt.Gn,wt.Zn),this.Mh.cookies.Lc(pt.zn,wt.Zn),this.Ey.Zc.tx&&(this.Kb=!0,this.$h.rc({code:this.Ey.Zc.tx}),null===(u=this.wh)||void 0===u?void 0:u.aa))return;if(this.Mh.cookies.save(),this.Mh.cookies.verify()||this.Mh.cookies.Nc(!1),this.setSignals(),this.wh.Nb)return;this.Oh.Lu(),this.Jc.Gu(this.Mh.id,this.Oh.mu()),this.Oh.process(),this.ix(),this.Ty={},this.wb(),this.Mh.cookies.save(),(null===(g=null===(v=this.Ey.Zc)||void 0===v?void 0:v.Nl)||void 0===g?void 0:g.zm)&&this.Yp.process();(()=>{this.Ry.abort(),this.Ry=new AbortController})(),ai((()=>{try{this.Xm[o.M].mI()}catch({message:t}){}setTimeout((()=>{const t=this.fh.data.Bc.find((t=>"decrease-bouncerate"===(null==t?void 0:t.key)));t&&this.Mb.Na({Hd:t.id})}),1e4)}),this.Ry.signal)}))}ix({sx:t}={}){const i=this.oI.ca();if(bt(i)){const e=Object.keys(i).map((t=>this.Ey.oa[t])).filter((t=>!!t));this.oI.process({oa:e}),t||this.nx()}}nx(){try{const t=this.bh.get(di.Qr);(null==t?void 0:t.timestamp)>Date.now()&&(null==t?void 0:t.data)&&((null===window||void 0===window?void 0:window.ga)&&window.ga("set","referrer",t.data),(null===window||void 0===window?void 0:window.gtag)?window.gtag("set","page_referrer",t.data):this.Xm[o.T].gtag("set","page_referrer",t.data))}catch({message:t}){}}Qy({config:t}){var i,e,s,n,o,r;if(this.wh.isDisabled||!(null===(i=this.wh)||void 0===i?void 0:i.ua))return;if("string"==typeof t)return;if(t){const i=this.Dy(t);if((null==i?void 0:i.yu)!==this.Ey.yu||(null===(e=null==i?void 0:i.Zc)||void 0===e?void 0:e.id)!==this.Ey.Zc.id)return this.wh.isDisabled=!0,this.Wb(),void this.Ih.log({[M.ERROR]:{bf:null==t?void 0:t.yu,Wd:null===(s=null==t?void 0:t.Zc)||void 0===s?void 0:s.id}},{from:O.lt});this.Ay(i),this.Py("data",this.fh.data)}this.Qb=!0;const h=this.Lb();if(h){const[[t,i]]=Object.entries(h);if(!(null===(r=null===(o=null===(n=this.Ey.oa)||void 0===n?void 0:n[t])||void 0===o?void 0:o.Za)||void 0===r?void 0:r[i]))return void this.$h.xw();this.initialize(),this.mh.process(),this.oI.Uh({experienceId:t,Bh:i}),this.run();const e=this.oI.La({experienceId:t});if(e&&!this.wh.Aw[t])if("boolean"==typeof e)this.oI.qh({experienceId:t,Bh:i});else if(Array.isArray(e))for(const t of e)this.wb({locationId:t})}}Jy(t={}){if(this.wh.ua)return;this.wh.ua=!0;const{Ja:i,ox:e,hx:s=!0}=Wt(t);if(this.wh.Db=e,this.wh.Ba=s,this.bh.xd(sessionStorage),this.ph._f=!!i,this.bh.set(di.Xr,{Ja:i,ox:e,hx:s}),s){this.lx=this.lx||Kt(this.fh.data);for(const t of this.fh.data.oa)t.tp=[];this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize()}}Ky(){var t,i;this.wh.ua&&(this.wh.ua=!1,this.wh.Db=null===(t=this.wh)||void 0===t?void 0:t.Pd,this.wh.Ba=null===(i=this.wh)||void 0===i?void 0:i.Pd,this.bh.delete(di.Wr),this.bh.delete(di.Hr),this.bh.delete(di.Kr),this.bh.delete(di.Jr),this.bh.xd(localStorage),this.ph._f=!this.lb,this.lx&&(this.fh.data=Kt(this.lx),this.Ay(this.fh.data),this.Py("data",this.fh.data),this.initialize(),this.lx=null))}Yb(){return parseFloat(String(this.Sy||"").split("_")[0].replace("v",""))}By({ux:t}={}){var i,e,s;const n={oa:{}};for(const t in this.Mh.oa){if("1"===this.Mh.oa[t][ct.Ai])continue;const o=this.Mh.oa[t][ct.Ai],r=null===(s=null===(e=null===(i=this.Ey.oa[t])||void 0===i?void 0:i.Za)||void 0===e?void 0:e[o])||void 0===s?void 0:s.name;n.oa[t]={variation_name:r,nc:r,tc:o,Bh:o,Bc:this.Mh.oa[t][ct.$s]||{}}}return t?n:zt(n)}ob(t,{rb:i}={rb:[]}){bt(t)&&"logLevel"in t?t.logLevel:B.Bi;let e;if(B.Ui,Array.isArray(t)){const[i,...s]=t;i&&(this.Cy.enqueue({what:i,params:s}),e=i)}else if(t){const i="what"in t?t.what:null;i&&(this.Cy.enqueue(t),e=i)}i.includes(e)||this.qw({rb:i})}qw({rb:t}={rb:[]}){var i,e,s;if(null===(i=this.wh)||void 0===i?void 0:i.aa)return;const n=t.concat(["recheck_goals"]);for(const t of this.Cy.clone){const{what:i,params:o,logLevel:r=B.Bi}=t;try{if(n.includes(String(i)))continue;if(this.Cy.remove(t),"function"==typeof i)B.Ui,i();else if("string"==typeof i)if("addListener"===i){if(!bt(o))continue;const{event:t,handler:i}=o||{};if("string"!=typeof t||"function"!=typeof i)continue;B.Ui,this.xh.on(t,i)}else"function"==typeof this.vx(i)?(B.Ui,Array.isArray(o)?this.vx(i).apply(this,Wt(o)):this.vx(i)(Wt(o))):B.Ui}catch({message:t,stack:n}){if(null===(e=this.wh)||void 0===e?void 0:e.aa)continue;if(null===(s=this.ph)||void 0===s?void 0:s.vg){const e={data:{type:Vi.Mv,what:String(i),params:o,stack:n,message:t}};Bi.add(e),this.xh.I(dt.Bs,e)}this.Ih.log({[M.ERROR]:{message:t,stack:n,what:String(i),params:o}},{from:O.ct})}}}Py(t,i){Object.defineProperty(window.convert,Ht(t,!0),{get:()=>zt(Wt("function"==typeof i?i():i,!0)),configurable:!0,enumerable:!0})}vx(t){return this.yh[Ht(t)]}intercept({enable:t}){var i;if(null===(i=this.wh)||void 0===i?void 0:i.ua)return;if(this.Xm[o.T].eI({type:le.Qm}))try{this.wh.jI?(this.Xm[o.T].$I=t,t&&this.Xm[o.T].VI()):this.Xm[o.T].intercept({enable:t})}catch({message:t}){}}setSignals(){return i(this,void 0,void 0,(function*(){var t;if(!(null===(t=this.ph)||void 0===t?void 0:t.vg))return;const i="convert-signals";if(!document.getElementById(i))try{const t=(()=>{const t=document.currentScript.src,i=document.createElement("a");return i.href=t,i.host})(),{gx:{enabled:e,wx:s}={}}=yield fetch(`https://cdn-4.convertexperiments.com/api/v1/project-optional-settings/${this.Ey.yu}/${this.Ey.Zc.id}`).then((t=>t.json())).then(Wt);if(!e)return;const n=this.qf.Xg({1:s},this.Mh.id);if(!(null==n?void 0:n.Bh))return;yield this.Jb();const o=/^\d+\.\d+\.\d+$/.test(String(this.Sy))?`/v-${this.Sy}`:"";yield oi({url:`//${t}/static/v1${o}/signals.observer.min.js`,attributes:{id:i}})}catch({message:t,stack:i}){}}))}Jb(){return i(this,void 0,void 0,(function*(){return this._y||(this._y=(()=>i(this,void 0,void 0,(function*(){var t,i;const e=yield Bi.get({key:1,store:Ri.th}),s={vd:this.Mh.vd,zh:this.Mh.id,bf:this.Ey.yu,Wd:this.Ey.Zc.id,mx:null===(i=null===(t=this.Ey.Zc.Nl.Zm)||void 0===t?void 0:t.gx)||void 0===i?void 0:i.Ix,zu:this.mh.Hu.zu,Ta:Object.keys(this.Ty),url:this.mh.url.href};e?yield Bi.set({key:1,data:s,store:Ri.th}):yield Bi.add({key:1,data:s,store:Ri.th}),this._y=null})))()),this._y}))}fc(t={},{Xb:i}={}){if(this.wh.isDisabled)return;const e=!("Zb"in t)||"boolean"!=typeof t.Zb||t.Zb;this.wh.Nb=!e,this.ph.vg=Boolean(e&&this.Oy),this.wh.Nb,this.fh.Sf._f=!1,this.wh.wu=!1,this.Mh.cookies.Nc(!1),this.bh.Nc(!1),this.vu.Ef(),this.wh.Nb&&this.$h.xw(),i||this.xh.I(dt.qs,{reason:"cookies_consent"})}zy(){if(!this.wh.isDisabled){this.ix({sx:!0}),this.fh.Sf._f=!this.lb,this.wh.wu=!this.lb,this.Mh.cookies.Nc(!0),this.Mh.cookies.save(),this.bh.Nc(!0),this.bh.set(),this.vu.Ja();for(const t of this.Ih.fu)this.Ih.log(t,{cookies:this.Mh.cookies,request:this.mh,from:O.tt,visitor:this.Mh});this.Ih.fu=[],this.wh.Nb?(this.wh.Nb=!1,this.ph.vg=this.Oy,this.run()):(this.Cb.Na(),this.intercept({enable:!0}))}}setParameters(t){bt(t)&&(Jt(this.ph,Object.assign(Object.assign({},this.ph),t)),"ww"in t&&(this.$h.pw=t.ww),"yx"in t&&(this.$h.dm=t.yx),"bx"in t&&(this.$h.Zw=t.bx),"Qa"in t&&(this.cf=this.fh.Qa=t.Qa),"logLevel"in t&&(Pe.vy(t.logLevel),this.My=Pe.level,this.u=new Mi(Pe,this.My)),this.fh.Sf._f=!("_f"in this.ph)||this.ph._f,this.fh.Sf._f)}Hy({hI:t,xx:i}){this.wh.cI[Ht(t)]=Ht(i)}Wy(t){const{locationId:i,Hh:e=!0,ea:s}=Wt(t),n=this.fh.data.Ta.find((({id:t})=>String(t)===String(i)));n&&this.Bb({Vb:n,locationId:i,Hh:e,ea:s})}Fb({Vb:t,locationId:i,experienceId:e,Am:s,Hh:n=!0,ea:o}){var r,h;if(!i)return;if(this.Ty[i])bt(s)&&(s.isActive=!0);else if(null===(r=this.wh)||void 0===r?void 0:r.Db);else{const[n]=this.Sh.Yf(this.Mh.id.toString(),[t],{Hf:this.kh.getData({gh:this.Oh,visitor:this.Mh,experienceId:e,locationId:i}),Zf:"id",up:!0});if(!n)return;if(Object.values(F).includes(n))return;this.Ty[i]=n,(null===(h=this.ph)||void 0===h?void 0:h.vg)&&this.Jb(),bt(s)&&(s.isActive=!0)}const a=this.kx([this.Ey.Ta[i]]).filter((({id:t})=>String(t)===String(e)||!this.wh.Aw[t]));if(a.length){for(const{id:t}of a)this.wh.Aw[t]=!0,o&&this.Mh.cookies.enabled&&n&&this.Cb.Na({experienceId:t});this.oI.process({oa:a,Hh:n})}}kx(t){return this.fh.data.oa.filter((({Ta:e})=>i.call(this,t,e)));function i(t,i){const e=new Set(t.map((t=>t.id)));for(const t of i)if(e.has(t))return!0;return!1}}isDisabled(){return this.wh.isDisabled}disable(){this.wh.isDisabled=!0,this.destroy()}destroy(){var t,i,e,s,n,r,h,a,c,d,l,u,v,g,f,p,w,m,I,y,b,x,k,S,_,$,O,M,C,j,E,D;null===(t=document.querySelector("head .convertcomcss"))||void 0===t||t.remove(),null===(e=null===(i=this.$h)||void 0===i?void 0:i.destroy)||void 0===e||e.call(i),null===(r=null===(n=null===(s=this.Xm)||void 0===s?void 0:s[o.T])||void 0===n?void 0:n.stop)||void 0===r||r.call(n),null===(a=null===(h=this.Cb)||void 0===h?void 0:h.Xl)||void 0===a||a.call(h),null===(d=null===(c=this.Yp)||void 0===c?void 0:c.Xl)||void 0===d||d.call(c),null===(u=null===(l=this.cb)||void 0===l?void 0:l.Xl)||void 0===u||u.call(l),null===(g=null===(v=this.xh)||void 0===v?void 0:v._)||void 0===g||g.call(v,Y.Ne),null===(p=null===(f=this.xh)||void 0===f?void 0:f._)||void 0===p||p.call(f,Y.Re),null===(m=null===(w=this.xh)||void 0===w?void 0:w._)||void 0===m||m.call(w,Y.qe),null===(y=null===(I=this.xh)||void 0===I?void 0:I._)||void 0===y||y.call(I,Y.ze),null===(x=null===(b=this.xh)||void 0===b?void 0:b._)||void 0===x||x.call(b,F.Wi),null===(S=null===(k=this.xh)||void 0===k?void 0:k._)||void 0===S||S.call(k,F.Hi),null===($=null===(_=this.xh)||void 0===_?void 0:_._)||void 0===$||$.call(_,dt.Es),null===(M=null===(O=this.xh)||void 0===O?void 0:O._)||void 0===M||M.call(O,dt.Ds),null===(j=null===(C=this.xh)||void 0===C?void 0:C._)||void 0===j||j.call(C,dt.Rs),null===(D=null===(E=this.xh)||void 0===E?void 0:E._)||void 0===D||D.call(E,G.Qi),this.ab=null}ready(){return i(this,void 0,void 0,(function*(){return yield this.ab,new Promise((t=>t()))}))}Vy(t){this.wh.isDisabled||t&&this.setParameters({zh:t})}ib(){if(!this.wh.isDisabled)return Wt({Xc:this.Mh.Xc,system:this.mh.Hu,Sx:{yd:this.Mh.yd}},!0)}_x({experienceId:t}){var i;if(!this.Mh.Hc[t])return[];const e=[];for(const s in this.Mh.Hc[t])e.push({Hd:s,$x:this.Mh.Hc[t][s],timestamp:null===(i=this.Qp.qc[t])||void 0===i?void 0:i[s]});return e.sort(((t,i)=>t.timestamp-i.timestamp))}Xy(){if(this.wh.isDisabled)return;const t=[],i=this.By({ux:!0});for(const e in i.oa)t.push({experienceId:e,Bh:i.oa[e].Bh,Ra:!1,Bc:Object.keys(i.oa[e].Bc).map((t=>({Hd:t,$x:!1})))});const e=this.tb({ux:!0});return e.Sa=yt(e.Sa,t),Wt({Sa:t,gh:this.Oh.mu(),zh:this.Mh.id},!0)}tb({ux:t}={}){if(this.wh.isDisabled)return;const i=[];for(const t in this.Qp.oa)i.push({experienceId:t,Bh:this.Qp.oa[t].bi.id,Ra:this.Qp.oa[t].Ra,Bc:this._x({experienceId:t})});const e={Sa:i,gh:this.Oh.mu(),zh:this.Mh.id};return t?e:Wt(e,!0)}eb(t){if(!this.wh.isDisabled)return this.mh.url.query[t]}}i(void 0,void 0,void 0,(function*(){var t,e,s,n;if("undefined"!=typeof convertError)console.error("Convert Error:",convertError);else try{const t=Be.nb(),e=t||convertConfig,s=new Be({config:e,data:convertData});i(void 0,void 0,void 0,(function*(){return yield s.run()})),t&&s.sb()}catch({message:i,stack:o}){String(i).toLowerCase().includes("aborting execution")?console.warn("Convert:",i):console.error("Convert:",o||i),null===(e=null===(t=document.querySelector(`style#${it}`))||void 0===t?void 0:t.remove)||void 0===e||e.call(t);try{(new Ci).log({[M.ERROR]:{message:i,stack:o}},{from:O.dt})}catch({message:t,stack:i}){console.trace("Convert:",i||t)}null===(n=null===(s=document.querySelector(`style#${it}`))||void 0===s?void 0:s.remove)||void 0===n||n.call(s);try{(new Ci).log({[M.ERROR]:{message:i,stack:o}},{from:O.dt})}catch({message:t,stack:i}){console.trace("Convert:",i||t)}}}))}();

})();
