
// contains THREEJS Objects and Sorting Data
// Also other methods for animations
class Human {
    static defTexture = Handler.texture.load("assets/def_texture.jpg");
    static width = 1;
    static headSize = 0.75;
    static cubeHead = false;
    static thick = 0.5;
    static state = {
        UNDETERMINED: 0,
        CORRECT: 1,
        TEMP: 2,
        PIVOT: 3
    }

    static default_height = 3;

    static anim = {
        IDLE: 0,
        WALKING: 1,
        DANCING: 2
    }

    value = 1;
    name = "Josh";    
    height = 3;

    _headDispose(){
        const head = this.body.children.find(e => e.name == "HEAD");
        this.body.remove(head);
        head.material.dispose();
        head.geometry.dispose();
        head.children.forEach(mesh => {
            head.remove(mesh);
        })
        Handler._refreshLabels();
    }

    // scale base on height if enabled
    static head(template){
        const G = this.cubeHead ? 
                  new THREE.BoxGeometry(...Array(3).fill(this.width)) : 
                  new THREE.SphereGeometry(this.headSize, 32, 32),
              M = new THREE.MeshLambertMaterial({color: "bisque"});

        const mesh = new THREE.Mesh(G, M);
        mesh.name = "HEAD";
        mesh.castShadow = true;

        if(this.cubeHead && template.hasTexture){
            const GF = new THREE.PlaneGeometry(this.width, this.width),
                  MF = new THREE.MeshLambertMaterial({color: "bisque"}),
                  F = new THREE.Mesh(GF, MF);
                  
            mesh.add(F);
            F.material.map = template.texture;
            F.position.set(this.width / 2 + 0.001, 0, 0);
            F.rotation.set(0, Util.deg2Rad(90), 0);
        }else if(template.hasTexture){
            mesh.material.map = template.texture;
        }
        mesh.rotation.set(0, -Util.deg2Rad(90), 0);
        mesh.position.set(0, template.height / 4 + this.width / 2, 0);
        
        mesh.add(Human.genTextMesh(template.name, ["tag"], 
            new Position({y: Human.headSize * 1.5})
        ));

        return mesh;
    }

    changeHead(){
        this._headDispose();
        this.body.add(Human.head(this));
        this.state = this.state;
    }

    static arms(template){
        const G = new THREE.BoxGeometry(this.width / 2, template.height / 2, this.thick),
              M = new THREE.MeshLambertMaterial({color: "bisque"});

        const lMesh = new THREE.Mesh(G, M),
              rMesh = lMesh.clone();

        lMesh.castShadow = true;
        lMesh.receiveShadow = true;
        rMesh.castShadow = true;
        rMesh. receiveShadow = true;

        lMesh.geometry.translate(0, -template.height / 4, 0);

        lMesh.position.set(-(this.width * 3 / 4), template.height / 4, 0);
        rMesh.position.set((this.width * 3 / 4), template.height / 4, 0);

        return [lMesh, rMesh];
    }

    static legs(template){
        const G = new THREE.BoxGeometry(this.width / 2, template.height / 2, this.thick),
              M = new THREE.MeshLambertMaterial({color: "bisque"});

        const lMesh = new THREE.Mesh(G, M),
              rMesh = lMesh.clone();

        lMesh.castShadow = true;
        lMesh.receiveShadow = true;
        rMesh.castShadow = true;
        rMesh. receiveShadow = true;

        lMesh.geometry.translate(0, -template.height / 4, 0);

        lMesh.position.set(-(this.width / 4), -template.height / 4, 0);
        rMesh.position.set((this.width / 4), -template.height / 4, 0);

        return [lMesh, rMesh];
    }

    static parts(template){
        const G = new THREE.BoxGeometry(this.width, template.height / 2, this.thick),
              M = new THREE.MeshLambertMaterial({color: "bisque"});

        const mesh = new THREE.Mesh(G, M);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.add(this.head(template), ...this.arms(template), ...this.legs(template));

        return mesh;
    }

