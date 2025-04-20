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
        const text = message.text?.trim() || "";
        // Check if the text contains an SVG (either inline or a URL)
        return text.startsWith("<svg") || text.startsWith("data:image/svg+xml") || /^https?:\/\/.*\.svg(\?.*)?$/.test(text);
      },
      component: function ({ message }) {
        console.log("[SVG Plugin] Rendering component for message:", message);
        const text = message.text?.trim() || "";

        // If the message contains an SVG, we can directly use the content
        if (text.startsWith("<svg")) {
          // Directly render the SVG content in the message as raw HTML
          return React.createElement("div", {
            dangerouslySetInnerHTML: { __html: text },
            style: { maxWidth: "100%", height: "auto" }
          });
        } else if (text.startsWith("data:image/svg+xml")) {
          // Handle SVG as a data URL (base64 encoded or text)
          return React.createElement("img", {
            src: text,
            alt: "SVG Chart",
            style: { maxWidth: "100%", height: "auto" }
          });
        } else if (/^https?:\/\/.*\.svg(\?.*)?$/.test(text)) {
          // Handle SVG URL (external link)
          return React.createElement("img", {
            src: text,
            alt: "SVG Chart",
            style: { maxWidth: "100%", height: "auto" }
          });
        }

        // If no SVG content is found, display an error message
        console.error("[SVG Plugin] No valid SVG content found", message);
        return React.createElement("div", {}, "Error: Unable to render SVG");
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
