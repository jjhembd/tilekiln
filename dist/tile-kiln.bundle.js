// From mapbox-gl-js, style-spec/deref.js
const refProperties = [
  'type', 
  'source', 
  'source-layer', 
  'minzoom', 
  'maxzoom', 
  'filter', 
  'layout'
];

/**
 * Given an array of layers, some of which may contain `ref` properties
 * whose value is the `id` of another property, return a new array where
 * such layers have been augmented with the 'type', 'source', etc. properties
 * from the parent layer, and the `ref` property has been removed.
 *
 * The input is not modified. The output may contain references to portions
 * of the input.
 */
function derefLayers(layers) {
  layers = layers.slice(); // ??? What are we trying to achieve here?

  const map = Object.create(null); // stackoverflow.com/a/21079232/10082269
  layers.forEach( layer => { map[layer.id] = layer; } );

  for (let i = 0; i < layers.length; i++) {
    if ('ref' in layers[i]) {
      layers[i] = deref(layers[i], map[layers[i].ref]);
    }
  }

  return layers;
}

function deref(layer, parent) {
  const result = {};

  for (const k in layer) {
    if (k !== 'ref') {
      result[k] = layer[k];
    }
  }

  refProperties.forEach((k) => {
    if (k in parent) {
      result[k] = parent[k];
    }
  });

  return result;
}

function expandStyleURL(url, token) {
  var prefix = /^mapbox:\/\/styles\//;
  if ( !url.match(prefix) ) return url;
  var apiRoot = "https://api.mapbox.com/styles/v1/";
  return url.replace(prefix, apiRoot) + "?access_token=" + token;
}

function expandSpriteURLs(url, token) {
  // Returns an array containing urls to .png and .json files
  var prefix = /^mapbox:\/\/sprites\//;
  if ( !url.match(prefix) ) return {
    image: url + ".png", 
    meta: url + ".json",
  };

  // We have a Mapbox custom url. Expand to an absolute URL, as per the spec
  var apiRoot = "https://api.mapbox.com/styles/v1/";
  url = url.replace(prefix, apiRoot) + "/sprite";
  var tokenString = "?access_token=" + token;
  return {
    image: url + ".png" + tokenString, 
    meta: url + ".json" + tokenString,
  };
}

function expandTileURL(url, token) {
  var prefix = /^mapbox:\/\//;
  if ( !url.match(prefix) ) return url;
  var apiRoot = "https://api.mapbox.com/v4/";
  return url.replace(prefix, apiRoot) + ".json?secure&access_token=" + token;
}

function getJSON(dataHref) {
  // Wrap the fetch API to force a rejected promise if response is not OK
  const checkResponse = (response) => (response.ok)
    ? response.json()
    : Promise.reject(response); // Can check .status on returned response

  return fetch(dataHref).then(checkResponse);
}

