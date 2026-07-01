(function () {
  window.__gsapGlobalShim = {
    define: window.define,
    exports: window.exports,
    module: window.module
  };

  try {
    window.define = undefined;
    window.exports = undefined;
    window.module = undefined;
  } catch (error) {}
})();
