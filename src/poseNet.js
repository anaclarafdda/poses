
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

const video = document.getElementById('video');

const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 3;

let hasntStarted = true;

const joints = [
    [10, 8, 6],
    [5, 7, 9]
];

let pause = false;
window.onkeydown = (e) => {
    if (e.key == 'p')
        pause = !pause;

    if(!pause)
        requestAnimationFrame(processVideo)
}

export default async function init() {
    await startVideo(video);

    tempVideo();

    video.width = video.videoWidth;
    video.height = video.videoHeight;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // the first detector call laggs, so im doing it before the loader is removed
    await detector.estimatePoses(video)

    document.getElementById('loader').style.display = 'none';

    let time = 1;
    let counter = document.getElementById('counter');

    let btn = document.getElementById('btn');
    btn.style.display = 'inline';
    btn.onclick = () => {
        btn.style.display = 'none';
        counter.style.display = 'inline'
        count();
    }

    btn.onclick();

    function count() {
        if (--time > 0) {
            counter.innerText = time.toString();
            setTimeout(count, 1000);
        }
        else {
            counter.style.display = 'none';
            hasntStarted = false;
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

    if (pose?.keypoints) {
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

        for (let i = 0; i < 1; i++) {
            const arc = new Path2D();
            let center = pose.keypoints[joints[i][1]];
            let v1 = sub(pose.keypoints[joints[i][0]], center);
            let v2 = sub(pose.keypoints[joints[i][2]], center);

            let p1 = pose.keypoints[joints[i][0]];
            let p2 = pose.keypoints[joints[i][2]]

            let radians = Math.acos(
                (v1.x * v2.x + v1.y + v2.y) / (norm(v1) * norm(v2))
            );

            
            // console.log(radians * 180 / Math.PI)
            
            // let th2 = Math.atan2(center.y - v2.y, center.x - v2.x);
            // inverter eixo y por causa dos eixos do canvas
            let th2 = Math.atan2(p2.y - center.y, p2.x - center.x);
            
            let invert = false;

            if(p1.y < center.y) {
                invert = true;
                radians *= -1;
            }

            ctx.strokeStyle = 'Green';
            ctx.lineWidth = 2;
            arc.arc(center.x, center.y, 20, th2, radians, invert)
            ctx.stroke(arc);
        }
    }

    if (!pause)
        requestAnimationFrame(processVideo);
}

function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y }
}

function norm(v) {
    return Math.sqrt(
        v.x * v.x + v.y * v.y
    )
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