function getImage(href) {
  const errMsg = "ERROR in getImage for href " + href;
  const img = new Image();

  return new Promise( (resolve, reject) => {
    img.onerror = () => reject(errMsg);

    img.onload = () => (img.complete && img.naturalWidth !== 0)
        ? resolve(img)
        : reject(errMsg);

    img.crossOrigin = "anonymous";
    img.src = href;
  });
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var csscolorparser = createCommonjsModule(function (module, exports) {
// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/css-color-parser-js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// http://www.w3.org/TR/css3-color/
var kCSSColorTable = {
  "transparent": [0,0,0,0], "aliceblue": [240,248,255,1],
  "antiquewhite": [250,235,215,1], "aqua": [0,255,255,1],
  "aquamarine": [127,255,212,1], "azure": [240,255,255,1],
  "beige": [245,245,220,1], "bisque": [255,228,196,1],
  "black": [0,0,0,1], "blanchedalmond": [255,235,205,1],
  "blue": [0,0,255,1], "blueviolet": [138,43,226,1],
  "brown": [165,42,42,1], "burlywood": [222,184,135,1],
  "cadetblue": [95,158,160,1], "chartreuse": [127,255,0,1],
  "chocolate": [210,105,30,1], "coral": [255,127,80,1],
  "cornflowerblue": [100,149,237,1], "cornsilk": [255,248,220,1],
  "crimson": [220,20,60,1], "cyan": [0,255,255,1],
  "darkblue": [0,0,139,1], "darkcyan": [0,139,139,1],
  "darkgoldenrod": [184,134,11,1], "darkgray": [169,169,169,1],
  "darkgreen": [0,100,0,1], "darkgrey": [169,169,169,1],
  "darkkhaki": [189,183,107,1], "darkmagenta": [139,0,139,1],
  "darkolivegreen": [85,107,47,1], "darkorange": [255,140,0,1],
  "darkorchid": [153,50,204,1], "darkred": [139,0,0,1],
  "darksalmon": [233,150,122,1], "darkseagreen": [143,188,143,1],
  "darkslateblue": [72,61,139,1], "darkslategray": [47,79,79,1],
  "darkslategrey": [47,79,79,1], "darkturquoise": [0,206,209,1],
  "darkviolet": [148,0,211,1], "deeppink": [255,20,147,1],
  "deepskyblue": [0,191,255,1], "dimgray": [105,105,105,1],
  "dimgrey": [105,105,105,1], "dodgerblue": [30,144,255,1],
  "firebrick": [178,34,34,1], "floralwhite": [255,250,240,1],
  "forestgreen": [34,139,34,1], "fuchsia": [255,0,255,1],
  "gainsboro": [220,220,220,1], "ghostwhite": [248,248,255,1],
  "gold": [255,215,0,1], "goldenrod": [218,165,32,1],
  "gray": [128,128,128,1], "green": [0,128,0,1],
  "greenyellow": [173,255,47,1], "grey": [128,128,128,1],
  "honeydew": [240,255,240,1], "hotpink": [255,105,180,1],
  "indianred": [205,92,92,1], "indigo": [75,0,130,1],
  "ivory": [255,255,240,1], "khaki": [240,230,140,1],
  "lavender": [230,230,250,1], "lavenderblush": [255,240,245,1],
  "lawngreen": [124,252,0,1], "lemonchiffon": [255,250,205,1],
  "lightblue": [173,216,230,1], "lightcoral": [240,128,128,1],
  "lightcyan": [224,255,255,1], "lightgoldenrodyellow": [250,250,210,1],
  "lightgray": [211,211,211,1], "lightgreen": [144,238,144,1],
  "lightgrey": [211,211,211,1], "lightpink": [255,182,193,1],
  "lightsalmon": [255,160,122,1], "lightseagreen": [32,178,170,1],
  "lightskyblue": [135,206,250,1], "lightslategray": [119,136,153,1],
  "lightslategrey": [119,136,153,1], "lightsteelblue": [176,196,222,1],
  "lightyellow": [255,255,224,1], "lime": [0,255,0,1],
  "limegreen": [50,205,50,1], "linen": [250,240,230,1],
  "magenta": [255,0,255,1], "maroon": [128,0,0,1],
  "mediumaquamarine": [102,205,170,1], "mediumblue": [0,0,205,1],
  "mediumorchid": [186,85,211,1], "mediumpurple": [147,112,219,1],
  "mediumseagreen": [60,179,113,1], "mediumslateblue": [123,104,238,1],
  "mediumspringgreen": [0,250,154,1], "mediumturquoise": [72,209,204,1],
  "mediumvioletred": [199,21,133,1], "midnightblue": [25,25,112,1],
  "mintcream": [245,255,250,1], "mistyrose": [255,228,225,1],
  "moccasin": [255,228,181,1], "navajowhite": [255,222,173,1],
  "navy": [0,0,128,1], "oldlace": [253,245,230,1],
  "olive": [128,128,0,1], "olivedrab": [107,142,35,1],
  "orange": [255,165,0,1], "orangered": [255,69,0,1],
  "orchid": [218,112,214,1], "palegoldenrod": [238,232,170,1],
  "palegreen": [152,251,152,1], "paleturquoise": [175,238,238,1],
  "palevioletred": [219,112,147,1], "papayawhip": [255,239,213,1],
  "peachpuff": [255,218,185,1], "peru": [205,133,63,1],
  "pink": [255,192,203,1], "plum": [221,160,221,1],
  "powderblue": [176,224,230,1], "purple": [128,0,128,1],
  "rebeccapurple": [102,51,153,1],
  "red": [255,0,0,1], "rosybrown": [188,143,143,1],
  "royalblue": [65,105,225,1], "saddlebrown": [139,69,19,1],
  "salmon": [250,128,114,1], "sandybrown": [244,164,96,1],
  "seagreen": [46,139,87,1], "seashell": [255,245,238,1],
  "sienna": [160,82,45,1], "silver": [192,192,192,1],
  "skyblue": [135,206,235,1], "slateblue": [106,90,205,1],
  "slategray": [112,128,144,1], "slategrey": [112,128,144,1],
  "snow": [255,250,250,1], "springgreen": [0,255,127,1],
  "steelblue": [70,130,180,1], "tan": [210,180,140,1],
  "teal": [0,128,128,1], "thistle": [216,191,216,1],
  "tomato": [255,99,71,1], "turquoise": [64,224,208,1],
  "violet": [238,130,238,1], "wheat": [245,222,179,1],
  "white": [255,255,255,1], "whitesmoke": [245,245,245,1],
  "yellow": [255,255,0,1], "yellowgreen": [154,205,50,1]};

function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
  i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
  return i < 0 ? 0 : i > 255 ? 255 : i;
}

function clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

function parse_css_int(str) {  // int or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_byte(parseFloat(str) / 100 * 255);
  return clamp_css_byte(parseInt(str));
}

function parse_css_float(str) {  // float or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_float(parseFloat(str) / 100);
  return clamp_css_float(parseFloat(str));
}

function css_hue_to_rgb(m1, m2, h) {
  if (h < 0) h += 1;
  else if (h > 1) h -= 1;

  if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
  if (h * 2 < 1) return m2;
  if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
  return m1;
}

function parseCSSColor(css_str) {
  // Remove all whitespace, not compliant, but should just be more accepting.
  var str = css_str.replace(/ /g, '').toLowerCase();

  // Color keywords (and transparent) lookup.
  if (str in kCSSColorTable) return kCSSColorTable[str].slice();  // dup.

  // #abc and #abc123 syntax.
  if (str[0] === '#') {
    if (str.length === 4) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
      return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
              (iv & 0xf0) | ((iv & 0xf0) >> 4),
              (iv & 0xf) | ((iv & 0xf) << 4),
              1];
    } else if (str.length === 7) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
      return [(iv & 0xff0000) >> 16,
              (iv & 0xff00) >> 8,
              iv & 0xff,
              1];
    }

    return null;
  }

  var op = str.indexOf('('), ep = str.indexOf(')');
  if (op !== -1 && ep + 1 === str.length) {
    var fname = str.substr(0, op);
    var params = str.substr(op+1, ep-(op+1)).split(',');
    var alpha = 1;  // To allow case fallthrough.
    switch (fname) {
      case 'rgba':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'rgb':
        if (params.length !== 3) return null;
        return [parse_css_int(params[0]),
                parse_css_int(params[1]),
                parse_css_int(params[2]),
                alpha];
      case 'hsla':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'hsl':
        if (params.length !== 3) return null;
        var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
        // NOTE(deanm): According to the CSS spec s/l should only be
        // percentages, but we don't bother and let float or percentage.
        var s = parse_css_float(params[1]);
        var l = parse_css_float(params[2]);
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;
        return [clamp_css_byte(css_hue_to_rgb(m1, m2, h+1/3) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h-1/3) * 255),
                alpha];
      default:
        return null;
    }
  }

  return null;
}

try { exports.parseCSSColor = parseCSSColor; } catch(e) { }
});
var csscolorparser_1 = csscolorparser.parseCSSColor;

function buildInterpFunc(base, sampleVal) {
  // Return a function to interpolate the value of y(x), given endpoints
  // p0 = (x0, y0) and p2 = (x1, y1)

  const scale = getScale(base);
  const interpolate = getInterpolator(sampleVal);

  return (p0, x, p1) => interpolate( p0[1], scale(p0[0], x, p1[0]), p1[1] );
}

function getScale(base) {
  // Return a function to find the relative position of x between a and b

  // Exponential scale follows mapbox-gl-js, style-spec/function/index.js
  // NOTE: https://github.com/mapbox/mapbox-gl-js/issues/2698 not addressed!
  const scale = (base === 1)
    ? (a, x, b) => (x - a) / (b - a)  // Linear scale
    : (a, x, b) => (Math.pow(base, x - a) - 1) / (Math.pow(base, b - a) - 1);

  // Add check for zero range
  return (a, x, b) => (a === b)
    ? 0
    : scale(a, x, b);
}

function getInterpolator(sampleVal) {
  // Return a function to find an interpolated value between end values v1, v2,
  // given relative position t between the two end positions

  var type = typeof sampleVal;
  if (type === "string" && csscolorparser_1(sampleVal)) type = "color";

  switch (type) {
    case "number": // Linear interpolator
      return (v1, t, v2) => v1 + t * (v2 - v1);

    case "color":  // Interpolate RGBA
      return (v1, t, v2) => 
        interpColor( csscolorparser_1(v1), t, csscolorparser_1(v2) );

    default:       // Assume step function
      return (v1, t, v2) => v1;
  }
}

function interpColor(c0, t, c1) {
  // Inputs c0, c1 are 4-element RGBA arrays as returned by parseCSSColor
  let c = c0.map( (c0_i, i) => c0_i + t * (c1[i] - c0_i) );

  return "rgba(" +
    Math.round(c[0]) + ", " +
    Math.round(c[1]) + ", " + 
    Math.round(c[2]) + ", " +
    c[3] + ")";
}

