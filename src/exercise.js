export default class Exercise {
    constructor(sets, leftReps, rightReps, rest) {
        this.setMax = sets || 0;
        this.leftMax = leftReps || 0
        this.rightMax = rightReps || 0;
        this.restTime = rest || 0;

        this.setCount = 0;
        this.leftCount = 0;
        this.rightCount = 0;
        this.isResting = false;
        this.restCount = 0;
        this.restInterval = null;
        this.finished = false;


        document.getElementById('sets-max').innerText = this.setMax;
        this.sets = document.getElementById('sets');

        if (leftReps <= 0) {
            document.getElementById('header-left').style.display = 'none';
            document.getElementById('counter-left').style.display = 'none';
        }
        else {
            document.getElementById('reps-left-max').innerText = leftReps.toString();
            this.leftReps = document.getElementById('reps-left');
        }

        if (rightReps <= 0) {
            document.getElementById('header-right').style.display = 'none';
            document.getElementById('counter-right').style.display = 'none';
        }
        else {
            document.getElementById('reps-right-max').innerText = rightReps.toString();
            this.rightReps = document.getElementById('reps-right');
        }

        if (this.restTime <= 0) {
            document.getElementById('rest-wrapper').display.style = 'none';
        }
        else {
            this.rest = document.getElementById('rest');
            this.rest.innerText = this.restTime.toString();
        }

        this.lastResult = { left: false, right: false };
    }

    /**
     * Recebe os keypoints estimados e retorna se o exercicio foi completado
     * @param {array} keypoints 
     * @return {object} {left: [boolean], right: [boolean]} 
     */
    verify(keypoints) {
        throw new Error('Verify function not implemented!');
    }

    test(keypoints) {
        if (this.isResting || this.finished) return;

        let result = this.verify(keypoints);

        for (let side of ['left', 'right']) {
            if (result[side] && !this.lastResult[side]) {
                if (this[`${side}Count`] < this[`${side}Max`]) {
                    this[`${side}Count`] += 1;
                    this[`${side}Reps`].innerText = this[`${side}Count`].toString();
                    console.log('Completado ' + side);
                }
            }
        }

        if (
            (this.leftMax <= 0 || this.leftCount == this.leftMax)   
            && (this.rightMax <= 0 || this.rightCount == this.rightMax)
        ) {
            console.log('Serie completada!');
            this.leftCount = 0;
            this.rightCount = 0;

            this.leftReps.innerText = '0';
            this.rightReps.innerText = '0';
            this.setCount += 1;
            this.sets.innerHTML = this.setCount.toString();

            if (this.setCount < this.setMax) {

                this.restCount = this.restTime;
                this.isResting = true;
                this.restInterval = setInterval(() => {
                    if (this.restCount == 1) {
                        clearInterval(this.restInterval);
                        this.isResting = false;
                        this.rest.innerText = this.restTime.toString();
                    }
                    else {
                        this.restCount -= 1;
                        this.rest.innerText = this.restCount.toString();
                    }
                }, 1000);
            }
            else {
                this.finished = true;
            }
        }

        this.lastResult = result;
    }
}