    static genTextMesh(text, classes = ["label"], pos){
        const el = document.createElement("div");
        el.classList.add(...classes);
        el.textContent = text;
        const mesh = new THREE.CSS2DObject(el);
        if(pos) mesh.position.set(...pos.arr)
        else mesh.position.set(0, 0, this.thick / 2);
        return mesh;
    }

    offset = [0, 0, 0];
    i = 0;
    body;
    keyframe = 0;
    at = Human.anim.IDLE;

    get index(){
        return this.i;
    }

    set index(val){
        this.i = val;
    }

    constructor({name, value, index = 1, id, height, hasTexture = true}){
        this.pos = new Position(0, 0, 0);
        this.name = name;
        this.value = value;
        this.index = index; // for referencing
        this.id = id || Util.genString(10);
        this.height = height || 3;
        this.hasTexture = hasTexture;

        // textures
        this.texture = hasTexture ? Handler.texture.load(`assets/${name.split(" ").join("")}${Human.cubeHead ? "_C" : ""}.jpg`) : null;

        // parts
        this.body = Human.parts(this);

        // add to the scene
        Handler.add(this.body);

        // add texts
        this.body.add(Human.genTextMesh(value));
        this._level();


        // generate animation values
        this.initial_keyframe = Math.floor(Math.random() * 100);
        this._genAnimationValues();

        // Do idle animations
        createjs.Tween.get(this, {loop: true})
        .to({keyframe: 100}, 250)
        .to({keyframe: 0}, 250)
        .addEventListener("change", this._anim.bind(this));
    }

    get kf(){
        let calc = (this.initial_keyframe + this.keyframe);
        if(calc > 100) calc = 100 - (calc % 100);
        return calc;
    }

    get arms(){
        return this.body.children.slice(1, 3);
    }

    get legs(){
        return this.body.children.slice(3, 5);
    }

    _resetRotations(){
        const [lA, rA] = this.arms,
              [lL, rL] = this.legs;

        lA.rotation.set(0, 0, 0);
        rA.rotation.set(0, 0, 0);
        lL.rotation.set(0, 0, 0);
        rL.rotation.set(0, 0, 0);

        this.body.rotation.set(0, 0, 0);
    }

    set animation_state(val){
        this.at = val;
        this._resetRotations();
    }

    get animation_state(){
        return this.at;
    }

    _genAnimationValues(){
        const maxidlesway = 3,
              maxwalksway = 45;

        this.idle = {
            minArmSway: -Math.random() * maxidlesway,
            maxArmSway: Math.random() * maxidlesway
        };

        this.walking = {
            minArmSway: -maxwalksway,
            maxArmSway: maxwalksway,
            minLegSway: -maxwalksway * 0.8,
            maxLegSway: maxwalksway * 0.8,
        }
    }

    _getAnimationStateChange(state){
        return new Animation(() => {
            this.animation_state = state;
        }, 10, 0, 0);
    }

    _anim(){
        const [lA, rA] = this.arms,
              [lL, rL] = this.legs;
        

        switch(this.animation_state){
            case Human.anim.IDLE:
                const mnias = this.idle.minArmSway,
                      mxias = this.idle.maxArmSway,
                      idiff = mxias - mnias;

                const calc_idle_sway = Util.deg2Rad(mnias + idiff * (this.kf / 100));

                lA.rotation.set( calc_idle_sway, 0, 0);
                rA.rotation.set( -calc_idle_sway, 0, 0);
                break;
            case Human.anim.WALKING:
                const mnwas = this.walking.minArmSway,
                      mxwas = this.walking.maxArmSway,
                      mnwls = this.walking.minLegSway,
                      mxwls = this.walking.maxLegSway,
                      wAdiff = mxwas - mnwas,
                      wLdiff = mxwls - mnwls;

                const calc_walk_arm_sway = Util.deg2Rad(mnwas + wAdiff * (this.keyframe / 100)),
                      calc_walk_leg_sway = Util.deg2Rad(mnwls + wLdiff * (this.keyframe / 100));

                lA.rotation.set(calc_walk_arm_sway, 0, 0);
                rA.rotation.set( -calc_walk_arm_sway, 0, 0);
                lL.rotation.set(calc_walk_leg_sway, 0, 0);
                rL.rotation.set(-calc_walk_leg_sway, 0, 0);
                      
                break;
            case Human.anim.DANCING:
                break;
        }
    }

