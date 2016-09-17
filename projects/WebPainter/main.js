//class intended to simply load a text file from an xhrrequest
var DataLoader;
(function (DataLoader) {
    function readFile(_file) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'shaders/vs_model.glsl', true);
        xhr.onreadystatechange = function () {
            console.log("fuck");
        };
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.send(null);
    }
    DataLoader.readFile = readFile;
})(DataLoader || (DataLoader = {}));
//I'm aware that singletons in typescript are usually defined with a
//namespace, but I want the constructor in this case
var UI;
(function (UI) {
    //make this private
    class propertiesPanel {
        constructor() {
            this.color = "#00ff00";
            this.size = 20;
            this.opacity = 1.0;
        }
        getColor() {
            return this.color;
        }
        getSize() {
            return this.size;
        }
        getOpacity() {
            return this.opacity;
        }
    }
    class UISingleton {
        constructor() {
            var gui = new dat.GUI();
            this.panel = new propertiesPanel();
            gui.addColor(this.panel, 'color');
            gui.add(this.panel, 'size', 1, 200);
            gui.add(this.panel, 'opacity', 0.1, 1.0);
        }
        getColor() {
            var ret = this.panel.color;
            //ret = ret.replace('#', '0x');
            return ret;
        }
        getSize() {
            return this.panel.getSize();
        }
        getOpacity() {
            return this.panel.getOpacity();
        }
        static getInstance() {
            return this.m_instance;
        }
    }
    UISingleton.m_instance = new UISingleton();
    UI.UISingleton = UISingleton;
})(UI || (UI = {}));
///<reference path="./ui.ts"/>
//this is a singleton to render just the texture
//have to use a class in this case too
const RENDERSIZE = 1000;
class RenderScene {
    constructor() {
        //do singleton stuff
        RenderScene.m_instance = this;
        //SETUP THE CAMERA AND THE QUAD RIGHT HERE
        this.m_renderCamera = new THREE.OrthographicCamera(-RENDERSIZE / 2, RENDERSIZE / 2, RENDERSIZE / 2, -RENDERSIZE / 2, -500, 1000);
        this.m_renderCamera.position.z = 50;
        this.m_renderCamera.lookAt(new THREE.Vector3(0, 0, 0));
        var geometry = new THREE.PlaneGeometry(RENDERSIZE, RENDERSIZE);
        var material = new THREE.MeshBasicMaterial({
            color: 0xCC0000
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.m_textureRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
        this.m_renderScene = new THREE.Scene();
        this.m_renderScene.add(mesh);
        //load template texture
        this.m_templateTexture = THREE.ImageUtils.loadTexture("resources/template.png");
    }
    renderToTexture(_renderer) {
        //render to rendertarget
        _renderer.render(this.m_renderScene, this.m_renderCamera, this.m_textureRenderTarget);
    }
    //getter for singleton
    static getInstance() {
        return this.m_instance;
    }
    //accessor for getting the render target
    getRenderTexture() {
        return this.m_textureRenderTarget;
    }
    //get uv coords and caculate the position
    paint(_uv) {
        //convert uv to real space coordinates of a nxn space
        //coordinates start at -RENDERSIZE -RENDERSIZE
        var x = _uv.x;
        var y = _uv.y;
        x = x * RENDERSIZE;
        x = x - (RENDERSIZE / 2);
        y = y * RENDERSIZE;
        y = y - (RENDERSIZE / 2);
        var size = UI.UISingleton.getInstance().getSize();
        var geometry = new THREE.PlaneGeometry(size, size);
        var colorObj = UI.UISingleton.getInstance().getColor();
        console.log(colorObj);
        var material = new THREE.MeshBasicMaterial({
            color: UI.UISingleton.getInstance().getColor(),
            map: this.m_templateTexture,
            transparent: true,
            opacity: UI.UISingleton.getInstance().getOpacity()
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = x;
        mesh.position.y = y;
        this.m_renderScene.add(mesh);
    }
}
RenderScene.m_instance = new RenderScene();
var VS_SHADER_SOURCE = `

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

varying vec3 worldSpaceLightPos;

vec3 lightPos = vec3(2.0, -250.0, -100.0);

void main()
{
    vUv = uv; 
    vPosition = position;
    vNormal = normalize(normal);

    worldSpaceLightPos = lightPos;

	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
}
`;
var FS_SHADER_SOURCE = `

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

varying vec3 worldSpaceLightPos;

uniform sampler2D tex;

const vec4 ambientColor = vec4(0.2, 0.2, 0.2, 1.0);
const float specConstant = 0.1;
const float fresnelReflectance = 0.8;

void main()
{
    //apply phong shader
    vec3 lightDirection = normalize(vPosition - worldSpaceLightPos);
    vec3 viewDireection = normalize(vPosition - cameraPosition);

    vec4 texColor = texture2D(tex, vUv);  
	vec4 color;
    vec4 ambient = ambientColor;
    ambient = ambient * texColor;

    //specular code
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 reflectVector = normalize(-reflect(lightDirection, vNormal));
    float specular = specConstant * pow(max(dot(reflectVector, viewDirection), 0.0), 9.0) ;

    vec3 H = normalize(lightDirection + viewDirection);
    float VdotH = dot(viewDirection, H);
    float NdotH = dot(vNormal, H);
    float fresnel = pow(1.0 - VdotH, 5.0);
    fresnel = fresnel * (1.0 - fresnelReflectance);
    fresnel += fresnelReflectance;
    specular *= fresnel;

    color = texColor * max(dot(vNormal, lightDirection), 0.0);
    gl_FragColor = (color + specular) + ambient;

}
`;
///<reference path="./three.d.ts"/>
///<reference path="./dataloader.ts"/>
///<reference path="./renderscene.ts"/>
///<reference path="./shaders/vs_model.ts"/>
///<reference path="./shaders/fs_model.ts"/>
class Mesh {
    constructor(_scene) {
        //this.m_geometry = new THREE.PlaneGeometry(300, 300, 64, 64);
        var modelLoader = new THREE.JSONLoader();
        //this.m_geometry = new THREE.SphereGeometry(50,16,16);
        modelLoader.load("monkey.json", (geometry) => {
            // create a mesh using the passed in geometry and textures
            this.m_geometry = geometry;
            this.m_material =
                new THREE.MeshBasicMaterial({
                    color: 0xCCCC00
                });
            this.m_geometryShader =
                new THREE.ShaderMaterial({
                    uniforms: {
                        tex: { type: "t", value: RenderScene.getInstance().getRenderTexture().texture }
                    },
                    vertexShader: VS_SHADER_SOURCE,
                    fragmentShader: FS_SHADER_SOURCE,
                });
            this.m_mesh = new THREE.Mesh(this.m_geometry, this.m_geometryShader);
            this.m_mesh.rotation.x = -Math.PI / 2;
            _scene.add(this.m_mesh);
            //this.m_mesh.scale.set(20,20,20);
            console.log(this.m_geometry);
        });
    }
    paint(_point, _camera) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(_point, _camera);
        var intersects = raycaster.intersectObject(this.m_mesh);
        if (intersects.length > 0) {
            var intersect = intersects[0];
            console.log(intersect);
            console.log(intersect.faceIndex);
            //use faceindex for finding the uv coordinates to mask
            //This assumes a lot.
            //It only gets uv coordinates if there is only one set of uv coordinates for a model
            //if you have multiple textures for a model, this will BREAK.
            //but if you're painting on it, why would you do that?
            console.log(this.m_geometry.faceVertexUvs[0][intersect.faceIndex]);
            RenderScene.getInstance().paint(intersect.uv);
            var t = this.m_mesh.material;
            t.uniforms.tex.value = RenderScene.getInstance().getRenderTexture().texture;
            t.needsUpdate = true;
        }
    }
    renderToTexture(_renderer) {
        //render to rendertarget
        //_renderer.render(this.m_renderScene, this.m_renderCamera);
        RenderScene.getInstance().renderToTexture(_renderer);
    }
}
class KeyListener {
    constructor() {
        //event callback functions
        this.mouseDown = (event) => {
            if (event.which == 3) {
                //console.log("right click");
                this.m_rightMouseButton = true;
            }
            else if (event.which == 1) {
                //console.log("left click");
                this.m_leftMouseButton = true;
            }
        };
        this.mouseUp = (event) => {
            //console.log("button released");
            if (event.which == 3) {
                this.m_rightMouseButton = false;
            }
            else if (event.which == 1) {
                this.m_leftMouseButton = false;
            }
        };
        this.mouseMove = (event) => {
            this.m_mouseX = event.clientX;
            this.m_mouseY = event.clientY;
        };
        this.mouseWheel = (event) => {
            //console.log("mouse wheel event");
            this.m_mouseWheel = event.deltaY;
        };
        this.m_leftMouseButton = false;
        this.m_rightMouseButton = false;
        this.m_mouseWheel = 0;
        var canvas = document.getElementById('canvas');
        canvas.addEventListener("mousedown", this.mouseDown, false);
        canvas.addEventListener("mouseup", this.mouseUp, false);
        canvas.addEventListener("mousemove", this.mouseMove, false);
        canvas.addEventListener("wheel", this.mouseWheel, false);
    }
    getLeftMouseButtonDown() {
        return this.m_leftMouseButton;
    }
    getRightMouseButtonDown() {
        return this.m_rightMouseButton;
    }
    getMouseX() {
        return this.m_mouseX;
    }
    getMouseY() {
        return this.m_mouseY;
    }
    getMouseWheel() {
        return this.m_mouseWheel;
    }
    // The existance of this function is a mild hack
    // essentially, since only change mouse delta on a mousewheel event, it never updates this variable
    // when the user stops moving their mouse. So we have to do it ourselves
    resetMouseWheel() {
        this.m_mouseWheel = 0;
    }
}
///<reference path="./mesh.ts"/>
///<reference path="./keylistener.ts"/>
///<reference path="./three.d.ts"/>
class Renderer {
    constructor() {
        //create things
        this.m_keylistener = new KeyListener();
        this.m_mouseOldX = 0;
        this.m_mouseOldY = 0;
        this.m_angleX = 180;
        this.m_angleY = 20;
        this.m_cameraDistance = 150;
        this.m_renderer = new THREE.WebGLRenderer();
        this.m_renderer.setSize(window.innerWidth, window.innerHeight);
        this.m_renderer.setClearColor(0x6655FF, 1);
        //TODO: REPLACE WITH A REAL ORBIT CAMERA
        this.m_originPoint = new THREE.Vector3(0, 0, 0);
        document.getElementById("canvas").appendChild(this.m_renderer.domElement);
        this.m_scene = new THREE.Scene();
        this.m_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.m_dummy = new THREE.Object3D;
        this.m_scene.add(this.m_dummy);
        var grid = new THREE.GridHelper(300, 10);
        this.m_scene.add(grid);
        this.m_camera.position.y = 150;
        this.m_camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.m_scene.add(this.m_camera);
        console.log(this.m_dummy.rotation);
        var light = new THREE.AmbientLight(0x404040); // soft white light
        this.m_scene.add(light);
        this.m_terrain = new Mesh(this.m_scene);
    }
    //redesign me!
    orbitCamera() {
        var temp = Math.cos(this.m_angleY * Math.PI / 180) * this.m_cameraDistance;
        var X = Math.sin(this.m_angleX * Math.PI / 180) * temp;
        var Y = Math.sin(this.m_angleY * Math.PI / 180) * this.m_cameraDistance;
        var Z = Math.cos(this.m_angleX * Math.PI / 180) * temp;
        this.m_camera.position.x = X;
        this.m_camera.position.y = Y;
        this.m_camera.position.z = Z;
        this.m_camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    run() {
        requestAnimationFrame(() => this.run());
        this.m_renderer.render(this.m_scene, this.m_camera);
        RenderScene.getInstance().renderToTexture(this.m_renderer);
        //this.m_terrain.render(this.m_renderer, this.m_scene, this.m_camera);
        this.orbitCamera();
        var mouseX = this.m_keylistener.getMouseX();
        var mouseY = this.m_keylistener.getMouseY();
        //if we have right click rotate the camera around the origin
        if (this.m_keylistener.getRightMouseButtonDown()) {
            if (this.m_mouseOldX != mouseX) {
                this.m_angleX += (this.m_mouseOldX - mouseX);
                if (this.m_angleX >= 360)
                    this.m_angleX -= 360;
                else if (this.m_angleX < 0)
                    this.m_angleX += 360;
                this.m_mouseOldX = mouseX;
            }
            if (this.m_mouseOldY != mouseY) {
                this.m_angleY += (this.m_mouseOldY - mouseY);
                if (this.m_angleY >= 360)
                    this.m_angleY -= 360;
                else if (this.m_angleY < 0)
                    this.m_angleY += 360;
                this.m_mouseOldY = mouseY;
            }
        }
        else {
            //This is to avoid the 'jumping' issue if you move your mouse a lot
            this.m_mouseOldX = mouseX;
            this.m_mouseOldY = mouseY;
        }
        if (this.m_keylistener.getMouseWheel() != 0) {
            this.m_cameraDistance += this.m_keylistener.getMouseWheel();
            //see keylistener class
            this.m_keylistener.resetMouseWheel();
        }
        if (this.m_keylistener.getLeftMouseButtonDown()) {
            //get mouse vector
            //then paint onto mesh
            var mouseX = this.m_keylistener.getMouseX();
            var mouseY = this.m_keylistener.getMouseY();
            //do some math here
            var mouseVector = new THREE.Vector2(mouseX, mouseY);
            mouseVector.x = 2 * (mouseX / window.innerWidth) - 1;
            mouseVector.y = -2 * (mouseY / window.innerHeight) + 1;
            this.m_terrain.paint(mouseVector, this.m_camera);
        }
    }
}
/// <reference path="renderer.ts"/>
// 'main' func
window.onload = () => {
    var renderer = new Renderer();
    renderer.run();
};
