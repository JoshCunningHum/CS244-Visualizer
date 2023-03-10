// Animation Handler (Uses Animation Queue)

class Animation{

    static autoContinue = [];

    static addSkips(id){
        if(this.hasContinue(id)) return;
        this.autoContinue.push(id);
    }

    static removeSkip(id){
        const index = this.autoContinue.findIndex(e => e == id);
        if(index == -1) return;
        this.autoContinue.splice(index, 1);
    }

    static hasContinue(id){
        return this.autoContinue.some(e => e == id);
    }

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

    label(str){
        this.name = str;
        return this;
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

    atFirst(cb){
        this.first = cb;
        return this;
    }

    onceDone(cb){
        this.done = cb;
        return this;
    }

    execute(){
        const tween = createjs.Tween.get(this.fromObj)
        .call(() => {
            if(this.first) this.first();
        })
        .wait(this.delay)
        .to(this.toObj, this.duration * Handler.a.config.timeMult)
        .wait(this.timeout)
        .call(() => {
            if(this.pauseWhenDone && !Animation.hasContinue(this.name)){
                Handler.pause()
            }
            if(this.done) this.done();
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