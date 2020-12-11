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
const FaceTracking = require('FaceTracking');
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
    },
    eye: {
        left:{
            center: {x: 0, y: 0}
        },
        right:{
            center: {x: 0, y: 0}
        }
    },
    nose: {
        bridge: {
            top: { x: 0, y: 0},
            middle: {x: 0, y: 0},
            bottom: { x: 0, y: 0}
        },
        nostrils: {
            left: { x: 0, y: 0},
            right: { x: 0, y: 0},
            center: { x: 0, y: 0}
        }
    },
    mouth: {
        sides: {
            left: {x: 0, y: 0},
            right: {x: 0, y: 0}
        },
        lips: {
            top: {x: 0, y: 0},
            bottom: {x: 0, y: 0},
            topLeft: {x: 0, y: 0},
            topRight: {x: 0, y: 0},
            bottomLeft: {x: 0, y: 0},
            bottomRight: {x: 0, y: 0}
        }
    }
};
let gameWidth = 0;
let gameHeight = 0;
let connectorHeight = 0;
let eyeOpenness = {
    left: 0,
    right: 0
}
Scene.root.findFirst('sizer').then(function (r) {
    FaceTracking.face(0).leftEye.openness.monitor().subscribe(function (value) {
        // Diagnostics.log(value.newValue);
        eyeOpenness.left = value.newValue;
    });
    FaceTracking.face(0).rightEye.openness.monitor().subscribe(function (value) {
        // Diagnostics.log(value.newValue);
        eyeOpenness.right = value.newValue;
    });
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

    mapProperty('leftEye', ['eye', 'left', 'center']);
    mapProperty('rightEye', ['eye', 'right', 'center']);

    mapProperty('noseBridge', ['nose', 'bridge', 'top']);
    mapProperty('noseTip', ['nose', 'bridge', 'bottom']);

    mapProperty('upperLipCenter', ['mouth', 'lips', 'top']);
    mapProperty('lowerLipCenter', ['mouth', 'lips', 'bottom']);
    mapProperty('mouthLeftCorner', ['mouth', 'sides', 'left']);
    mapProperty('mouthRightCorner', ['mouth', 'sides', 'right']);
    

    Scene.root.findFirst('timeTracker').then(function (result) {
        result.worldTransform.position.x.monitor().subscribe(function (value) {
            placeBar('eyebrow_left_x', 'eyebrow_left_y', 'eyebrow_left_width', 'eyebrow_left_angle', ['eyebrows', 'left', 'top'], ['eyebrows', 'left', 'outside']);
            placeBar('eyebrow_right_x', 'eyebrow_right_y', 'eyebrow_right_width', 'eyebrow_right_angle', ['eyebrows', 'right', 'top'], ['eyebrows', 'right', 'outside']);

            placeBar('inner_eyebrow_left_x', 'inner_eyebrow_left_y', 'inner_eyebrow_left_width', 'inner_eyebrow_left_angle', ['eyebrows', 'left', 'inside'], ['eyebrows', 'left', 'top']);
            placeBar('inner_eyebrow_right_x', 'inner_eyebrow_right_y', 'inner_eyebrow_right_width', 'inner_eyebrow_right_angle', ['eyebrows', 'right', 'inside'], ['eyebrows', 'right', 'top']);

            facePoints.nose.nostrils.center = getBetweenPoint(facePoints.nose.nostrils.left, facePoints.nose.nostrils.right, true);

            facePoints.nose.bridge.middle = getBetweenPoint(facePoints.nose.bridge.top, facePoints.nose.bridge.bottom, true);

            placeBar('bridge_front_x', 'bridge_front_y', 'bridge_front_width', 'bridge_front_angle', ['nose', 'bridge', 'bottom'], ['nose', 'bridge', 'middle']);

            const eyeSize = {w: gameWidth * .05, h: gameWidth * .05};

            Patches.inputs.setScalar('left_eye_x', facePoints.eye.left.center.x - (eyeSize.w / 2));
            Patches.inputs.setScalar('left_eye_y', facePoints.eye.left.center.y - (eyeSize.h / 2));
            Patches.inputs.setScalar('right_eye_x', facePoints.eye.right.center.x - (eyeSize.w / 2));
            Patches.inputs.setScalar('right_eye_y', facePoints.eye.right.center.y - (eyeSize.h / 2));
            
            Patches.inputs.setScalar('left_eye_width', eyeSize.w);
            Patches.inputs.setScalar('left_eye_height', eyeSize.h * (eyeOpenness.left + .1));
            Patches.inputs.setScalar('right_eye_width', eyeSize.w);
            Patches.inputs.setScalar('right_eye_height', eyeSize.h * (eyeOpenness.right + .1));

            const eyeAngle = getAngle(facePoints.eye.left.center.x, facePoints.eye.left.center.y, facePoints.eye.right.center.x, facePoints.eye.right.center.y);
            
            Patches.inputs.setScalar('left_eye_angle', (eyeAngle * -1) - 90);
            Patches.inputs.setScalar('right_eye_angle', (eyeAngle * -1) - 90);
            
            let bridgeParams = getBetweenPoint(facePoints.nose.bridge.bottom, facePoints.nose.bridge.top, true);
            Patches.inputs.setScalar('bridge_front_x', (bridgeParams.x - (bridgeParams.width / 2)) + connectorHeight);


            const topLeftDistance = getDistance(facePoints.mouth.lips.top.x, facePoints.mouth.lips.top.y, facePoints.mouth.sides.left.x, facePoints.mouth.sides.left.y);
            const topRightDistance = getDistance(facePoints.mouth.lips.top.x, facePoints.mouth.lips.top.y, facePoints.mouth.sides.right.x, facePoints.mouth.sides.right.y);

            const bottomLeftDistance = getDistance(facePoints.mouth.lips.bottom.x, facePoints.mouth.lips.bottom.y, facePoints.mouth.sides.left.x, facePoints.mouth.sides.left.y);
            const bottomRightDistance = getDistance(facePoints.mouth.lips.bottom.x, facePoints.mouth.lips.bottom.y, facePoints.mouth.sides.right.x, facePoints.mouth.sides.right.y);

            const leftToRightAngle = getAngle(facePoints.mouth.sides.left.x, facePoints.mouth.sides.left.y, facePoints.mouth.sides.right.x, facePoints.mouth.sides.right.y);


            facePoints.mouth.lips.topLeft = {
                x: getOrbit(facePoints.mouth.lips.top.x, topLeftDistance / 2, leftToRightAngle + 180, 'cos'),
                y: getOrbit(facePoints.mouth.lips.top.y, topLeftDistance / 2, leftToRightAngle + 180, 'sin')
            }

            facePoints.mouth.lips.topRight = {
                x: getOrbit(facePoints.mouth.lips.top.x, topRightDistance / 2, leftToRightAngle, 'cos'),
                y: getOrbit(facePoints.mouth.lips.top.y, topRightDistance / 2, leftToRightAngle, 'sin')
            }

            facePoints.mouth.lips.bottomLeft = {
                x: getOrbit(facePoints.mouth.lips.bottom.x, bottomLeftDistance / 2, leftToRightAngle + 180, 'cos'),
                y: getOrbit(facePoints.mouth.lips.bottom.y, bottomLeftDistance / 2, leftToRightAngle + 180, 'sin')
            }

            facePoints.mouth.lips.bottomRight = {
                x: getOrbit(facePoints.mouth.lips.bottom.x, bottomRightDistance / 2, leftToRightAngle, 'cos'),
                y: getOrbit(facePoints.mouth.lips.bottom.y, bottomRightDistance / 2, leftToRightAngle, 'sin')
            }
            Diagnostics.log(leftToRightAngle);

            placeBar('upper_center_lip_x', 'upper_center_lip_y', 'upper_center_lip_width', 'upper_center_lip_angle', ['mouth', 'lips', 'topLeft'], ['mouth', 'lips', 'topRight']);
            placeBar('left_center_lip_x', 'left_center_lip_y', 'left_center_lip_width', 'left_center_lip_angle', ['mouth', 'lips', 'topLeft'], ['mouth', 'sides', 'left']);
            placeBar('right_center_lip_x', 'right_center_lip_y', 'right_center_lip_width', 'right_center_lip_angle', ['mouth', 'lips', 'topRight'], ['mouth', 'sides', 'right']);

            placeBar('lower_center_lip_x', 'lower_center_lip_y', 'lower_center_lip_width', 'lower_center_lip_angle', ['mouth', 'lips', 'bottomLeft'], ['mouth', 'lips', 'bottomRight']);
            placeBar('left_lower_lip_x', 'left_lower_lip_y', 'left_lower_lip_width', 'left_lower_lip_angle', ['mouth', 'lips', 'bottomLeft'], ['mouth', 'sides', 'left']);
            placeBar('right_lower_lip_x', 'right_lower_lip_y', 'right_lower_lip_width', 'right_lower_lip_angle', ['mouth', 'lips', 'bottomRight'], ['mouth', 'sides', 'right']);
        });
    });
});

function getBetweenPoint(p1, p2, overrideOffset){
    const offset = overrideOffset ? {x: 0, y: 0} : {
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
    const angleBeteen = getAngle(facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]].x, facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]].y, facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]].x,  facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]].x);
    const refactoredAgle = (angleBeteen + 360) % 180;
    let left = getBetweenPoint(facePoints[propertyChain1[0]][propertyChain1[1]][propertyChain1[2]], facePoints[propertyChain2[0]][propertyChain2[1]][propertyChain2[2]]);
    Patches.inputs.setScalar(xName, left.x - ((left.width / 2) * (refactoredAgle / 180)) + connectorHeight);
    // Patches.inputs.setScalar(xName, left.x);
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

function getOrbit(_center, _radius, _angle, orbitType) {

    var _num1 = _center;
    var _num2 = _radius;
    var _num3 = _angle;
    var theCent = _num1;
    var radius = _num2;
    var angle = _num3 - 90;
    var ot = orbitType;
    var resultVal;
    if (ot == "cos") {
        resultVal = theCent + (Math.cos((angle) * (Math.PI / 180)) * radius);
    }
    if (ot == "sin") {
        resultVal = theCent + (Math.sin((angle) * (Math.PI / 180)) * radius);
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
