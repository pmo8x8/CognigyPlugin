(function () {
  function registerPlugin() {
    const React = window.React;
    if (!React) {
      console.error("❌ React not found in registerPlugin");
      return;
    }

    // Unescapes deeply escaped SVG text (e.g. from Say Nodes)
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
        console.log("[SVG Plugin] Checking message:", message);
        const text = message.text?.trim() || "";

        // Match SVG code blocks (```svg\n...)
        const codeBlockMatch = text.match(/```(svg|xml)\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          const svgContent = codeBlockMatch[2].trim();
          return svgContent.startsWith("<svg");
        }

        // Match inline SVGs, data URIs or URLs
        const normalizedText = text.replace(/^svg\n/, '').trim();
        return normalizedText.startsWith("<svg") ||
               text.startsWith("data:image/svg+xml") ||
               /^https?:\/\/.*\.svg(\?.*)?$/.test(text);
      },

      component: function ({ message }) {
        console.log("[SVG Plugin] Rendering component for message:", message);
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

        // Ensure xmlns is present
        if (svgContent.startsWith("<svg") && !svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgContent = svgContent.replace(
            /<svg/,
            '<svg xmlns="http://www.w3.org/2000/svg"'
          );
        }

        console.log("✅ Final SVG content:", svgContent);

        // Inline SVG
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

        // Fallback: base64 or URL
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
