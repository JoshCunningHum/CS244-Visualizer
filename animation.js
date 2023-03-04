// Animation Handler (Uses Animation Queue)
class Animation{

    cb = null;
    name = null;
    g = null;
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
        if(typeof str != "string") return;
        this.name = str;
    }

    group(str){
        if(typeof str != "string") return;
        this.g = str;
    }

    togglePause(){
        this.pauseWhenDone = !this.pauseWhenDone;
        return this;
    }

    // for reversals
    savedFrom = null;

    from(obj){
        this.fromObj = obj;

        // A saved from state for reversals
        this.savedFrom = Util.objCopy(this.fromObj); 
        return this;
    }

    to(obj){
        this.toObj = obj;
        return this;
    }

    exod = null;

    reverse(){ 
        [this.exod, this.toObj] = [
            Util.objCopy(this.toObj), 
            this.exod ? 
                this.exod : 
                Util.objCopy(this.savedFrom)
        ]
        return this;
    }

    od = null;

    done(onceDone){
        this.od = onceDone;
        return this;
    }

    fd = null;  

    first(firstDo){
        this.fd = firstDo;
        return this;
    }


    execute(){
        if(this.exod) $.extend(true, this.fromObj, this.exod);

        const tween = createjs.Tween.get(this.fromObj)
        .call(() => {
            if(this.fd) this.fd();
        })
        .wait(this.delay)
        .to(this.toObj, this.duration * Handler.a.config.timeMult)
        .wait(this.timeout)
        .call(() => {
            if(this.pauseWhenDone) Handler.pause();
            if(this.od) this.od();
            
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

    oganim = null;

    get ongoing(){
        return this.oganim;
    }

    set ongoing(val){
        this.oganim = val;

        if(val == null){
            // DO THINGS HERE WHEN NO ONGOING ANIMATIONS
        }else{
            // DO THINGS HERE WHEN ONGOING ANIMATIONS
        }
    }

    svm = false;
    saved = [];

    set savingMode(val){
        this.svm = val;
        if(val) this.saved.length = 0; // delete all saved animations
    }

    get savingMode(){
        return this.svm;
    }

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

    isSafe(){
        return this.ongoing == null;
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

    prev(){
        // Only do previous when paused and no ongoing animations
        if(!this.paused && this.ongoing == null && this.savingMode) return; 
        console.log("Eligible to prev");

        // Get all animations up until to the animation when pauseWhenDone is enabled
        const indexUpTo = this.saved.findIndex(e => e.pauseWhenDone),
              ani = indexUpTo != -1 ? this.saved.splice(0, indexUpTo + 1) : null;

        if(!ani) return; // If there are no saved animations
        console.log("Prev animations available: ", ani);

        // array containing groups of animations
        ani.forEach(a => {
            // animations could be array or single
            if(a instanceof Array) a.forEach(item => item.reverse());
            else a.reverse();
        });

        ani.reverse();

        console.log("Main animations executing");
        // execute each animation inside the group except for the last (pause anim)
        for(let i = 1; i < ani.length; i++) this.executeAnimation(ani[i], true);
        console.log("Pause animation executing");
        // then execute the pause animation
        this.executeAnimation(ani[0], true);

        console.log("Animations executed");
    }

    executeAnimation(ani, prevMode = false){
        if(ani instanceof Array){ // if the animation is a gorup animation
            this.running += ani.length;
            this.ongoing = ani.map(a => a.execute());
        }else{
            this.running++;
            this.ongoing = [ani.execute()];
        }
        
        if(prevMode == true){
            console.log("Prev animation executed: ", ani);
            if(ani instanceof Array) ani.map(a => a.reverse()).reverse();
            else ani.reverse(); // reverse the animation
            this.queue.unshift(ani);
        }
    }

    animate(){
        const ani = this.queue.shift();
        if(this.savingMode) this.saved.unshift(ani);
        this.executeAnimation(ani);
    }

    pause = () => this.paused = true;
    continue = () => this.paused = false;

    // For blocking a lot of animation processes
    done = () => this.running--;
}