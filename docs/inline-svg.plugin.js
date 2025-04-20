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

        // Check for SVG in code block (e.g., ```svg\n<svg...)
        const codeBlockMatch = text.match(/```svg\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          return codeBlockMatch[1].trim().startsWith("<svg");
        }

        // Check for inline SVG, normalizing for prefixes like "svg\n"
        const normalizedText = text.replace(/^svg\n/, '').trim();
        return normalizedText.startsWith("<svg") ||
               text.startsWith("data:image/svg+xml") ||
               /^https?:\/\/.*\.svg(\?.*)?$/.test(text);
      },
      component: function ({ message }) {
        console.log("[SVG Plugin] Rendering component for message:", message);
        const text = message.text?.trim() || "";
        let svgContent = text;

        // Extract SVG from code block if present
        const codeBlockMatch = text.match(/```svg\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          svgContent = codeBlockMatch[1].trim();
        } else {
          // Normalize by removing "svg\n" prefix
          svgContent = text.replace(/^svg\n/, '').trim();
        }

        if (svgContent.startsWith("<svg")) {
          return React.createElement("div", {
            dangerouslySetInnerHTML: { __html: svgContent },
            style: {
              maxWidth: "100%",
              height: "auto",
              overflow: "visible",
              display: "block"
            }
          });
        } else if (text.startsWith("data:image/svg+xml")) {
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
