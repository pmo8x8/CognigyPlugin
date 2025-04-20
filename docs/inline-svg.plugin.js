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

        // Match code block with svg or xml
        const codeBlockMatch = text.match(/```(svg|xml)\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          const svgContent = codeBlockMatch[2].trim();
          return svgContent.startsWith("<svg");
        }

        // Match inline SVG or URL/data SVGs
        const normalizedText = text.replace(/^svg\n/, '').trim();
        return normalizedText.startsWith("<svg") ||
               text.startsWith("data:image/svg+xml") ||
               /^https?:\/\/.*\.svg(\?.*)?$/.test(text);
      },

      component: function ({ message }) {
        console.log("[SVG Plugin] Rendering component for message:", message);
        const text = message.text?.trim() || "";
        let svgContent;

        // Extract SVG content from code block if present
        const codeBlockMatch = text.match(/```(svg|xml)\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          svgContent = codeBlockMatch[2].trim();
        } else {
          let raw = text.replace(/^svg\n/, '').trim();

          // Decode double-escaped content using JSON.parse
          try {
            svgContent = JSON.parse(`"${raw.replace(/"/g, '\\"')}"`);
          } catch (e) {
            console.warn("[SVG Plugin] Fallback to raw text due to JSON parse failure", e);
            svgContent = raw;
          }
        }

        // Final cleanup of escape characters
        svgContent = svgContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\\\/g, '\\')
          .trim();

        // Ensure xmlns is present for proper rendering
        if (svgContent.startsWith("<svg") && !svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgContent = svgContent.replace(
            /<svg/,
            '<svg xmlns="http://www.w3.org/2000/svg"'
          );
        }

        console.log("✅ Final SVG content:", svgContent);

        // Inline SVG render
        if (svgContent.startsWith("<svg")) {
          return React.createElement("div", {
            dangerouslySetInnerHTML: { __html: svgContent },
            style: {
              maxWidth: "100%",
              height: "auto",
              overflow: "visible",
              display: "block",
              margin: "0 auto",
              border: "1px dashed #ccc" // Optional debug border
            }
          });
        }

        // Fallback to <img> for data URI or remote SVG
        if (text.startsWith("data:image/svg+xml")) {
          return React.createElement("img", {
            src: text,
            alt: "SVG Chart",
            style: { maxWidth: "100%", height: "auto" }
          });
        } else if (/^https?:\/\/.*\.svg(\?.*)?$/.test(text)) {
          return React.createElement("img", {
            src: text,
            alt: "SVG Chart",
            style: { maxWidth: "100%", height: "auto" }
          });
        }

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

  // Start plugin
  waitForReactAndRegister();
})();
