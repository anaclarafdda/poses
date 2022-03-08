
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

const video = document.getElementById('video');

const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 3;

let hasntStarted = true;

export default async function init() {
    await startVideo(video);

    tempVideo();

    video.width = video.videoWidth;
    video.height = video.videoHeight;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let time = 6;
    let counter = document.getElementById('counter');

    let btn = document.getElementById('btn');
    btn.style.display = 'inline';
    btn.onclick = () => {
        btn.style.display = 'none';
        counter.style.display = 'inline'
        count();
    }

    function count() {
        if (--time > 0) {
            counter.innerText = time.toString();
            setTimeout(count, 1000);
        }
        else {
            counter.style.display = 'none';
            processVideo();
        }
    }
}

function tempVideo() {
    ctx.drawImage(video, 0, 0)

    if (hasntStarted)
        requestAnimationFrame(tempVideo);
}

async function processVideo() {
    const pose = (await detector.estimatePoses(video))[0];

    ctx.drawImage(video, 0, 0)

    ctx.fillStyle = 'Red';
    ctx.strokeStyle = 'White';
    ctx.lineWidth = 1;

    if (pose?.keypoints)
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([
            i, j
        ]) => {
            const kp1 = pose.keypoints[i];
            const kp2 = pose.keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;
            const scoreThreshold = 0.5;

            if (score1 >= scoreThreshold) {
                const circle = new Path2D();
                circle.arc(kp1.x, kp1.y, 3, 0, 2 * Math.PI);
                ctx.fill(circle);
                ctx.stroke(circle);
            }

            if (score2 >= scoreThreshold) {
                const circle = new Path2D();
                circle.arc(kp2.x, kp2.y, 3, 0, 2 * Math.PI);
                ctx.fill(circle);
                ctx.stroke(circle);
            }

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
            width: { ideal: 640 },
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