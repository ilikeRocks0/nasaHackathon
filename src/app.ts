import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Quaternion,
  Matrix,
} from "@babylonjs/core";

class App {
  constructor() {
    // Create the canvas and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    canvas.style.position = "absolute"; // Position it absolutely
    canvas.style.top = "0"; // Align to the top
    canvas.style.left = "0"; // Align to the left
    canvas.style.width = "100vw"; // Use viewport width
    canvas.style.height = "100vh"; // Use viewport height

    document.body.appendChild(canvas);

    // Initialize Babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);

    // Set the background color to black (space)
    scene.clearColor = new Color4(0, 0, 0, 1); // Black background for space (Color4)

    // Camera setup
    var camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      170,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);

    // Light setup
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      scene
    );

    // Create the Sun
    var sun: Mesh = MeshBuilder.CreateSphere("sun", { diameter: 5 }, scene); // Sun (larger)
    var sunMat = new StandardMaterial("sunMat", scene);
    sunMat.diffuseColor = new Color3(1, 0.8, 0); // Yellowish sun color
    sunMat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    sun.material = sunMat;

    // Add stars to simulate space background
    this.createStars(scene, 1500); // Create 1500 stars (you can adjust the number)

    // Planetary properties (size, semi-major axis, eccentricity, inclination for elliptical orbits)
    const planets = [
      {
        name: "Mercury",
        size: 0.5,
        semiMajorAxis: 7,
        eccentricity: 0.4,
        inclination: 7,
        speedBase: 0.05,
        color: new Color3(0.7, 0.7, 0.7),
      },
      {
        name: "Venus",
        size: 0.9,
        semiMajorAxis: 10,
        eccentricity: 0.25,
        inclination: 3,
        speedBase: 0.03,
        color: new Color3(0.8, 0.6, 0.1),
      },
      {
        name: "Earth",
        size: 1,
        semiMajorAxis: 13,
        eccentricity: 0.2,
        inclination: 0,
        speedBase: 0.025,
        color: new Color3(0.22, 0.56, 0.89),
      },
      {
        name: "Mars",
        size: 0.7,
        semiMajorAxis: 17,
        eccentricity: 0.3,
        inclination: 1.85,
        speedBase: 0.02,
        color: new Color3(1, 0.5, 0),
      },
      {
        name: "Jupiter",
        size: 3,
        semiMajorAxis: 23,
        eccentricity: 0.25,
        inclination: 1.3,
        speedBase: 0.015,
        color: new Color3(0.8, 0.6, 0.4),
      },
      {
        name: "Saturn",
        size: 2.5,
        semiMajorAxis: 30,
        eccentricity: 0.35,
        inclination: 2.48,
        speedBase: 0.012,
        color: new Color3(0.8, 0.7, 0.5),
      },
      {
        name: "Uranus",
        size: 2,
        semiMajorAxis: 37,
        eccentricity: 0.3,
        inclination: 0.77,
        speedBase: 0.01,
        color: new Color3(0.6, 0.8, 0.9),
      },
      {
        name: "Neptune",
        size: 2,
        semiMajorAxis: 43,
        eccentricity: 0.2,
        inclination: 1.77,
        speedBase: 0.008,
        color: new Color3(0.1, 0.3, 0.7),
        //eColor: new Color3(0.2, 0.4, 0.9)
      },
    ];

    // Create all the planets and orbit lines
    const planetMeshes: Mesh[] = [];
    const planetAngles: number[] = [];
    planets.forEach((planet) => {
      // Create a sphere for each planet
      const mesh = MeshBuilder.CreateSphere(
        planet.name,
        { diameter: planet.size },
        scene
      );
      const mat = new StandardMaterial(`${planet.name}Mat`, scene);
      mat.diffuseColor = planet.color; // Set planet color
      //mat.emissiveColor = planet.eColor; //set emissive color
      mesh.material = mat;

      // Set the initial position of each planet
      mesh.position = new Vector3(
        planet.semiMajorAxis * (1 - planet.eccentricity),
        0,
        0
      ); // Start near perihelion (closest point)
      planetMeshes.push(mesh);
      planetAngles.push(0); // Initial angle for each planet

      // Create an orbit path for each planet
      const orbitPoints = this.createOrbitPath(
        planet.semiMajorAxis,
        planet.eccentricity,
        planet.inclination
      );
      MeshBuilder.CreateLines(
        planet.name + "Orbit",
        { points: orbitPoints, updatable: false },
        scene
      );
    });

    // Function to update planet positions in elliptical orbits
    scene.beforeRender = () => {
      planets.forEach((planet, index) => {
        // Semi-minor axis calculation: b = a * sqrt(1 - e^2)
        const semiMinorAxis =
          planet.semiMajorAxis * Math.sqrt(1 - planet.eccentricity ** 2);

        // Update planet's position based on elliptical orbit (X and Z position)
        planetMeshes[index].position.x =
          planet.semiMajorAxis *
          (Math.cos(planetAngles[index]) - planet.eccentricity); // Elliptical formula for X
        planetMeshes[index].position.z =
          semiMinorAxis * Math.sin(planetAngles[index]); // Elliptical formula for Z

        // Calculate distance from the Sun at current position
        const distanceFromSun = Math.sqrt(
          planetMeshes[index].position.x ** 2 +
            planetMeshes[index].position.z ** 2
        );

        // Adjust speed based on current distance (faster when closer to Sun, slower when farther)
        const speed =
          planet.speedBase * (planet.semiMajorAxis / distanceFromSun);

        // Increment the angle for the next frame (rotation)
        planetAngles[index] += speed;
      });
    };

    // Run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "i") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });
  }

  // Helper function to create an elliptical orbit path with inclination
  createOrbitPath(
    semiMajorAxis: number,
    eccentricity: number,
    inclination: number
  ): Vector3[] {
    const points: Vector3[] = [];
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
    const steps = 360; // Number of points for the ellipse
    const tilt = Quaternion.FromEulerAngles(
      (inclination * Math.PI) / 180,
      0,
      0
    ); // Apply tilt as a quaternion

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI; // Angle in radians
      const x = semiMajorAxis * (Math.cos(theta) - eccentricity); // Elliptical formula for X
      const z = semiMinorAxis * Math.sin(theta); // Elliptical formula for Z
      let point = new Vector3(x, 0, z);

      // Apply tilt (inclination) to the orbit
      point = Vector3.TransformCoordinates(
        point,
        tilt.toRotationMatrix(Matrix.Identity())
      );

      points.push(point); // Push the point onto the array
    }

    return points; // Return array of points for the orbit line
  }

  // Helper function to create stars in the background
  createStars(scene: Scene, numStars: number) {
    for (let i = 0; i < numStars; i++) {
      const star = MeshBuilder.CreateSphere(
        `star${i}`,
        { diameter: 0.5 },
        scene
      ); // Larger star diameter
      const starMat = new StandardMaterial(`starMat${i}`, scene);
      starMat.emissiveColor = new Color3(1, 1, 1); // Emissive white color so stars glow
      star.material = starMat;

      // Randomize the position of each star
      star.position = new Vector3(
        (Math.random() - 0.5) * 500, // Random X position within a smaller range
        (Math.random() - 0.5) * 500, // Random Y position
        (Math.random() - 0.5) * 500 // Random Z position
      );
    }
  }
}

new App();
