!(function (window, document, scriptUrl, scriptTag, firstScript) {
  if (window.fbq) return;

  scriptTag = window.fbq = function () {
    scriptTag.callMethod
      ? scriptTag.callMethod.apply(scriptTag, arguments)
      : scriptTag.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = scriptTag;
  scriptTag.push = scriptTag;
  scriptTag.loaded = true;
  scriptTag.version = "2.0";
  scriptTag.queue = [];
  firstScript = document.createElement("script");
  firstScript.async = true;
  firstScript.src = scriptUrl;
  document.head.appendChild(firstScript);
})(window, document, "https://connect.facebook.net/en_US/fbevents.js");

fbq("init", "2892785514438427");
fbq("track", "PageView");
