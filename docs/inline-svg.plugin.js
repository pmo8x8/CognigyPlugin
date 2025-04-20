(function () {
  function registerPlugin() {
    const React = window.React;
    if (!React) {
      console.error("❌ React not found in registerPlugin");
      return;
    }

    const svgPlugin = {
      match: function (message) {
        console.log("[SVG Plugin] Checking message:", message);
        const pluginData = message.data?._plugin || {};
        const text = message.text?.trim() || "";
        if (pluginData.type === "inline-svg") {
          return true;
        }
        return (
          text.startsWith("<svg") ||
          text.startsWith("data:image/svg+xml") ||
          /^https?:\/\/.*\.svg(\?.*)?$/.test(text)
        );
      },
      component: function ({ message }) {
        console.log("[SVG Plugin] Rendering component for message:", message);
        const pluginData = message.data?._plugin || {};
        const text = message.text?.trim() || "";
        let svgContent = pluginData.svg;
        let svgUrl = pluginData.url;

        if (!svgUrl) {
          if (svgContent) {
            // Log raw SVG content for debugging
            console.log("[SVG Plugin] Raw svgContent:", svgContent);
            // Clean SVG content to remove escaped quotes and backslashes
            svgContent = svgContent
              .replace(/\\+"/g, '"') // Remove escaped quotes
              .replace(/\\\\/g, '\\') // Remove double backslashes
              .replace(/^"|"$/g, '') // Remove surrounding quotes
              .trim();
            console.log("[SVG Plugin] Cleaned svgContent:", svgContent);
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
            // Validate SVG starts with <svg
            if (!svgContent.startsWith("<svg")) {
              throw new Error("Invalid SVG content: does not start with <svg>");
            }
            const base64 = btoa(unescape(encodeURIComponent(svgContent)));
            svgUrl = `data:image/svg+xml;base64,${base64}`;
          } catch (e) {
            console.error("[SVG Plugin] Error encoding SVG to Base64:", e);
            svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
          }
        }

        if (!svgUrl) {
          console.error("[SVG Plugin] No valid SVG URL or content found", { svgContent, text, pluginData });
          return React.createElement("div", {}, "Error: Unable to render SVG");
        }

        console.log("[SVG Plugin] Rendering SVG with URL:", svgUrl);
        return React.createElement("img", {
          src: svgUrl,
          alt: "SVG Chart",
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
      console.log("[SVG Plugin] Waiting for webchatReady");
      window.addEventListener("webchatReady", () => {
        const interval = setInterval(() => {
          if (window.React) {
            clearInterval(interval);
            registerPlugin();
          }
        }, 50);
        setTimeout(() => {
          if (!window.React) {
            console.error("❌ React not found after 5s timeout");
          }
        }, 5000);
      });
    }
  }

  waitForReactAndRegister();
})();
