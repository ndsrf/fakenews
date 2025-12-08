const fs = require('fs');
const path = require('path');

module.exports = (request, options) => {
  const defaultResolver = options.defaultResolver;
  
  try {
    return defaultResolver(request, options);
  } catch (e) {
    if (request.endsWith('.js')) {
      try {
        return defaultResolver(request.replace(/\.js$/, '.ts'), options);
      } catch (e2) {
        try {
          return defaultResolver(request.replace(/\.js$/, '.tsx'), options);
        } catch (e3) {
          // fall through to throw original error
        }
      }
    }
    throw e;
  }
};
