
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl';
// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

// tfjsWasm.setWasmPaths(
//     `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

const detectorConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 640, height: 480 },
    multiplier: 0.75
};

const estimationConfig = {
    maxPoses: 1,
    flipHorizontal: false,
    scoreThreshold: 0.5,
    nmsRadius: 20
};

const detector = await poseDetection.createDetector(poseDetection.SupportedModels.PoseNet, detectorConfig);

const video = document.getElementById('video');

const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 3;


export default async function init() {
    await startVideo(video);

    video.width = video.videoWidth;
    video.height = video.videoHeight;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.style.cssText = 'width: auto; height: 100vh; overflow: hidden;'

    processVideo();
}

async function processVideo() {
    const pose = (await detector.estimatePoses(video, estimationConfig))[0];


    ctx.drawImage(video, 0, 0)

    ctx.fillStyle = 'White';
    ctx.strokeStyle = 'Red';
    ctx.lineWidth = 3;

    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.PoseNet).forEach(([
        i, j
    ]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = 0.4;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });

    requestAnimationFrame(processVideo);
}

async function startVideo(video) {
    let stream; // video stream

    const constraints = {
        video: {
            facingMode: "user",
            width: { ideal: 480 },
            height: { ideal: 480 }
        },
        audio: false
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();

        return new Promise(function (resolve, reject) {
            video.addEventListener('loadedmetadata', function (e) {
                console.log(e)
                resolve();
            });
        });
    }
    catch (err) {
        console.error('Error accesing camera:', err);
        alert('Error accessing camera')
    }
}