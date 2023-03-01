// Animation Handler (Uses Animation Queue)

class Animation{

    cb = null;
    pauseWhenDone = false;

    static get pauseSequence(){
        return (new Animation(() => null, 10)).togglePause();
    }

    constructor(cb, ...[d = 500, w = 20, t = 20, id]){
        this.cb = cb;
        this.duration = d;
        this.delay = w;
        this.timeout = t;
        this.id = id || Util.genString(15);
    }

    togglePause(){
        this.pauseWhenDone = !this.pauseWhenDone;
        return this;
    }

    from(obj){
        this.fromObj = obj;
        return this;
    }

    to(obj){
        this.toObj = obj;
        return this;
    }

    execute(){
        const tween = createjs.Tween.get(this.fromObj)
        .wait(this.delay)
        .to(this.toObj, this.duration * Handler.a.config.timeMult)
        .wait(this.timeout)
        .call(() => {
            if(this.pauseWhenDone){
                Handler.pause()
            }
            Handler.a.done();
        });

        tween.og = {
            duration: this.duration,
            timeMult: Handler.a.config.timeMult
        }
        tween.addEventListener("change", this.cb);

        return tween;
    }
}

class AnimationQueue{
    queue = [];
    running = 0;
    paused = false;

    ongoing = null;

    static def = {
        config: {
            timeMult: 1,
            delayMult: 1,
            delay: 0,
            overrideContinue: false
        }
    }

    constructor({handler, config}){
        this.config = config || {...AnimationQueue.def.config};
    }

    // Check for any animation processes
    check(){
        if(this.queue.length == 0) return;
        if(this.running > 0) return; // if still running animation
        this.ongoing = null; // If nothing is running, delete the ongoing tweens
        if(this.paused && !this.config.overrideContinue){
            // console.log("ITS PAUSED");
            return;
        } // if queue is paused, then do nothing
        this.animate(); // if any, then animate the first in queue
    }

    animate(){
        const ani = this.queue.shift();
        if(ani instanceof Array){ // if the animation is a gorup animation
            this.running += ani.length;
            this.ongoing = ani.map(a => a.execute());
            return;
        }
        this.running++;
        this.ongoing = [ani.execute()];
    }

    pause = () => this.paused = true;
    continue = () => this.paused = false;

    // For blocking a lot of animation processes
    done = () => this.running--;
}