import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

class App {
    constructor() {
        // Create the canvas and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // Initialize Babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        // Camera setup
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 30, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Light setup
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        // Create the Sun
        var sun: Mesh = MeshBuilder.CreateSphere("sun", { diameter: 3 }, scene); // Sun (larger)
        var sunMat = new StandardMaterial("sunMat", scene);
        sunMat.diffuseColor = new Color3(1, 0.8, 0); // Yellowish sun color
        sun.material = sunMat;

        // Create the Earth
        var earth: Mesh = MeshBuilder.CreateSphere("earth", { diameter: 1 }, scene); // Earth
        var earthMat = new StandardMaterial("earthMat", scene);
        earthMat.diffuseColor = new Color3(0.22, 0.56, 0.89); // Bluish earth color
        earth.material = earthMat;

        // Set Earth initial position (distance from the Sun)
        let earthDistanceFromSun = 10; // Set this to control the distance from the Sun

        // Create another planet (e.g., Mars) for fun
        var mars: Mesh = MeshBuilder.CreateSphere("mars", { diameter: 0.7 }, scene); // Mars
        var marsMat = new StandardMaterial("marsMat", scene);
        marsMat.diffuseColor = new Color3(1, 0.5, 0); // Reddish Mars color
        mars.material = marsMat;
        let marsDistanceFromSun = 15; // Set Mars distance from Sun

        // Variables for rotation
        let earthAngle = 0;
        let marsAngle = 0;
        let rotationSpeed = 0.01; // Control how fast the planets rotate

        // Function to update planet positions in circular orbits
        scene.beforeRender = function () {   
            // Earth circular orbit
            earth.position.x = earthDistanceFromSun * Math.cos(earthAngle); // Update Earth's X position
            earth.position.z = earthDistanceFromSun * Math.sin(earthAngle); // Update Earth's Z position
            earthAngle += rotationSpeed; // Increment Earth's angle for the next frame

            // Mars circular orbit
            mars.position.x = marsDistanceFromSun * Math.cos(marsAngle); // Update Mars' X position
            mars.position.z = marsDistanceFromSun * Math.sin(marsAngle); // Update Mars' Z position
            marsAngle += rotationSpeed * 0.8; // Mars moves slower (adjust as desired)
        };

        // Run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
    }
}
new App();
    