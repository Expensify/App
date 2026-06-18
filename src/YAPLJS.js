// Add a timeout mechanism to prevent main thread blocking
function callFunctionWithTimeout(func, args, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Call timed out'));
    }, timeout);

    func(...args)
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// Usage example
async function callYAPLJSFunction() {
  try {
    const result = await callFunctionWithTimeout(YAPLJS.callFunction, [args]);
    console.log(result);
  } catch (error) {
    console.error('Error calling YAPLJS function:', error);
  }
}