    get _yLevel(){
        return this.height * 3 / 4;
    }

    _level(){
        // Level the body to the ground
        this.body.position.set(0, this._yLevel, 0);
    }

    // Actually moves the thing
    move({pos, duration = 500, absolute = true}){
        Handler.addAnimation(this._move({pos, duration, absolute}));
    }

    // Only returns the animation
    _move({pos, duration = 500, absolute = true}){
        if(!absolute) pos.add(this.pos);
        pos.set({y: this._yLevel}); // LOCK Y to its Y Level

        return new Animation(obj => {
            this.body.position.set(...this.pos.arr);
        }, duration).from(this.pos).to(pos);
    }

    _rotateBuffer = 0;

    // actually rotates the thing
    rotate(obj){
        Handler.addAnimation(this._rotate(obj));
    }

    _rotate({angle, duration = 50}){
        // always rotates on y axis

        return new Animation(obj => {
            this.body.rotation.set(0, Util.deg2Rad(this._rotateBuffer), 0);
        }, duration).from(this).to({_rotateBuffer: angle});
    }

    // dev purposes
    static get _dev_gen(){
        return new Human({name: Util.genString(5), value: Math.floor(Math.random() * 10) + 1});
    }

    set state(state){
        this.s = state;
        let color;
        switch(state){
            case Human.state.CORRECT:
                color = new THREE.Color(0x45f500);
                break;
            case Human.state.UNDETERMINED:
                color = new THREE.Color("bisque");
                break;
            case Human.state.TEMP:
                color = new THREE.Color("hsl(105, 0%, 30%)");
                break;
            case Human.state.PIVOT:
                color = new THREE.Color(0xffd500);
                break; 
            default:
                null;
        }

        this.body.material.color.set(color);
        this.body.children.forEach(e => {
            if((e.isMesh && e.name != "HEAD") || 
               (e.name == "HEAD" && Human.cubeHead)){
                e.material.color.set(color);
            }
        })
    }

    get state(){
        return this.s;
    }

    // remove self in Handler
    delete(){
        // Dispose Parts
        Handler.delete(this.body);
        this.body.children.forEach(e => {
            this.body.remove(e);
            if(e.isMesh){
                e.material.dispose();
                e.geometry.dispose();
            }
        });
        this.body.material.dispose();
        this.body.geometry.dispose();
        
        Handler._refreshLabels();
    }
}

// For sorting and positioning
class HumanArray{
    static gap = 5;
    static recurse_gap = Human.thick * 7;
    static walk_gap = Human.width * 3;

    h = [];
    pos = new Position({x: 0, y: 0, z: 0});
    level = 0;

    constructor(...items){
        this.h = items;
    }


    add(...Humans){
        Humans.forEach(h => {
            h.index = this.h.length;
            this.h.push(h);
        });

        this.arrange();
    }

    delete(...Humans){
        const byIndex = typeof Humans[0] == "number";

        Humans.forEach(h => {
            const index = byIndex ? h : this.getIndex(h.id);

            this.h.splice(index, 1)[0].delete();
        })

        // Update their indexes
        this.fixIndex();
        this.arrange(); // rearrange
    }

    deleteAll(){
        this.forEach(x => x.delete());
        this.h.length = 0;
    }

    get length(){
        return this.h.length;
    }

    // start, end
    slice(...args){
        const arr = new HumanArray(...this.h.slice(...args));
        arr.level += this.level + 1;
        return arr;
    }

