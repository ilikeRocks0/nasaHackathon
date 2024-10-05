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
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 50, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Light setup
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        // Create the Sun
        var sun: Mesh = MeshBuilder.CreateSphere("sun", { diameter: 5 }, scene); // Sun (larger)
        var sunMat = new StandardMaterial("sunMat", scene);
        sunMat.diffuseColor = new Color3(1, 0.8, 0); // Yellowish sun color
        sun.material = sunMat;

        // Planetary properties (size, distance from Sun, rotation speed)
        const planets = [
            { name: "Mercury", size: 0.5, distance: 7, speed: 0.02, color: new Color3(0.7, 0.7, 0.7) },
            { name: "Venus", size: 0.9, distance: 10, speed: 0.015, color: new Color3(0.8, 0.6, 0.1) },
            { name: "Earth", size: 1, distance: 13, speed: 0.01, color: new Color3(0.22, 0.56, 0.89) },
            { name: "Mars", size: 0.7, distance: 17, speed: 0.008, color: new Color3(1, 0.5, 0) },
            { name: "Jupiter", size: 3, distance: 23, speed: 0.004, color: new Color3(0.8, 0.6, 0.4) },
            { name: "Saturn", size: 2.5, distance: 30, speed: 0.003, color: new Color3(0.8, 0.7, 0.5) },
            { name: "Uranus", size: 2, distance: 37, speed: 0.0025, color: new Color3(0.6, 0.8, 0.9) },
            { name: "Neptune", size: 2, distance: 43, speed: 0.002, color: new Color3(0.3, 0.3, 0.8) }
        ];

        // Create all the planets
        const planetMeshes: Mesh[] = [];
        const planetAngles: number[] = [];
        planets.forEach(planet => {
            // Create a sphere for each planet
            const mesh = MeshBuilder.CreateSphere(planet.name, { diameter: planet.size }, scene);
            const mat = new StandardMaterial(`${planet.name}Mat`, scene);
            mat.diffuseColor = planet.color; // Set planet color
            mesh.material = mat;
            
            // Set the initial position of each planet
            mesh.position = new Vector3(planet.distance, 0, 0);
            planetMeshes.push(mesh);
            planetAngles.push(0); // Initial angle for each planet
        });

        // Function to update planet positions in circular orbits
        scene.beforeRender = function () {   
            planets.forEach((planet, index) => {
                // Update planet's position based on simple circular orbit (X and Z position)
                planetMeshes[index].position.x = planet.distance * Math.cos(planetAngles[index]);
                planetMeshes[index].position.z = planet.distance * Math.sin(planetAngles[index]);

                // Increment the angle for the next frame (rotation)
                planetAngles[index] += planet.speed;
            });
        };

        // Run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Hide/show the Inspector
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
