class Util{
    static heightDIffIntensity = 3;
    static genChar = () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.random()*62|0);

    static genString(length){
        return Array(length).fill(0).map(x => this.genChar()).join("");
    }

    static pyth(a, b) {
        return Math.sqrt(a ** 2 + b ** 2);
    }

    static pyth3D(a, b, c) {
        return Math.sqrt(a ** 2 + b ** 2 + c ** 2);
    }

    static rad2Deg = (deg) => 180 * deg / Math.PI;
    static deg2Rad = (rad) => Math.PI * rad / 180;
    
    static saneModulos = (a, b) => ((a % b) + b) % b;

    static heightCalc = (val) => 3 * (val / 160)**this.heightDIffIntensity;

    static genInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

    static deep_dispose(obj, parent = Handler){
        if(parent == Handler)parent.delete(obj);
        else parent.remove(obj);

        if(obj.children?.length){
            obj.children.forEach(c => {
                this.deep_dispose(c, obj);
            })
        }

        if(obj.isMesh){
            obj.material.dispose();
            obj.material.dispose();
        }

    }
}

class Vector3D {
    constructor({ x, y, z, mode = "C", mag, xy, xz }) {

        if (mode == "A") {
            [x, y, z] = Vector3D.findXYZ({
                mag: mag,
                xy: xy,
                xz: xz
            })
        }

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    static findXYZ({ mag, xy, xz }) {
        const AB = mag * Math.cos(Util.rad2Deg(xy));

        return [
            AB * Math.cos(Util.rad2Deg(xz)),
            -AB * Math.sin(Util.rad2Deg(xz)),
            mag * Math.sin(Util.rad2Deg(xy))
        ]
    }

    set({ x, y, z, mode = "C", mag, xy, xz }) {

        if (mode == "A") {
            [x, y, z] = Vector3D.findXYZ({
                mag: mag,
                xy: xy,
                xz: xz
            })
        }

        this.x = x || this.x;
        this.y = y || this.y;
        this.z = z || this.z;

        return this;
    }

    get mag() {
        return Util.pyth3D(this.x, this.y, this.z);
    }

    get angleRep() {
        const x_z = Math.atan2(this.z, this.x);
        const XZh = Util.pyth(this.z, this.x);

        return {
            mag: this.mag,
            xy: Util.deg2Rad(Math.atan2(this.y, XZh)),
            xz: -Util.deg2Rad(x_z),
            mode: "A"
        }
    }

    get normalize() {
        const max = Math.max(this.x, this.y, this.z);

        return [this.x, this.y, this.z].map(e => e / max);
    }

    get arr(){
        return [this.x, this.y, this.z];
    }

    get clone(){
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    scale(mult) {
        const A = this.angleRep;

        A.mag *= mult;

        this.set(A);

        return this;
    }
    

    add({ v, x, y, z }) {
        if (v != undefined && v instanceof Vector3D) {
            [x, y, z] = [v.x, v.y, v.z];
        }

        this.x += x || 0;
        this.y += y || 0;
        this.z += z || 0;

        return this;
    }
}

class Position {
    static LOCKX = false;
    static LOCKY = false;
    static LOCKZ = false;

    constructor(obj, ay = null, az = null) {

        if(ay != null && az != null){
            this.x = obj;
            this.y = ay;
            this.z = az;
            return;
        }

        this.x = obj.x || 0;
        this.y = obj.y || 0;
        this.z = obj.z || 0;
    }

    // axis [0, 1, 2] = [x, y, z]
    angleTo(pos, axis = null){
        // get diff vector first
        const [dx, dy, dz] = this.diff(pos);

        // returns 3 angles if axis is not specified
        if(axis == null){
            return [
                Math.atan2(dy, dz),
                Math.atan2(dz, dx),
                Math.atan2(dy, dx)
            ]
        }

        return axis == 0 ? Math.atan2(dy, dz) :
               axis == 1 ? Math.atan2(dz, dx) :
               Math.atan2(dy, dx);
    }

    diff(pos) {
        return [
            pos.x - this.x,
            pos.y - this.y,
            pos.z - this.z
        ]
    }

    // the middle of this position and another position
    mid(pos){
        // get a vector from the difference of the two
        const diff = this.diff(pos),
              v = new Vector3D({x: diff[0], y: diff[1], z: diff[2]});

        // cut by half the vector
        v.scale(0.5);

        // create position from vector
        const halfDiff = new Position(v);

        // add it to a clone of this and return
        return this.clone.add({pos: halfDiff});
    }

    dist(pos) {
        return Util.pyth3D(...(this.diff(pos)));
    }

    add({ pos, x, y, z }) {
        if (pos != undefined && pos instanceof Position) {
            [x, y, z] = [pos.x, pos.y, pos.z];
        }

        this.x += x || 0;
        this.y += y || 0;
        this.z += z || 0;

        return this;
    }

    set({ x, y, z }) {

        if(!Position.LOCKX) this.x = x || this.x;
        if(!Position.LOCKY) this.y = y || this.y;
        if(!Position.LOCKZ) this.z = z || this.z;

        return this;
    }

    get clone(){
        return new Position({
            x: this.x,
            y: this.y,
            z: this.z
        })
    }

    get arr() {
        return [this.x, this.y, this.z];
    }
}