function autoGetters(properties = {}, defaults) {
  const getters = {};
  Object.keys(defaults).forEach(key => {
    getters[key] = buildStyleFunc(properties[key], defaults[key]);
  });
  return getters;
}

function buildStyleFunc(style, defaultVal) {
  var styleFunc, getArg;

  if (style === undefined) {
    styleFunc = () => defaultVal;
    styleFunc.type = "constant";

  } else if (typeof style !== "object" || Array.isArray(style)) {
    styleFunc = () => style;
    styleFunc.type = "constant";

  } else if (!style.property || style.property === "zoom") {
    getArg = (zoom, feature) => zoom;
    styleFunc = getStyleFunc(style, getArg);
    styleFunc.type = "zoom";

  } else {
    let propertyName = style.property;
    getArg = (zoom, feature) => feature.properties[propertyName];
    styleFunc = getStyleFunc(style, getArg);
    styleFunc.type = "property";
    styleFunc.property = propertyName;

  } // NOT IMPLEMENTED: zoom-and-property functions

  return styleFunc;
}

function getStyleFunc(style, getArg) {
  if (style.type === "identity") return getArg;

  // We should be building a stop function now. Make sure we have enough info
  var stops = style.stops;
  if (!stops || stops.length < 2 || stops[0].length !== 2) {
    console.log("buildStyleFunc: style = " + JSON.stringify(style));
    console.log("ERROR in buildStyleFunc: failed to understand style!");
    return;
  }

  var stopFunc = buildStopFunc(stops, style.base);
  return (zoom, feature) => stopFunc( getArg(zoom, feature) );
}

function buildStopFunc(stops, base = 1) {
  const izm = stops.length - 1;
  const interpolateVal = buildInterpFunc(base, stops[0][1]);

  return function(x) {
    let iz = stops.findIndex(stop => stop[0] > x);

    if (iz === 0) return stops[0][1]; // x is below first stop
    if (iz < 0) return stops[izm][1]; // x is above last stop

    return interpolateVal(stops[iz-1], x, stops[iz]);
  }
}

const layoutDefaults = {
  "background": {
    "visibility": "visible",
  },
  "fill": {
    "visibility": "visible",
  },
  "line": {
    "visibility": "visible",
    "line-cap": "butt",
    "line-join": "miter",
    "line-miter-limit": 2,
    "line-round-limit": 1.05,
  },
  "symbol": {
    "visibility": "visible",

    "symbol-placement": "point",
    "symbol-spacing": 250,
    "symbol-avoid-edges": false,
    "symbol-sort-key": undefined,
    "symbol-z-order": "auto",

    "icon-allow-overlap": false,
    "icon-ignore-placement": false,
    "icon-optional": false,
    "icon-rotation-alignment": "auto",
    "icon-size": 1,
    "icon-text-fit": "none",
    "icon-text-fit-padding": [0, 0, 0, 0],
    "icon-image": undefined,
    "icon-rotate": 0,
    "icon-padding": 2,
    "icon-keep-upright": false,
    "icon-offset": [0, 0],
    "icon-anchor": "center",
    "icon-pitch-alignment": "auto",

    "text-pitch-alignment": "auto",
    "text-rotation-alignment": "auto",
    "text-field": "",
    "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
    "text-size": 16,
    "text-max-width": 10,
    "text-line-height": 1.2,
    "text-letter-spacing": 0,
    "text-justify": "center",
    "text-radial-offset": 0,
    "text-variable-anchor": undefined,
    "text-anchor": "center",
    "text-max-angle": 45,
    "text-rotate": 0,
    "text-padding": 2.0,
    "text-keep-upright": true,
    "text-transform": "none",
    "text-offset": [0, 0],
    "text-allow-overlap": false,
    "text-ignore-placement": false,
    "text-optional": false,
  },
  "raster": {
    "visibility": "visible",
  },
  "circle": {
    "visibility": "visible",
  },
  "fill-extrusion": {
    "visibility": "visible",
  },
  "heatmap": {
    "visibility": "visible",
  },
  "hillshade": {
    "visibility": "visible",
  },
};

const paintDefaults = {
  "background": {
    "background-color": "#000000",
    "background-opacity": 1,
    "background-pattern": undefined,
  },
  "fill": {
    "fill-antialias": true,
    "fill-opacity": 1,
    "fill-color": "#000000",
    "fill-outline-color": undefined,
    "fill-outline-width": 1, // non-standard!
    "fill-translate": [0, 0],
    "fill-translate-anchor": "map",
    "fill-pattern": undefined,
  },
  "line": {
    "line-opacity": 1,
    "line-color": "#000000",
    "line-translate": [0, 0],
    "line-translate-anchor": "map",
    "line-width": 1,
    "line-gap-width": 0,
    "line-offset": 0,
    "line-blur": 0,
    "line-dasharray": undefined,
    "line-pattern": undefined,
    "line-gradient": undefined,
  },
  "symbol": {
    "icon-opacity": 1,
    "icon-color": "#000000",
    "icon-halo-color": "rgba(0, 0, 0, 0)",
    "icon-halo-width": 0,
    "icon-halo-blur": 0,
    "icon-translate": [0, 0],
    "icon-translate-anchor": "map",

    "text-opacity": 1,
    "text-color": "#000000",
    "text-halo-color": "rgba(0, 0, 0, 0)",
    "text-halo-width": 0,
    "text-halo-blur": 0,
    "text-translate": [0, 0],
    "text-translate-anchor": "map",
  },
  "raster": {
    "raster-opacity": 1,
    "raster-hue-rotate": 0,
    "raster-brighness-min": 0,
    "raster-brightness-max": 1,
    "raster-saturation": 0,
    "raster-contrast": 0,
    "raster-resampling": "linear",
    "raster-fade-duration": 300,
  },
  "circle": {
    "circle-radius": 5,
    "circle-color": "#000000",
    "circle-blur": 0,
    "circle-opacity": 1,
    "circle-translate": [0, 0],
    "circle-translate-anchor": "map",
    "circle-pitch-scale": "map",
    "circle-pitch-alignment": "viewport",
    "circle-stroke-width": 0,
    "circle-stroke-color": "#000000",
    "circle-stroke-opacity": 1,
  },
  "fill-extrusion": {
    "fill-extrusion-opacity": 1,
    "fill-extrusion-color": "#000000",
    "fill-extrusion-translate": [0, 0],
    "fill-extrusion-translate-anchor": "map",
    "fill-extrusion-height": 0,
    "fill-extrusion-base": 0,
    "fill-extrusion-vertical-gradient": true,
  },
  "heatmap": {
    "heatmap-radius": 30,
    "heatmap-weight": 1,
    "heatmap-intensity": 1,
    "heatmap-color": ["interpolate",["linear"],["heatmap-density"],0,"rgba(0, 0, 255,0)",0.1,"royalblue",0.3,"cyan",0.5,"lime",0.7,"yellow",1,"red"],
    "heatmap-opacity": 1,
  },
  "hillshade": {
    "hillshade-illumination-direction": 335,
    "hillshade-illumination-anchor": "viewport",
    "hillshade-exaggeration": 0.5,
    "hillshade-shadow-color": "#000000",
    "hillshade-highlight-color": "#FFFFFF",
    "hillshade-accent-color": "#000000",
  },
};

