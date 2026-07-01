(function () {
  var shim = window.__gsapGlobalShim;

  if (!shim) {
    return;
  }

  try {
    window.define = shim.define;
    window.exports = shim.exports;
    window.module = shim.module;
  } catch (error) {}

  delete window.__gsapGlobalShim;
})();
