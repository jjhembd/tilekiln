'use strict';

import * as tilekiln from "../../dist/tile-kiln.bundle.js";
import { initMapControl } from "./map-control.js";

export function main() {
  tilekiln.init({
    size: 512,
    style: "./geotiff-style.json",
    //style: "mapbox://styles/mapbox/satellite-streets-v9",
    token: "pk.eyJ1IjoiamhlbWJkIiwiYSI6ImNqcHpueHpyZjBlMjAzeG9kNG9oNzI2NTYifQ.K7fqhk2Z2YZ8NIV94M-5nA",
  }).then(setup)
    .catch(console.log);
}

function setup(api) {
  // Get a link to the tile coordinates printout
  const canvas = document.getElementById("map");
  canvas.width = canvas.height = 512;
  const dctx = canvas.getContext("2d");
  var title = document.getElementById("zxy");
  const coords = { z: 5, x: 6, y: 12 };

  // Get a link to the feature info printout
  var info = document.getElementById("info");

  // Get first tile, setup interaction
  var currentTile = api.create(coords.z, coords.x, coords.y, display, true);
  initMapControl(coords, update);

  // Define misc functions
  function update() {
    currentTile = api.create(coords.z, coords.x, coords.y, display, true);
  }

  function display(err, tile, time) {
    if (err) return console.log(err);
    // Copy the renderer canvas onto our display canvas
    var t2, t3;
    t2=performance.now();
    
    dctx.drawImage(tile.img, 0, 0);
    
    t3=performance.now();
    
    let timePaint = (t3 - t2).toFixed(3) + "ms";
    console.log("paintCanvas: time = " + timePaint);
    
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