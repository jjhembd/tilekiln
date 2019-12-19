'use strict';

import * as tilekiln from "../../dist/tile-kiln.bundle.js";
import { initMapControl } from "./map-control.js";

export function main() {
  tilekiln.init({
    size: 512,
    style: "./macrostrat-onepass.json",
    token: "pk.eyJ1IjoiamhlbWJkIiwiYSI6ImNqcHpueHpyZjBlMjAzeG9kNG9oNzI2NTYifQ.K7fqhk2Z2YZ8NIV94M-5nA",
  }).then(setup)
    .catch(console.log);
}

function setup(api) {
  // Initialize the display canvas and rendering context
  const canvas = document.getElementById("map");
  canvas.width = canvas.height = 512;
  const dctx = canvas.getContext("2d");

  // Get a link to the tile coordinates printout
  var title = document.getElementById("zxy");
  const coords = { z: 6, x: 16, y: 25 };

  // Get a link to the feature info printout
  var info = document.getElementById("info");

  // Get first tile, setup interaction
  var currentTile = api.create(coords.z, coords.x, coords.y, display, true);
  initMapControl(coords, update);

  // Set up toggle for burwell polygons
  var burwellVisible = true;
  document.getElementById("toggleBurwell")
    .addEventListener("click", () => {
      burwellVisible = !burwellVisible;
      setVisibility("burwell", burwellVisible);
    }, false);

  // Set up toggle for labels
  var labelsVisible = true;
  document.getElementById("toggleLabels")
    .addEventListener("click", () => {
      labelsVisible = !labelsVisible;
      setVisibility("labels", labelsVisible);
    }, false);

  // Define misc functions
  function update() {
    currentTile = api.create(coords.z, coords.x, coords.y, display, true);
  }

  function display(err, tile, time) {
    if (err) return console.log(err);
    // Copy the renderer canvas onto our display canvas
    dctx.drawImage(tile.img, 0, 0);
    title.innerHTML = "z/x/y = " + coords.z + "/" + coords.x + "/" + coords.y;
    info.innerHTML = "Render time: " + Math.round(time) + "ms";
  }

  function setVisibility(group, visibility) {
    if (visibility) {
      api.showGroup(group);
    } else {
      api.hideGroup(group);
    }
    currentTile.rendered = false;
    api.redraw(currentTile, display);
  }
}
