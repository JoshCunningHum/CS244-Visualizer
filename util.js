class Util{

    static genChar = () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.random()*62|0);

    static genString(length){
        return Array(length).fill(0).map(x => this.genChar()).join("");
    }

    static rad2Deg = (deg) => 180 * deg / Math.PI;
    static deg2Rad = (rad) => Math.PI * rad / 180;
    
    static saneModulos = (a, b) => ((a % b) + b) % b;

    static heightCalc = (val) => 3 * (val / 160)**2;

    static genInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
    static objCopy = (obj) => {
        const copy = {};
        $.extend(true, copy, obj);
        return copy;
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
        const AB = mag * Math.cos(Util.rad(xy));

        return [
            AB * Math.cos(Util.rad(xz)),
            -AB * Math.sin(Util.rad(xz)),
            mag * Math.sin(Util.rad(xy))
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
            xy: Util.deg(Math.atan2(this.y, XZh)),
            xz: -Util.deg(x_z),
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

    constructor({ x, y, z }) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    diff(pos) {
        return [
            pos.x - this.x,
            pos.y - this.y,
            pos.z - this.z
        ]
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