function getStyleFuncs(inputLayer) {
  const layer = Object.assign({}, inputLayer); // Leave input unchanged

  // Replace rendering properties with functions
  layer.layout = autoGetters(layer.layout, layoutDefaults[layer.type]);
  layer.paint  = autoGetters(layer.paint,  paintDefaults[layer.type] );

  return layer;
}

function loadStyle(style, mapboxToken) {
  // Loads a style document and any linked information

  const getStyle = (typeof style === "object")
    ? Promise.resolve(style)                // style is JSON already
    : getJSON( expandStyleURL(style, mapboxToken) ); // Get from URL

  return getStyle
    .then( styleDoc => expandLinks(styleDoc, mapboxToken) );
}

function expandLinks(styleDoc, mapboxToken) {
  styleDoc.layers = derefLayers(styleDoc.layers);

  return Promise.all([
    expandSources(styleDoc.sources, mapboxToken),
    loadSprite(styleDoc.sprite, mapboxToken),
  ]).then( ([sources, spriteData]) => {
    styleDoc.sources = sources;
    styleDoc.spriteData = spriteData;
    return styleDoc;
  });
}

function expandSources(rawSources, token) {
  const expandPromises = Object.entries(rawSources).map(expandSource);

  function expandSource([key, source]) {
    // If no .url, return a shallow copy of the input. 
    // Note: some properties may still be pointing back to the original 
    // style document, like .vector_layers, .bounds, .center, .extent
    if (source.url === undefined) return [key, Object.assign({}, source)];

    // Load the referenced TileJSON document, add any values from source
    return getJSON( expandTileURL(source.url, token) )
      .then( tileJson => [key, Object.assign(tileJson, source)] );
  }

  function combineSources(keySourcePairs) {
    const sources = {};
    keySourcePairs.forEach( ([key, val]) => { sources[key] = val; } );
    return sources;
  }

  return Promise.all( expandPromises ).then( combineSources );
}

function loadSprite(sprite, token) {
  if (!sprite) return;

  const urls = expandSpriteURLs(sprite, token);

  return Promise.all([getImage(urls.image), getJSON(urls.meta)])
    .then( ([image, meta]) => ({ image, meta }) );
}

initZeroTimeouts();

function initZeroTimeouts() {
  // setTimeout with true zero delay. https://github.com/GlobeletJS/zero-timeout
  const timeouts = [];
  var taskId = 0;

  // Make a unique message, that won't be confused with messages from
  // other scripts or browser tabs
  const messageKey = "zeroTimeout_$" + Math.random().toString(36).slice(2);

  // Make it clear where the messages should be coming from
  const loc = window.location;
  var targetOrigin = loc.protocol + "//" + loc.hostname;
  if (loc.port !== "") targetOrigin += ":" + loc.port;

  // When a message is received, execute a timeout from the list
  window.addEventListener("message", evnt => {
    if (evnt.source != window || evnt.data !== messageKey) return;
    evnt.stopPropagation();

    let task = timeouts.shift();
    if (!task || task.canceled) return;
    task.func(...task.args);
  }, true);

  // Now define the external functions to set or cancel a timeout
  window.setZeroTimeout = function(func, ...args) {
    timeouts.push({ id: taskId++, func, args });
    window.postMessage(messageKey, targetOrigin);
    return taskId;
  };

  window.clearZeroTimeout = function(id) {
    let task = timeouts.find(timeout => timeout.id === id);
    if (task) task.canceled = true;
  };
}

function init() {
  const tasks = [];
  var taskId = 0;
  var queueIsRunning = false;

  return {
    enqueueTask,
    cancelTask,
    sortTasks,
  };

  function enqueueTask(newTask) {
    let defaultPriority = () => 0;
    tasks.push({ 
      id: taskId++,
      getPriority: newTask.getPriority || defaultPriority,
      chunks: newTask.chunks,
    });
    if (!queueIsRunning) setZeroTimeout(runTaskQueue);
    return taskId;
  }

  function cancelTask(id) {
    let task = tasks.find(task => task.id === id);
    if (task) task.canceled = true;
  }

  function sortTasks() {
    tasks.sort( (a, b) => compareNums(a.getPriority(), b.getPriority()) );
  }

  function compareNums(a, b) {
    if (a === b) return 0;
    return (a === undefined || a < b) ? -1 : 1;
  }

  function runTaskQueue() {
    // Remove canceled and completed tasks
    while (isDone(tasks[0])) tasks.shift();

    queueIsRunning = (tasks.length > 0);
    if (!queueIsRunning) return;

    // Get the next chunk from the current task, and run it
    let chunk = tasks[0].chunks.shift();
    chunk();

    setZeroTimeout(runTaskQueue);
  }

  function isDone(task) {
    return task && (task.canceled || task.chunks.length < 1);
  }
}

initZeroTimeouts$1();

function initZeroTimeouts$1() {
  // setTimeout with true zero delay. https://github.com/GlobeletJS/zero-timeout
  const timeouts = [];
  var taskId = 0;

  // Make a unique message, that won't be confused with messages from
  // other scripts or browser tabs
  const messageKey = "zeroTimeout_$" + Math.random().toString(36).slice(2);

  // Make it clear where the messages should be coming from
  const loc = window.location;
  var targetOrigin = loc.protocol + "//" + loc.hostname;
  if (loc.port !== "") targetOrigin += ":" + loc.port;

  // When a message is received, execute a timeout from the list
  window.addEventListener("message", evnt => {
    if (evnt.source != window || evnt.data !== messageKey) return;
    evnt.stopPropagation();

    let task = timeouts.shift();
    if (!task || task.canceled) return;
    task.func(...task.args);
  }, true);

  // Now define the external functions to set or cancel a timeout
  window.setZeroTimeout = function(func, ...args) {
    timeouts.push({ id: taskId++, func, args });
    window.postMessage(messageKey, targetOrigin);
    return taskId;
  };

  window.clearZeroTimeout = function(id) {
    let task = timeouts.find(timeout => timeout.id === id);
    if (task) task.canceled = true;
  };
}