    // returns 3 HumanArray, the Left Side and Right Side of middle and an array with only the middle Human
    separate(middle){
        if(middle instanceof Human) middle = middle.index;
        
        const sep = [this.slice(0, middle), 
                new HumanArray(this.get(middle)), 
                this.slice(middle + 1)];

        sep[0].type = "left";
        sep[1].type = "middle";
        sep[2].type = "right";

        sep[0].bound = [0, middle - 1];
        sep[1].bound = [middle, middle];
        sep[2].bound = [middle + 1, this.length - 1];

        sep[0].parent = this;
        sep[1].parent = this;
        sep[2].parent = this;

        sep[0].pos = this._getMid(0, sep[0]);
        sep[1].pos = this.get(middle).pos.clone;
        sep[2].pos = this._getMid(middle + 1, sep[2]);

        sep[0].fixIndex();
        // sep[1].fixIndex(); // not needed
        sep[2].fixIndex();

        return sep;
    }


    get(index){
        // supports negative index
        if(index < 0) return this.h[this.length - ((-index) % this.length)];
        return this.h[index];
    }

    getIndex(h){
        if(h instanceof Human) return h.index;
        return this.h.findIndex(e => e.id == h);
    }

    // return an array with the values of all humans 
    get values(){
        return this.h.map(h => h.value);
    }

    // Usually for debugging
    get indexes(){
        return this.h.map(h => h.index);
    }

    get hashMap(){
        return this.h.map((h) => [h.value, h.index]);
    }

    forEach(cb, thisArg){
        this.h.forEach(cb, thisArg);
    }

    posAtIndex(index){
        return this.calc_start.add({x: index * (Human.width + HumanArray.gap)});
    }

    swap(pos1, pos2, pauseAfter = true){
        if(pos1 instanceof Human) pos1 = pos1.index;
        if(pos2 instanceof Human) pos2 = pos2.index;
        if(pos1 == pos2) return;

        const f = this.h[pos1],
              l = this.h[pos2];

        // animation
        const d = .10 * 1000,
              s = HumanArray.walk_gap,
              former = this.posAtIndex(pos1),
              latter = this.posAtIndex(pos2);

        const movement = [
            // For Animation Purposes
            l._rotate({angle: -180, duration: 50}),
            
            f._getAnimationStateChange(Human.anim.WALKING),
            l._getAnimationStateChange(Human.anim.WALKING),

            // First Phase
            f._move({pos: former.clone.add({z: s}), duration: d}),
            l._move({pos: latter.clone.add({z: -s}), duration: d}),

            f._rotate({angle: 90}),
            l._rotate({angle: -90}),

            // Second Phase
            f._move({pos: latter.clone.add({z: s}), duration: d * 2 * Math.abs(pos1 - pos2)}),
            l._move({pos: former.clone.add({z: -s}), duration: d * 2 * Math.abs(pos1 - pos2)}),

            f._rotate({angle: 180}),
            l._rotate({angle: 0}),

            // Third Phase
            f._move({pos: latter.clone.add({z: 0}), duration: d}),
            l._move({pos: former.clone.add({z: 0}), duration: d}),
            

            // For Animation Purposes
            f._getAnimationStateChange(Human.anim.IDLE),
            l._getAnimationStateChange(Human.anim.IDLE),

            
            f._rotate({angle: 0, duration: 50}),
        ];

        // For pausing actions
        if(pauseAfter) movement.push(Animation.pauseSequence);

        // Seperate each phase
        Handler.addAnimation(movement.shift());
        for(let i = 0; i < 3 + 4; i++) Handler.addAnimation(movement.splice(0, 2));
        Handler.addAnimation(movement.shift());
        if(pauseAfter) Handler.addAnimation(movement.splice(0, 1));

        // reassignment
        [this.h[pos1], this.h[pos2]] = [this.h[pos2], this.h[pos1]];

        // set indexes
        f.index = pos2;
        l.index = pos1;

        // arrange again for inaccuracy
        // this.arrange();
    }

