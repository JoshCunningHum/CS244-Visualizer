class Handler{
    static dim = [];
    static lights = [];
    static initial_objects = {};
    static texture = new THREE.TextureLoader();

    static runtime_objects = [];

    // presets
    static {
        // Ground
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(1000, 640),
            new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide})
        )
        ground.material.color.setHSL( 277, 0, .41 );

        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;

        this.initial_objects.ground = ground;

        // Skybox
        const vertexShader = document.getElementById('vertexShader').textContent;
        const fragmentShader = document.getElementById('fragmentShader').textContent;
        const uniforms = {
            'topColor': {
                value: new THREE.Color(0x0077ff)
            },
            'bottomColor': {
                value: new THREE.Color(0xffffff)
            },
            'offset': {
                value: 33
            },
            'exponent': {
                value: 0.6
            }
        };
        uniforms['topColor'].value.setHSL( 0.6, 1, 0.6 );

        const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.initial_objects.skybox = sky;
    }

    static get w(){
        return this.dim[0];
    }

    static get h(){
        return this.dim[1];
    }
    
    static _refreshLabels(){
        // Delete labels to refresh them
        $("#THREE_LABELS").html("");
    }

    static _init({c, width, height, animator}){
        this.c = c;
        this.ctx = c.getContext("2d");
        this.a = animator;
        this.a.handler = this;

        this.dim = [width || c.clientWidth, height || c.clientHeight];

        // Rendering Initialization
        this.scene = new THREE.Scene();
        this.cam = new THREE.PerspectiveCamera(75, this.w / this.h, 0.1, 1000);

        // 3D
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.w, this.h);
        this.renderer.domElement.id = this.c.id;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.bias = -0.0001;
        this.renderer.shadowMap.darkness = 1;
        this.renderer.shadowMap.width = 2048;
        this.renderer.shadowMap.height = 2048;

        // 2D (Text Labels)
        this.label_renderer = new THREE.CSS2DRenderer();
        this.label_renderer.setSize(window.innerWidth, window.innerHeight);
        this.label_renderer.domElement.style.position = "absolute";
        this.label_renderer.domElement.style.top = "0px";
        this.label_renderer.domElement.style.zIndex = 0;
        this.label_renderer.domElement.id = "THREE_LABELS";

        this.c.parentElement.prepend(this.renderer.domElement, this.label_renderer.domElement);
        this.c.parentElement.removeChild(this.c);

        // Lights
        {
            this.lights.push(new THREE.DirectionalLight(0xffffff, 1));
            this.lights.push(new THREE.AmbientLight(0xeeeeee, 0));
            this.lights.push(new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6));
            this.lights.push(new THREE.SpotLight(0xffffff, 0.9, 0, Util.deg2Rad(170), 0, 2, 1));

            const [dirLight, ambLight, hemiLight, spotLight] = this.lights;

            hemiLight.color.setHSL(0.6, 1, 0.6);
            hemiLight.groundColor.setHSL(0.095, 1, 0.75);
            hemiLight.position.set(0, 50, 0);

            dirLight.color.setHSL(0.1, 1, 0.95);
            dirLight.position.set(-1, 1.75, 1);
            dirLight.position.multiplyScalar(50);

            const dirShadowDimension = 150;

            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 8192;
            dirLight.shadow.mapSize.height = 8192;
            dirLight.shadow.camera.near = 0.5; // default
            dirLight.shadow.camera.far = 1000; // default
            dirLight.shadow.camera.right = dirShadowDimension;
            dirLight.shadow.camera.left = -dirShadowDimension;
            dirLight.shadow.camera.top = dirShadowDimension;
            dirLight.shadow.camera.bottom = -dirShadowDimension;
            // dirLight.shadow.focus = 1; // default

            spotLight.position.set(0, 100, 100);
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 1;
            spotLight.decay = 2;
            spotLight.focus = 1;
            spotLight.distance = 100;

            // const spotHelper = new THREE.DirectionalLightHelper( dirLight );
            // const shadowCam = new THREE.CameraHelper( dirLight.shadow.camera );
            // this.scene.add(spotHelper, shadowCam);
        }

        // Preset Objects
        this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
        this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);
        this.scene.fog.color.set(0xffffff);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.cam, this.label_renderer.domElement);
        this.controls.maxPolarAngle = Math.PI / 2;

        // Set initial camera position
        this.cam.position.set(-14, 9, 17);
        this.cam.lookAt(0, 0, 10);
        this.controls.update();

        // For rendering
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener("tick", this.animate.bind(this));

        // Add Preset Objects
        this.scene.add(...this.lights);
        this.scene.add(this.initial_objects.ground);
        this.scene.add(this.initial_objects.skybox);

        this.animate();

        // For resizing of browser
        window.addEventListener("resize", e => {
            const [w, h] = [window. innerWidth, window.innerHeight];
            this.renderer.setSize(w, h);
            this.label_renderer.setSize(w, h);
            this.cam.aspect = w / h;
            this.cam.updateProjectionMatrix();
        })
    }

    static focusing = null;

    static follow(obj){
        // set last position and quaternion of camera
        this.savedPosition = this.cam.position.clone();
        this.savedQuaternion = this.cam.quaternion.clone();

        // creates a fake camera inside the object
        let fake_cam = this.cam.clone();
        fake_cam.name = "FOCUSING_CAM";

        // set fake cam positions to 0, 0, 5
        fake_cam.position.set(0, 0, 5);
        fake_cam.rotation.set(0, 0, 0);

        // add the fake_cam to the object only if it doesn't have any fake_cam
        if(!obj.children.some(e => e.name == "FOCUSING_CAM")){
            console.log("ADDED TO BODY");
            obj.add(fake_cam);
        }else{
            // If there is already a fake cam, then
            fake_cam = obj.children.find(e => e.name == "FOCUSING_CAM");
        }

        // const helper = new THREE.CameraHelper(fake_cam);
        // this.scene.add(helper);

        // set fake_cam as what the handler is currently focusing
        this.focusing = fake_cam;

    }

    static unFollow(){
        // just set the focusing to null
        this.focusing = null;
    }

    static pause = () => this.a.pause();
    static continue = () => this.a.continue();

    static add(obj){
        this.runtime_objects.push(obj);
        this.scene.add(obj);
    }

    static delete(obj){
        this.scene.remove(obj);
    }

    static addAnimation(...as){
        this.a.queue.push(...as);
    }

    static _wasFocusingBefore = false;

    static savedPosition = null;
    static savedQuaternion = null;

    static animate(){
        // if we are currently focusing on something, then copy the values
        if(this.focusing != null){
            // position
            let targetPosition = new THREE.Vector3();
            this.focusing.getWorldPosition(targetPosition);
            this.cam.position.copy(targetPosition);
            // quaternion (rotation)
            let targetQuaternion = new THREE.Quaternion();
            this.focusing.getWorldQuaternion(targetQuaternion);
            this.cam.quaternion.copy(targetQuaternion);
            // update controls
            // this.controls.update();

            this._wasFocusingBefore = true;
        }else if(this._wasFocusingBefore){
            this._wasFocusingBefore = false;
            this.cam.position.copy(this.savedPosition);
            this.cam.quaternion.copy(this.savedQuaternion);
            
            this.savedPosition = null;
            this.savedQuaternion = null;

            // this.controls.update();
        }

        this.renderer.render(this.scene, this.cam);
        this.label_renderer.render(this.scene, this.cam);
        this.a.check();
    }

}