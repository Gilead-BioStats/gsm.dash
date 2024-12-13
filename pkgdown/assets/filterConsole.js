(function () {
  const originalLog = console.log;

  console.log = function (...args) {
    // Filter out messages that start with "preload echo:"
    if (args.some(arg => typeof arg === 'string' && arg.startsWith('preload echo:'))) {
      return;
    }
    originalLog.apply(console, args);
  };
})();