function init$1() {
  const tasks = [];
  var taskId = 0;
  var queueIsRunning = false;

  return {
    enqueueTask,
    cancelTask,
    sortTasks,
  };

  function enqueueTask(newTask) {
    let defaultPriority = () => 0;
    tasks.push({ 
      id: taskId++,
      getPriority: newTask.getPriority || defaultPriority,
      chunks: newTask.chunks,
    });
    if (!queueIsRunning) setZeroTimeout(runTaskQueue);
    return taskId;
  }

  function cancelTask(id) {
    let task = tasks.find(task => task.id === id);
    if (task) task.canceled = true;
  }

  function sortTasks() {
    tasks.sort( (a, b) => compareNums(a.getPriority(), b.getPriority()) );
  }

  function compareNums(a, b) {
    if (a === b) return 0;
    return (a === undefined || a < b) ? -1 : 1;
  }

  function runTaskQueue() {
    // Remove canceled and completed tasks
    while (isDone(tasks[0])) tasks.shift();

    queueIsRunning = (tasks.length > 0);
    if (!queueIsRunning) return;

    // Get the next chunk from the current task, and run it
    let chunk = tasks[0].chunks.shift();
    chunk();

    setZeroTimeout(runTaskQueue);
  }

  function isDone(task) {
    return task && (task.canceled || task.chunks.length < 1);
  }
}

const vectorTypes = ["symbol", "circle", "line", "fill"];

function setParams(userParams) {
  const threads = userParams.threads || 2;

  // Confirm supplied styles are all vector layers reading from the same source
  const layers = userParams.layers;
  if (!layers || !layers.length) fail("no valid array of style layers!");

  let allVectors = layers.every( l => vectorTypes.includes(l.type) );
  if (!allVectors) fail("not all layers are vector types!");

  let sameSource = layers.every( l => l.source === layers[0].source );
  if (!sameSource) fail("supplied layers use different sources!");

  // Construct function to get a tile URL
  if (!userParams.source) fail("parameters.source is required!");
  const getURL = initUrlFunc(userParams.source.tiles);

  // Construct the task queue, if not supplied
  const queue = (userParams.queue)
    ? userParams.queue
    : init$1();

  return {
    threads,
    layers,
    getURL,
    queue
  };
}

function initUrlFunc(endpoints) {
  if (!endpoints || !endpoints.length) fail("no valid tile endpoints!");

  // Use a different endpoint for each request
  var index = 0;

  return function(z, x, y) {
    index = (index + 1) % endpoints.length;
    var endpoint = endpoints[index];
    return endpoint.replace(/{z}/, z).replace(/{x}/, x).replace(/{y}/, y);
  };
}

function fail(message) {
  throw Error("ERROR in tile-mixer: " + message);
}

function initWorkers(nThreads, codeHref, styles) {
  const tasks = {};
  var globalMsgId = 0;

  // Initialize the worker threads, and send them the styles
  function trainWorker() {
    const worker = new Worker(codeHref);
    worker.postMessage({ id: 0, type: "styles", payload: styles });
    worker.onmessage = handleMsg;
    return worker;
  }
  const workers = Array.from(Array(nThreads), trainWorker);
  const workLoads = Array.from(Array(nThreads), () => 0);

  return {
    startTask,
    cancelTask,
    activeTasks: () => workLoads.reduce( (a, b) => a + b, 0 ),
    terminate: () => workers.forEach( worker => worker.terminate() ),
  }

  function startTask(payload, callback) {
    let workerID = getIdleWorkerID(workLoads);
    workLoads[workerID] ++;

    const msgId = ++globalMsgId; // Start from 1, since we used 0 for styles
    tasks[msgId] = { callback, workerID };
    workers[workerID].postMessage({ id: msgId, type: "start", payload });

    return msgId; // Returned ID can be used for later cancellation
  }

  function cancelTask(id) {
    let task = tasks[id];
    if (!task) return;
    workers[task.workerID].postMessage({ id, type: "cancel" });
    workLoads[task.workerID] --;
    delete tasks[id];
  }

  function handleMsg(msgEvent) {
    const msg = msgEvent.data; // { id, type, key, payload }
    const task = tasks[msg.id];
    // NOTE: 'this' is the worker that emitted msgEvent
    if (!task) return this.postMessage({ id: msg.id, type: "cancel" });

    switch (msg.type) {
      case "error":
        task.callback(msg.payload);
        break; // Clean up below

      case "header":
        task.header = msg.payload;
        task.result = initJSON(msg.payload);
        return this.postMessage({ id: msg.id, type: "continue" });

      case "compressed":
      case "features":
        let features = task.result[msg.key][msg.type];
        msg.payload.forEach( feature => features.push(feature) );
        return this.postMessage({ id: msg.id, type: "continue" });

      case "done":
        let err = checkResult(task.result, task.header);
        task.callback(err, task.result);
        break; // Clean up below

      default:
        task.callback("ERROR: worker sent bad message type!");
        break; // Clean up below
    }

    workLoads[task.workerID] --;
    delete tasks[msg.id];
  }
}

function getIdleWorkerID(workLoads) {
  let id = 0;
  for (let i = 1; i < workLoads.length; i++) {
    if (workLoads[i] < workLoads[id]) id = i;
  }
  return id;
}

function initJSON(headers) {
  const json = {};
  Object.entries(headers).forEach( ([key, hdr]) => {
    json[key] = { type: "FeatureCollection", compressed: [] };
    if (hdr.features) json[key].features = [];
    if (hdr.properties) json[key].properties = hdr.properties;
  });
  return json;
}

function checkResult(json, header) {
  let allOk = Object.keys(header)
    .every( k => checkData(json[k], header[k]) );

  return allOk
    ? null
    : "ERROR: JSON from worker failed checks!";
}

function checkData(data, counts) {
  // data is a GeoJSON Feature Collection, augmented with 'compressed' array
  var ok = data.compressed.length === counts.compressed;
  if (counts.features) {
    // We also have raw GeoJSON for querying. Check the length
    ok = ok && data.features.length === counts.features;
  }
  return ok;
}

function pointPath(path, point) {
  // Draws a Point geometry, which is an array of two coordinates
  path.moveTo(point[0], point[1]);
  path.lineTo(point[0], point[1]);
}

function linePath(path, points) {
  // Draws a LineString geometry, which is an array of Points.
  var p = points[0], i = 0, n = points.length;
  path.moveTo(p[0], p[1]);
  while (++i < n) p = points[i], path.lineTo(p[0], p[1]);
}

function polygonPath(path, lines) {
  // Draws a Polygon geometry, which is an array of LineStrings
  var i = -1, n = lines.length;
  while (++i < n) linePath(path, lines[i]);
}

const pathFuncs = {
  Point: pointPath,
  LineString: linePath,
  Polygon: polygonPath,
};

function geomToPath(geometry) {
  // Converts a GeoJSON Feature geometry to a Path2D object

  var type = geometry.type;
  var isMulti = type.substring(0, 5) === "Multi";
  if (isMulti) type = type.substring(5);

  const pathFunc = pathFuncs[type];

  const path = new Path2D();

  const coords = geometry.coordinates;
  if (isMulti) {
    // While loops faster than forEach: https://jsperf.com/loops/32
    var i = -1, n = coords.length;
    while (++i < n) pathFunc(path, coords[i]);

  } else {
    pathFunc(path, coords);
  }

  return path;
}

