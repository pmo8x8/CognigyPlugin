(function () {
  function registerPlugin() {
    const React = window.React;
    const svgPlugin = {
      match: function (message) {
        console.log("[SVG Plugin] Checking message:", message);
      
        const pluginData = message.data?._plugin || {};
        const text = message.text?.trim() || "";
      
        // Always match if _plugin.type is "inline-svg"
        if (pluginData.type === "inline-svg") {
          return true;
        }
      
        // Match text content that contains raw SVG or SVG data/URL
        return (
          text.startsWith("<svg") ||
          text.startsWith("data:image/svg+xml") ||
          /^https?:\/\/.*\.svg(\?.*)?$/.test(text)
        );
      }
      component: function ({ message }) {
        const pluginData = message.data?._plugin || {};
        const text = message.text?.trim() || "";
        let svgContent = pluginData.svg;
        let svgUrl = pluginData.url;

        if (!svgUrl) {
          if (svgContent) {
            // use raw XML
          } else if (text) {
            if (text.startsWith("<svg")) {
              svgContent = text;
            } else if (text.startsWith("data:image/svg+xml")) {
              svgUrl = text;
            } else if (/^https?:\/\/.*\.svg(\?.*)?$/.test(text)) {
              svgUrl = text;
            }
          }
        }

        if (!svgUrl && svgContent) {
          try {
            const base64 = btoa(unescape(encodeURIComponent(svgContent)));
            svgUrl = `data:image/svg+xml;base64,${base64}`;
          } catch (e) {
            svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
          }
        }

        return React.createElement("img", {
          src: svgUrl,
          alt: "SVG",
          style: { maxWidth: "100%", height: "auto" }
        });
      }
    };

    window.cognigyWebchatMessagePlugins = window.cognigyWebchatMessagePlugins || [];
    window.cognigyWebchatMessagePlugins.push(svgPlugin);
    console.log("✅ Inline SVG plugin registered");
  }

  function waitForReactAndRegister() {
    if (window.React) {
      registerPlugin();
    } else {
      window.addEventListener("webchatReady", () => {
        const interval = setInterval(() => {
          if (window.React) {
            clearInterval(interval);
            registerPlugin();
          }
        }, 50);
      });
    }
  }

  waitForReactAndRegister();
})();
