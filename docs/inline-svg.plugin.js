import * as React from 'react';

const InlineSvgImage = (props) => {
  const { message } = props;
  const pluginData = message.data?._plugin || {};
  const text = message.text || "";
  const trimmedText = text.trim();

  // Determine SVG source from plugin data or message text
  let svgContent = pluginData.svg;
  let svgUrl = pluginData.url;

  if (!svgUrl) {
    if (svgContent) {
      // We have raw SVG XML content from plugin data
      // Will convert to data URI below
    } else if (trimmedText) {
      // If no explicit plugin data, check message text patterns
      if (trimmedText.startsWith('<svg')) {
        svgContent = trimmedText;  // raw SVG XML in text
      } else if (trimmedText.startsWith('data:image/svg+xml')) {
        svgUrl = trimmedText;      // data URI provided in text
      } else if (/^https?:\/\/.*\.svg(\?.*)?$/.test(trimmedText)) {
        svgUrl = trimmedText;      // direct URL to an .svg file
      }
    }
  }

  // If we have raw SVG content but no URL yet, convert content to a data URI
  if (!svgUrl && svgContent) {
    try {
      // Encode SVG as Base64 to include in data URI
      const base64 = btoa(unescape(encodeURIComponent(svgContent)));
      svgUrl = `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
      // Fallback: URL-encode the SVG content (for very large or unicode SVGs)
      svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    }
  }

  // Render the SVG as an image element
  return (
    <img 
      src={svgUrl} 
      alt="SVG Image" 
      style={{ maxWidth: '100%', height: 'auto' }} 
    />
  );
};

// Define the plugin with a match condition and the rendering component
const svgImagePlugin = {
  match: (message) => {
    // Trigger if message has plugin type "inline-svg"
    if (message.data?._plugin?.type === 'inline-svg') {
      return true;
    }
    // Or if the text itself looks like SVG content/URL
    const txt = message.text?.trim();
    if (!txt) return false;
    return (
      txt.startsWith('<svg') ||
      txt.startsWith('data:image/svg+xml') ||
      /^https?:\/\/.*\.svg(\?.*)?$/.test(txt)
    );
  },
  component: InlineSvgImage,
  options: {
    // fullWidth: true, // Optionally, enable this to display SVG without avatar/padding if desired
  }
};

// Register the plugin with Cognigy Webchat
if (!window.cognigyWebchatMessagePlugins) {
  window.cognigyWebchatMessagePlugins = [];
}
window.cognigyWebchatMessagePlugins.push(svgImagePlugin);