function initDataPrep(styles) {
  // Build a dictionary of data prep functions, keyed on style.id
  const prepFunctions = {};
  styles.forEach(style => {
    prepFunctions[style.id] = (style.type === "symbol")
      ? initTextMeasurer()
      : addPaths;
  });

  // Return a function that creates an array of prep calls for a source
  return function (source, zoom) {
    return Object.keys(source)
      .map( id => () => prepFunctions[id](source[id], zoom) );
  };
}

function initTextMeasurer(style) {
  // TODO: This closure only saves one createElement call. Is it worth it?
  const ctx = document.createElement("canvas").getContext("2d");

  return function(data, zoom) {
    ctx.font = data.properties.font;

    data.compressed.forEach(feature => {
      let labelText = feature.properties.labelText;
      if (!labelText) return;
      feature.properties.textWidth = ctx.measureText(labelText).width;
    });

    return data;
  };
}

function addPaths(data) {
  data.compressed.forEach(feature => {
    // TODO: Does this need to be interruptable?
    feature.path = geomToPath(feature.geometry);
    delete feature.geometry; // Allow it to be garbage collected
  });

  return data;
}

const workerPath = "./worker.bundle.js";

function initTileMixer(userParams) {
  const params = setParams(userParams);
  const queue = params.queue;

  // Initialize workers and data prep function getter
  const workers = initWorkers(params.threads, workerPath, params.layers);
  const getPrepFuncs = initDataPrep(params.layers);

  // Define request function
  function request({ z, x, y, getPriority, callback }) {
    const reqHandle = {};

    const readInfo = { 
      href: params.getURL(z, x, y),
      size: 512, 
      zoom: z 
    };
    const readTaskId = workers.startTask(readInfo, prepData);
    reqHandle.abort = () => workers.cancelTask(readTaskId);

    function prepData(err, source) {
      if (err) return callback(err);

      const chunks = getPrepFuncs(source, z);
      chunks.push( () => callback(null, source) );

      const prepTaskId = queue.enqueueTask({ getPriority, chunks });
      reqHandle.abort = () => queue.cancelTask(prepTaskId);
    }

    return reqHandle;
  }

  // Return API
  return {
    request,
    activeTasks: () => workers.activeTasks(),
    terminate: () => workers.terminate(),
  };
}

function initRasterSource(source) {
  const getURL = initUrlFunc$1(source.tiles);

  function request({z, x, y, callback}) {
    const href = getURL(z, x, y);
    const errMsg = "ERROR in loadImage for href " + href;

    const img = new Image();
    img.onerror = () => callback(errMsg);
    img.onload = () => (img.complete && img.naturalWidth !== 0)
      ? callback(null, img)
      : callback(errMsg);

    img.crossOrigin = "anonymous";
    img.src = href;

    const reqHandle = {};
    reqHandle.abort = () => { img.src = ""; };

    return reqHandle;
  }

  return { request };
}

function initUrlFunc$1(endpoints) {
  if (!endpoints || !endpoints.length) fail$1("no valid tile endpoints!");

  // Use a different endpoint for each request
  var index = 0;

  return function(z, x, y) {
    index = (index + 1) % endpoints.length;
    var endpoint = endpoints[index];
    return endpoint.replace(/{z}/, z).replace(/{x}/, x).replace(/{y}/, y);
  };
}

function fail$1(message) {
  throw Error("ERROR in raster-source: " + message);
}

function initSources(styleDoc, queue, numThreads = 4) {
  const sources = styleDoc.sources;

  // Find the number of Worker threads we can use for each vector source
  const nvec = Object.values(sources).filter(s => s.type === "vector").length;
  const threads = (nvec > 0) ? Math.ceil(numThreads / nvec) : nvec;

  // Initialize a data getter for each source (raster or vector tiles only)
  const getters = {};
  Object.entries(sources).forEach( ([key, source]) => {
    if (!source.tiles || source.tiles.length < 1) return;

    if (source.type === "raster") getters[key] = initRasterSource(source);

    if (source.type !== "vector") return;

    // Vector tiles: Get the layers using this source, and initialize mixer
    let layers = styleDoc.layers.filter(l => l.source === key);
    getters[key] = initTileMixer({ threads, source, layers, queue });
  });

  return function collectSources({ z, x, y, getPriority, callback }) {
    // Collect data from all soures into one object
    const dataCollection = {};
    const loadTasks = {};
    var numToDo = Object.keys(getters).length;

    Object.entries(getters).forEach( ([key, getter]) => {
      loadTasks[key] = getter.request({
        z, x, y, getPriority, 
        callback: (err, data) => collectData(err, key, data),
      });
    });

    function collectData(err, key, data) {
      if (err) console.log(err);

      dataCollection[key] = data;
      delete loadTasks[key];
      if (--numToDo > 0) return;

      return callback(null, dataCollection);
    }

    // Return a handle that allows for cancellation of ongoing tasks
    const handle = {
      cancel: () => Object.values(loadTasks).forEach(task => task.abort()),
    };

    return handle;
  }
}

function initTileFactory(styleDoc, canvasSize, queue, nThreads) {

  const getData = initSources(styleDoc, queue, nThreads);

  return function order(z, x, y, callback = () => true) {
    let img = document.createElement("canvas");
    img.width = img.height = canvasSize;

    const tile = {
      z, x, y,
      id: z + "/" + x + "/" + y,
      priority: 0,

      img,
      ctx: img.getContext("2d"),
      rendered: false,
    };

    const loadTask = getData({
      z, x, y,
      getPriority: () => tile.priority,
      callback: addData,
    });

    tile.cancel = () => {
      loadTask.cancel();
      tile.canceled = true;
    };

    function addData(err, data) {
      if (err) console.log(err);
      tile.sources = data;
      tile.loaded = true;
      return callback(null, tile);
    }

    return tile;
  }
}

// Renders layers that cover the whole tile (like painting with a roller)

function initBackgroundFill(layout, paint, canvSize) {
  return function(ctx, zoom) {
    ctx.fillStyle = paint["background-color"](zoom);
    ctx.globalAlpha = paint["background-opacity"](zoom);
    ctx.fillRect(0, 0, canvSize, canvSize);
  }
}

function initRasterFill(layout, paint, canvSize) {
  return function(ctx, zoom, image) {
    ctx.globalAlpha = paint["raster-opacity"](zoom);
    // TODO: we are forcing one tile to cover the canvas!
    // In some cases (e.g. Mapbox Satellite Streets) the raster tiles may
    // be half the size of the vector canvas, so we need 4 of them...
    ctx.drawImage(image, 0, 0, canvSize, canvSize);
  }
}

