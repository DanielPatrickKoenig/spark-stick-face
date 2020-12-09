/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Patches = require('Patches');
const featureScale = -1200;
let facePoints = {
    eyebrows: {
        left: {
            outside: {x: 0, y: 0},
            top: {x: 0, y: 0},
            inside: {x: 0, y: 0}
        },
        right: {
            outside: {x: 0, y: 0},
            top: {x: 0, y: 0},
            inside: {x: 0, y: 0}
        }
    }
};
let gameWidth = 0;
let gameHeight = 0;
let connectorHeight = 0;
Scene.root.findFirst('sizer').then(function (r) {
    r.transform.position.x.monitor().subscribe(function (_value) {
        gameWidth = _value.newValue * 2;
        connectorHeight = gameWidth * .02;
        Patches.inputs.setScalar('connector_height', connectorHeight);
    });
    r.transform.position.y.monitor().subscribe(function (_value) {
        gameHeight = _value.newValue * 2;
    });
    Scene.root.findFirst('canvas0').then(function (_r) {
        const canvasBounds = _r.bounds;
        Patches.inputs.setScalar('horizontal_center', canvasBounds.width.mul(.5));
        Patches.inputs.setScalar('vertical_center', canvasBounds.height.mul(.5));
    });


    mapProperty('leftEyebrowTop', ['eyebrows', 'left', 'top']);
    mapProperty('rightEyebrowTop', ['eyebrows', 'right', 'top']);

    mapProperty('leftEyebrowOutside', ['eyebrows', 'left', 'outside']);
    mapProperty('rightEyebrowOutside', ['eyebrows', 'right', 'outside']);

    mapProperty('leftEyebrowInside', ['eyebrows', 'left', 'inside']);
    mapProperty('rightEyebrowInside', ['eyebrows', 'right', 'inside']);

    Scene.root.findFirst('timeTracker').then(function (result) {
        result.worldTransform.position.x.monitor().subscribe(function (value) {
            placeBar('eyebrow_left_x', 'eyebrow_left_y', 'eyebrow_left_width', 'eyebrow_left_angle', ['eyebrows', 'left', 'top'], ['eyebrows', 'left', 'outside']);
            placeBar('eyebrow_right_x', 'eyebrow_right_y', 'eyebrow_right_width', 'eyebrow_right_angle', ['eyebrows', 'right', 'top'], ['eyebrows', 'right', 'outside']);

            placeBar('inner_eyebrow_left_x', 'inner_eyebrow_left_y', 'inner_eyebrow_left_width', 'inner_eyebrow_left_angle', ['eyebrows', 'left', 'inside'], ['eyebrows', 'left', 'top']);
            placeBar('inner_eyebrow_right_x', 'inner_eyebrow_right_y', 'inner_eyebrow_right_width', 'inner_eyebrow_right_angle', ['eyebrows', 'right', 'inside'], ['eyebrows', 'right', 'top']);
        });

    });
});

function getBetweenPoint(p1, p2){
    const offset =  {
        x: p1.x > p2.x ? (p1.x - p2.x) / -2 : (p2.x - p1.x) / -2, 
        y: connectorHeight * -.5
    }
    return {
        x: p1.x + ((p2.x - p1.x) / 2) + offset.x,
        y: p1.y + ((p2.y - p1.y) / 2) + offset.y,
        width: getDistance(p1.x, p1.y, p2.x, p2.y)
    }
}
function mapProperty(gameElement, propertyChain){
    Scene.root.findFirst(gameElement).then(function (result) {
        result.worldTransform.position.x.monitor().subscribe(function (value) {
            facePoints[propertyChain[0]][propertyChain[1]][propertyChain[2]].x = (value.newValue * featureScale) + (gameWidth / 2);
        });
        result.worldTransform.position.y.monitor().subscribe(function (value) {
            facePoints[propertyChain[0]][propertyChain[1]][propertyChain[2]].y = (value.newValue * featureScale) + (gameHeight / 2);
        });
    });
}

function placeBar(xName, yName, widthName, angleName, propertyChain1, propertyChain2){
    let left = getBetweenPoint(facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]], facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]]);
            Patches.inputs.setScalar(xName, left.x);
            Patches.inputs.setScalar(yName, left.y);
            Patches.inputs.setScalar(widthName, left.width);
            Patches.inputs.setScalar(angleName, (getAngle(facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]].x, facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]].y, facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]].x, facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]].y) + 90) * -1);
}

function getDistance(x1, y1, x2, y2) {

    var distx = x2 - x1;
    var disty = y2 - y1;
    return Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2));
}
function getAngle(x1, y1, x2, y2) {

    var distx = x2 - x1;
    var disty = y2 - y1;
    var masterdist = getDistance(x1, y1, x2, y2);
    var primary_anglex = distx / masterdist;
    var anglex = Math.asin(primary_anglex) * 180 / Math.PI;
    var primary_angley = disty / masterdist;
    var angley = Math.asin(primary_angley) * 180 / Math.PI;
    var resultVal;
    if (disty < 0) {
        resultVal = anglex;
    }
    else if (disty >= 0 && distx >= 0) {
        resultVal = angley + 90;
    }
    else if (disty >= 0 && distx < 0) {
        resultVal = (angley * -1) - 90;
    }
    return resultVal;
}


// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

// Enables async/await in JS [part 1]
(async function() {

// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// To access scene objects
// const [directionalLight] = await Promise.all([
//   Scene.root.findFirst('directionalLight0')
// ]);

// To access class properties
// const directionalLightIntensity = directionalLight.intensity;

// To log messages to the console
// Diagnostics.log('Console message logged from the script.');

// Enables async/await in JS [part 2]
})();