    shift(before, after, pauseAfter){
        if(before instanceof Human) before = before.index;
        if(after instanceof Human) after = after.index;
        if(before == after) return;
        
        const [l, r, m] = before < after ? [before, after, 1] : [after, before, 0],
              b = this.h.slice(l + m, r + m), t = this.h[before],
              fP = this.posAtIndex(before), lP = this.posAtIndex(after),
              d = .10 * 1000, s = HumanArray.walk_gap;
        
        console.log(l, r, m, b.map(b => b.index));

        // animation
        const movement = [
            // First Phase
            t._move({pos: fP.set({z: s}), duration: d}),
            // Second Phase
            ...b.map(i => {
                const index = i.index - (m == 1 ? 1 : -1),
                      pos = this.posAtIndex(index);

                i.index = index;
                console.log(index);

                return i._move({pos: pos, duration: d * 2});
            }),
            t._move({pos: lP.clone.set({z: s}), duration: d * 2}),
            // Third Phase
            t._move({pos: lP, duration: d}),
        ]

        // For pausing actions
        if(pauseAfter) movement.push(Animation.pauseSequence);

        // Seperately add each phase
        Handler.addAnimation(movement.shift()); // First Phase
        Handler.addAnimation(movement.splice(0, b.length + 1)); // Second Phase
        Handler.addAnimation(movement.shift()); // Third Phase
        if(pauseAfter) Handler.addAnimation(movement.splice(0, 1));

        // Re-Order the array
        this.h.splice(before, 1);
        this.h.splice(after, 0, t);
        
        // set index
        t.index = after;

        // arrange again for inacurracies
        // this.arrange();
    }

    // for calculating positions
    get calc_width(){
        const w = Human.width, g = HumanArray.gap;
        return this.length * w + (this.length - 1) * g;
    }

    get calc_start(){
        return this.pos.clone.add({x: -(this.calc_width / 2 - Human.width/2)});
    }
    
    // visually arrange
    arrange(){
        // Shadow the thing so only 1 calculation executed
        const calc_start = this.calc_start.add({x: -(Human.width + HumanArray.gap)});

        const movement = [];
        
        this.h.forEach((h, i) => {
            calc_start.add({x: Human.width + HumanArray.gap});
            movement.push(h._move({
                pos: calc_start.clone,
                duration: 100
            }), h._getAnimationStateChange(Human.anim.WALKING));
        })

        const stopAnimState = this.h.map(i => {
            return i._getAnimationStateChange(Human.anim.IDLE);
        })

        Handler.addAnimation(movement, stopAnimState);
    }

    saveState(){
        this.temp = [...this.h];
    }

    shuffle(){
        const shuffles = Math.floor(Math.random() * 30);

        for(let i = 0; i < shuffles; i++){
            const [l, r] =  [Util.genInt(0, this.length - 1), Util.genInt(0, this.length - 1)];

            [this.h[l], this.h[r]] = [this.h[r], this.h[l]];
        }

        this.fixIndex();
        this.arrange();
    }

    backToState(){
        this.h = [...this.temp];
        this.fixIndex();
        this.arrange();
        this.forEach(hum => hum.state = Human.state.UNDETERMINED);
    }

    fixArray(){
        const actual = [];

        this.h.forEach(item => {
            actual[item.index] = item;
        })

        this.h = actual;
    }

    fixIndex(){
        this.forEach((e, i) => e.index = i);
        return this;
    }

    fixParent(){
        // Used for correcting the base parent array order base on this child 
        if(this.parent == null || this.parent == undefined) return;
        this.parent.splice(this.bound[0], this.length, ...this.h);
    }
    
    splice(...args){
        return this.h.splice(...args);
    }


    // Getting the middle coordinates from two index position values
    // Used for recursive behavior of quick sort
    _getMid(start, arr){
        return this.posAtIndex(start).add({x: (arr.calc_width / 2) - Human.width / 2})
    }

    _callParent(cb){
        if(this.parent == null || this.parent == undefined) return;
        cb.bind(this)();
    }
    
}