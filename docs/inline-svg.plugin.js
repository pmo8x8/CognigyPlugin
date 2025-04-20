(function () {
  function registerPlugin() {
    const React = window.React;
    if (!React) {
      console.error("❌ React not found in registerPlugin");
      return;
    }

    // 🔧 Handles deeply escaped SVG (e.g., from Say Nodes)
    function deeplyUnescapeSvgString(raw) {
      return raw
        .replace(/\\\\\"/g, '"')     // \\\" => "
        .replace(/\\"/g, '"')        // \" => "
        .replace(/\\n/g, '\n')       // \n => newline
        .replace(/\\r/g, '\r')       // \r => carriage return
        .replace(/\\\\/g, '\\')      // double backslash
        .trim();
    }

    const svgPlugin = {
      match: function (message) {
        const text = message.text?.trim() || "";
        const codeBlockMatch = text.match(/```(svg|xml)\n([\s\S]*?)\n```/);

        if (codeBlockMatch) {
          const svgContent = codeBlockMatch[2].trim();
          return svgContent.startsWith("<svg");
        }

        const normalizedText = text.replace(/^svg\n/, '').trim();
        return normalizedText.startsWith("<svg") ||
               text.startsWith("data:image/svg+xml") ||
               /^https?:\/\/.*\.svg(\?.*)?$/.test(text);
      },

      component: function ({ message }) {
        const text = message.text?.trim() || "";
        let svgContent;

        // Extract SVG from code block
        const codeBlockMatch = text.match(/```(svg|xml)\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          svgContent = codeBlockMatch[2].trim();
        } else {
          let raw = text.replace(/^svg\n/, '').trim();
          svgContent = deeplyUnescapeSvgString(raw);
        }

        // Trim any whitespace just in case
        svgContent = svgContent.trim();

        // Inject missing xmlns
        if (svgContent.startsWith("<svg") && !svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgContent = svgContent.replace(
            /<svg/,
            '<svg xmlns="http://www.w3.org/2000/svg"'
          );
        }

        console.log("✅ [SVG Plugin] Final SVG to render:", svgContent);

        // Add debug hook to inspect innerHTML after render
        setTimeout(() => {
          const debugEl = document.querySelector('[data-svg-debug]');
          if (debugEl) {
            console.log("🔎 Rendered innerHTML:", debugEl.innerHTML);
          } else {
            console.warn("⚠️ SVG debug element not found.");
          }
        }, 1000);

        // Inline SVG render
        if (svgContent.startsWith("<svg")) {
          return React.createElement("div", {
            dangerouslySetInnerHTML: { __html: svgContent },
            "data-svg-debug": true,
            style: {
              width: "100%",
              height: "auto",
              minHeight: "200px",
              overflow: "visible",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#f9f9f9",
              border: "2px dashed #666"
            }
          });
        }

        // Render as <img> fallback
        if (text.startsWith("data:image/svg+xml") || /^https?:\/\/.*\.svg(\?.*)?$/.test(text)) {
          return React.createElement("img", {
            src: text,
            alt: "SVG Chart",
            style: {
              maxWidth: "100%",
              height: "auto",
              border: "2px dashed green"
            }
          });
        }

        console.error("[SVG Plugin] ❌ No valid SVG content found", message);
        return React.createElement("div", {}, "Error: Unable to render SVG");
      }
    };

    // Register plugin
    window.cognigyWebchatMessagePlugins = window.cognigyWebchatMessagePlugins || [];
    window.cognigyWebchatMessagePlugins.push(svgPlugin);
    console.log("✅ Inline SVG plugin registered");
  }

  function waitForReactAndRegister() {
    if (window.React) {
      registerPlugin();
    } else {
      console.log("[SVG Plugin] ⏳ Waiting for webchatReady...");
      window.addEventListener("webchatReady", () => {
        const interval = setInterval(() => {
          if (window.React) {
            clearInterval(interval);
            registerPlugin();
          }
        }, 50);
        setTimeout(() => {
          if (!window.React) {
            console.error("❌ React still not found after 5s timeout");
          }
        }, 5000);
      });
    }
  }

  // Bootstrap the plugin
  waitForReactAndRegister();
})();
