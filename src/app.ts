import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Color3, LinesMesh } from "@babylonjs/core";

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
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 60, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Light setup
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        // Create the Sun
        var sun: Mesh = MeshBuilder.CreateSphere("sun", { diameter: 5 }, scene); // Sun (larger)
        var sunMat = new StandardMaterial("sunMat", scene);
        sunMat.diffuseColor = new Color3(1, 0.8, 0); // Yellowish sun color
        sun.material = sunMat;

        // Planetary properties (size, distance from Sun, rotation speed, and eccentricity for elliptical orbits)
        const planets = [
            { name: "Mercury", size: 0.5, semiMajorAxis: 7, speed: 0.02, eccentricity: 0.205, color: new Color3(0.7, 0.7, 0.7) },
            { name: "Venus", size: 0.9, semiMajorAxis: 10, speed: 0.015, eccentricity: 0.0067, color: new Color3(0.8, 0.6, 0.1) },
            { name: "Earth", size: 1, semiMajorAxis: 13, speed: 0.01, eccentricity: 0.0167, color: new Color3(0.22, 0.56, 0.89) },
            { name: "Mars", size: 0.7, semiMajorAxis: 17, speed: 0.008, eccentricity: 0.0934, color: new Color3(1, 0.5, 0) },
            { name: "Jupiter", size: 3, semiMajorAxis: 23, speed: 0.004, eccentricity: 0.0489, color: new Color3(0.8, 0.6, 0.4) },
            { name: "Saturn", size: 2.5, semiMajorAxis: 30, speed: 0.003, eccentricity: 0.0565, color: new Color3(0.8, 0.7, 0.5) },
            { name: "Uranus", size: 2, semiMajorAxis: 37, speed: 0.0025, eccentricity: 0.046, color: new Color3(0.6, 0.8, 0.9) },
            { name: "Neptune", size: 2, semiMajorAxis: 43, speed: 0.002, eccentricity: 0.0097, color: new Color3(0.3, 0.3, 0.8) }
        ];

        // Create all the planets and orbit lines
        const planetMeshes: Mesh[] = [];
        const planetAngles: number[] = [];
        planets.forEach(planet => {
            // Create a sphere for each planet
            const mesh = MeshBuilder.CreateSphere(planet.name, { diameter: planet.size }, scene);
            const mat = new StandardMaterial(`${planet.name}Mat`, scene);
            mat.diffuseColor = planet.color; // Set planet color
            mesh.material = mat;
            
            // Set the initial position of each planet
            mesh.position = new Vector3(planet.semiMajorAxis, 0, 0);
            planetMeshes.push(mesh);
            planetAngles.push(0); // Initial angle for each planet

            // Create an orbit path for each planet
            const orbitPoints = this.createOrbitPath(planet.semiMajorAxis, planet.eccentricity);
            MeshBuilder.CreateLines(planet.name + "Orbit", { points: orbitPoints, updatable: false }, scene);
        });

        // Function to update planet positions in elliptical orbits
        scene.beforeRender = () => {   
            planets.forEach((planet, index) => {
                // Semi-minor axis calculation: b = a * sqrt(1 - e^2)
                const semiMinorAxis = planet.semiMajorAxis * Math.sqrt(1 - planet.eccentricity ** 2);

                // Update planet's position based on elliptical orbit (X and Z position)
                planetMeshes[index].position.x = planet.semiMajorAxis * Math.cos(planetAngles[index]);
                planetMeshes[index].position.z = semiMinorAxis * Math.sin(planetAngles[index]);

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

    // Helper function to create an elliptical orbit path
    createOrbitPath(semiMajorAxis: number, eccentricity: number): Vector3[] {
        const points: Vector3[] = [];
        const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
        const steps = 360; // Number of points for the ellipse

        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * 2 * Math.PI; // Angle in radians
            const x = semiMajorAxis * Math.cos(theta); // X coordinate
            const z = semiMinorAxis * Math.sin(theta); // Z coordinate
            points.push(new Vector3(x, 0, z)); // Push the point onto the array
        }

        return points; // Return array of points for the orbit line
    }
}

new App();