function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
}

function initBrush({ setters, methods }) {
  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  return function(ctx, zoom, data) {
    // Set the non-data-dependent context state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), ctx));

    // Loop over features and draw
    data.compressed.forEach(feature => drawFeature(ctx, zoom, feature));
  }

  function drawFeature(ctx, zoom, feature) {
    // Set data-dependent context state
    dataFuncs.forEach(f => f.setState(f.getStyle(zoom, feature), ctx));

    // Draw path
    methods.forEach(method => ctx[method](feature.path));
  }
}

function makePatternSetter(sprite) {
  return function(spriteID, ctx) {
    const sMeta = sprite.meta[spriteID];
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = sMeta.width;
    patternCanvas.height = sMeta.height;
    const pCtx = patternCanvas.getContext("2d");
    pCtx.drawImage(
      sprite.image, 
      sMeta.x, 
      sMeta.y, 
      sMeta.width, 
      sMeta.height,
      0,
      0,
      sMeta.width,
      sMeta.height
    );
    ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
  };
}

function initCircle(layout, paint) {
  const setRadius = (radius, ctx) => ctx.lineWidth = radius * 2;
  const setters = [
    pair(paint["circle-radius"],  setRadius),
    pair(paint["circle-color"],   canv("strokeStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
    pair(() => "round",           canv("lineCap")),
  ];
  const methods = ["stroke"];

  return initBrush({ setters, methods });
}

function initLine(layout, paint) {
  const setters = [
    pair(layout["line-cap"],      canv("lineCap")),
    pair(layout["line-join"],     canv("lineJoin")),
    pair(layout["line-miter-limit"], canv("miterLimit")),
    // line-round-limit,

    pair(paint["line-width"],     canv("lineWidth")),
    pair(paint["line-opacity"],   canv("globalAlpha")),
    pair(paint["line-color"],     canv("strokeStyle")),
    // line-gap-width, 
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern, 
  ];

  let dasharray = paint["line-dasharray"];
  if (dasharray.type !== "constant" || dasharray() !== undefined) {
    const getWidth = paint["line-width"];
    const getDash = (zoom, feature) => {
      let width = getWidth(zoom, feature);
      let dashes = dasharray(zoom, feature);
      return dashes.map(d => d * width);
    };
    const setDash = (dash, ctx) => ctx.setLineDash(dash);
    setters.push( pair(getDash, setDash) );
  }  const methods = ["stroke"];

  return initBrush({ setters, methods });
}

function initFill(layout, paint, sprite) {
  var getStyle, setState;

  let pattern = paint["fill-pattern"];
  if (pattern.type !== "constant" || pattern() !== undefined) {
    // Fill with a repeated sprite. Style getter returns sprite name
    getStyle = pattern;
    setState = makePatternSetter(sprite);
  } else {
    // Fill with a solid color
    getStyle = paint["fill-color"];
    setState = canv("fillStyle");
  }

  const setters = [
    pair(getStyle, setState),
    pair(paint["fill-opacity"],   canv("globalAlpha")),
    pair(paint["fill-translate"], (t, ctx) => ctx.translate(t[0], t[1])),
    // fill-translate-anchor,
  ];
  const methods = ["fill"];

  let outline = paint["fill-outline-color"];
  if (outline.type !== "constant" || outline() !== undefined) {
    setters.push(
      pair(paint["fill-outline-color"], canv("strokeStyle")),
      pair(paint["fill-outline-width"], canv("lineWidth")), // nonstandard
    );
    methods.push("stroke");
  }

  return initBrush({ setters, methods });
}

function getTextShift(anchor) {
  // We use the Canvas 2D settings 
  //  textBaseline = "bottom", textAlign = "left"
  // and shift the text box based on the specified "text-anchor"
  // Returned values will be scaled by the text box dimensions
  switch (anchor) {
    case "top-left":
      return [ 0.0, 1.0];
    case "top-right":
      return [-1.0, 1.0];
    case "top":
      return [-0.5, 1.0];
    case "bottom-left":
      return [ 0.0, 0.0];
    case "bottom-right":
      return [-1.0, 0.0];
    case "bottom":
      return [-0.5, 0.0];
    case "left":
      return [ 0.0, 0.5];
    case "right":
      return [-1.0, 0.5];
    case "center":
    default:
      return [-0.5, 0.5];
  }
}

function initTextLabeler(ctx, zoom, layout, paint) {
  const fontSize = layout["text-size"](zoom);
  const lineHeight = layout["text-line-height"](zoom);
  const textPadding = layout["text-padding"](zoom);
  const textOffset = layout["text-offset"](zoom);

  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  const posShift = getTextShift( layout["text-anchor"](zoom) );

  const haloWidth = paint["text-halo-width"](zoom);
  if (haloWidth > 0) {
    ctx.lineWidth = haloWidth * 2.0;
    ctx.lineJoin = "round";
    ctx.strokeStyle = paint["text-halo-color"](zoom);
  }
  ctx.fillStyle = paint["text-color"](zoom);

  var labelText, labelLength, labelHeight, x, y;

  return { measure, draw };

  function measure(feature) {
    labelText = feature.properties.labelText;
    if (!labelText) return;

    labelLength = feature.properties.textWidth;
    labelHeight = fontSize * lineHeight;

    // Compute coordinates of bottom left corner of text
    var coords = feature.geometry.coordinates;
    x = coords[0] + posShift[0] * labelLength + textOffset[0] * fontSize;
    y = coords[1] + posShift[1] * labelHeight + textOffset[1] * labelHeight;

    // Return a bounding box object
    return [
      [x - textPadding, y - labelHeight - textPadding],
      [x + labelLength + textPadding, y + textPadding]
    ];
  }

  function draw() {
    if (!labelText) return;

    if (haloWidth > 0) ctx.strokeText(labelText, x, y);
    ctx.fillText(labelText, x, y);
  }
}

function initIconLabeler(ctx, zoom, layout, paint, sprite) {
  const iconPadding = layout["icon-padding"](zoom);

  var spriteID, spriteMeta, x, y;

  return { measure, draw };

  function measure(feature) {
    spriteID = feature.properties.spriteID;
    if (!spriteID) return;

    spriteMeta = sprite.meta[spriteID];

    var coords = feature.geometry.coordinates;
    x = Math.round(coords[0] - spriteMeta.width / 2);
    y = Math.round(coords[1] - spriteMeta.height / 2);

    return [
      [x - iconPadding, y - iconPadding],
      [x + spriteMeta.width + iconPadding, y + spriteMeta.height + iconPadding]
    ];
  } 

  function draw() {
    if (!spriteID) return;

    ctx.drawImage(
      sprite.image,
      spriteMeta.x,
      spriteMeta.y,
      spriteMeta.width,
      spriteMeta.height,
      x,
      y,
      spriteMeta.width,
      spriteMeta.height
    );
  }
}

function initLabeler(layout, paint, sprite, canvasSize) {
  // Skip unsupported symbol types
  if (layout["symbol-placement"]() === "line") return () => undefined;

  const tileBox = [[0, 0], [canvasSize, canvasSize]];

  return function(ctx, zoom, data, boxes) {
    ctx.font = data.properties.font;
    const textLabeler = initTextLabeler(ctx, zoom, layout, paint);
    const iconLabeler = initIconLabeler(ctx, zoom, layout, paint, sprite);

    data.compressed.forEach(drawLabel);

    function drawLabel(feature) {
      var textBox = textLabeler.measure(feature);
      if ( collides(textBox) ) return;

      var iconBox = iconLabeler.measure(feature);
      if ( collides(iconBox) ) return;

      // Draw the labels, IF they are inside the tile
      if ( iconBox && intersects(tileBox, iconBox) ) {
        iconLabeler.draw();
        boxes.push(iconBox);
      }
      if ( textBox && intersects(tileBox, textBox) ) {
        textLabeler.draw();
        boxes.push(textBox);
      }
    }

    function collides(newBox) {
      if (!newBox) return false;
      return boxes.some( box => intersects(box, newBox) );
    }
  }
}

function intersects(box1, box2) {
  // box[0] = [xmin, ymin]; box[1] = [xmax, ymax]
  if (box1[0][0] > box2[1][0]) return false;
  if (box2[0][0] > box1[1][0]) return false;
  if (box1[0][1] > box2[1][1]) return false;
  if (box2[0][1] > box1[1][1]) return false;

  return true;
}

function getPainter(style, sprite, canvasSize) {
  const painter = makePaintFunction(style, sprite, canvasSize);

  return function(context, zoom, data, boundingBoxes) {
    if (!data) return false;
    if (style.layout.visibility() === "none") return false;

    // Save the initial context state, and restore it after rendering
    context.save();
    painter(context, zoom, data, boundingBoxes);
    context.restore();

    return true; // return value indicates whether canvas has changed
  };
}

function makePaintFunction(style, sprite, canvasSize) {
  switch (style.type) {
    case "background":
      return initBackgroundFill(style.layout, style.paint, canvasSize);
    case "raster":
      return initRasterFill(style.layout, style.paint, canvasSize);
    case "symbol":
      return initLabeler(style.layout, style.paint, sprite, canvasSize);
    case "circle":
      return initCircle(style.layout, style.paint);
    case "line":
      return initLine(style.layout, style.paint);
    case "fill":
      return initFill(style.layout, style.paint, sprite);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}

function initPainter(params) {
  const style = params.styleLayer;
  const canvasSize = params.canvasSize || 512;
  const paint = getPainter(style, params.spriteObject, canvasSize);

  // Define data getter
  const sourceName = style["source"];
  const getData = makeDataGetter(style);

  // Compose data getter and painter into one function
  return function(context, zoom, sources, boundingBoxes) {
    let data = getData(sources[sourceName], zoom);
    return paint(context, zoom, data, boundingBoxes);
  }
}

function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;

  const minzoom = style.minzoom || 0;
  const maxzoom = style.maxzoom || 99; // NOTE: doesn't allow maxzoom = 0

  // Raster layers don't need any data processing
  if (style.type === "raster") return function(source, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    return source;
  }

  return function(source, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    if (source) return source[style.id];
  };
}

function initRenderer(styleDoc, canvasSize, queue) {
  const spriteObject = styleDoc.spriteData;

  // Reverse the order of the symbol layers, for correct collision checking
  const labels = styleDoc.layers
    .filter(l => l.type === "symbol");
  const layers = styleDoc.layers
    .filter( l => l.type !== "symbol" )
    .concat( labels.reverse() )
    .map( getStyleFuncs )
    .map( makeLayerFunc );

  function makeLayerFunc(styleLayer) {
    const paint = initPainter({ styleLayer, spriteObject, canvasSize });
    return { paint, id: styleLayer.id, visible: true };
  }

  function setLayerVisibility(id, visibility) {
    var layer = layers.find(l => l.id === id);
    if (layer) layer.visible = visibility;
  }

  function drawLayers(tile, callback) {
    if (tile.canceled) return;
    const bboxes = [];

    layers.forEach(layer => {
      if (!layer.visible) return;
      layer.paint(tile.ctx, tile.z, tile.sources, bboxes);
    });

    tile.rendered = true;
    tile.rendering = false;
    tile.cancel = () => false;

    return callback(null, tile);
  }

  function queueDraw(tile, callback = () => true) {
    if (tile.canceled || !tile.loaded) return;
    if (tile.rendered || tile.rendering) return;

    tile.rendering = true;

    const getPriority = () => tile.priority;
    const chunks = [ () => drawLayers(tile, callback) ];
    const renderTaskId = queue.enqueueTask({ getPriority, chunks });

    tile.cancel = () => { // Is this necessary?
      queue.cancelTask(renderTaskId);
      tile.rendering = false; // TODO: unnecessary?
      tile.canceled = true;
    };
  }

  return {
    draw: queueDraw,
    hideLayer: (id) => setLayerVisibility(id, false),
    showLayer: (id) => setLayerVisibility(id, true),
  };
}

function init$2(params) {
  // Process parameters, substituting defaults as needed
  var canvSize = params.size || 512;
  var styleURL = params.style;   // REQUIRED
  var mbToken  = params.token;   // May be undefined
  var nThreads = params.threads || 4;

  // Create dummy API for instant return
  const api = {
    create: () => null,
    redraw: () => null,
    hideLayer: () => null,
    showLayer: () => null,
    sortTasks: () => null,
  };

  // Load the style, and then set everything up
  api.promise = loadStyle(styleURL, mbToken)
    .then( styleDoc => setup(styleDoc, canvSize, nThreads, api) );

  return api;
}

function setup(styleDoc, canvSize, nThreads, api) {
  const queue = init();
  const orderTile = initTileFactory(styleDoc, canvSize, queue, nThreads);
  const renderer = initRenderer(styleDoc, canvSize, queue);

  function create(z, x, y, cb = () => undefined, reportTime) {
    // Wrap the callback to add time reporting
    let t0 = performance.now();

    function orderTimer(err, tile) { // Track ordering time
      if (err) return cb(err);
      let t1 = performance.now();

      function renderTimer(msg, data) { // Track rendering time
        let t2 = performance.now();
        cb(msg, data, t2 - t1, t1 - t0);
      }

      renderer.draw(tile, renderTimer);
    }

    return orderTile(z, x, y, orderTimer);
  }

  // Update api
  api.style = styleDoc;
  api.create = create;
  api.redraw = renderer.draw;
  api.hideLayer = renderer.hideLayer;
  api.showLayer = renderer.showLayer;
  api.sortTasks = queue.sortTasks;

  return api;
}

export { init$2 as init };
