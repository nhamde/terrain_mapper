import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import  {SurfaceExtruder}  from "./SurfaceExtruder";
import { useSelector } from "react-redux";
import PondModel from "./PondModel";

const TerrainViewer = () => 
{
    const mountRef = useRef(null);
    const elevation = useSelector((state)=> state.elevationDataSetter);
    const planeSize = useSelector((state) => state.planeSizeSetter);

    // Scene Setup
    const scene = new THREE.Scene();
        
    useEffect(() => 
    {

        if (!elevation.elevationData) return;

        const { elevationData, gridX, gridY } = elevation;
        const width = planeSize.width;
        const height = planeSize.height;

        if (elevationData.length !== gridX * gridY) 
        {
            console.error(`Elevation data length mismatch: Expected ${gridX * gridY}, got ${elevationData.length}`);
            return;
        }

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(500, 500);
        mountRef.current.appendChild(renderer.domElement);

        // Create PlaneGeometry
        const geometry = new THREE.PlaneGeometry(width, height, gridX - 1, gridY - 1);
        const vertices = geometry.attributes.position.array;

        let sumX = 0, sumY = 0, sumZ = 0;
        let numVertices = 0;

        for (let y = 0; y < gridY; y++) 
        {
            for (let x = 0; x < gridX; x++) 
            {
                const elevationIndex = y * gridX + x; 
                const elevationValue = elevationData[elevationIndex] || 0; 

                const vertexIndex = (y * gridX + x) * 3;
                vertices[vertexIndex + 2] = elevationValue; // Set elevation (Z)

                // Sum X, Y, Z coordinates
                sumX += vertices[vertexIndex];     // X
                sumY += vertices[vertexIndex + 1]; // Y
                sumZ += vertices[vertexIndex + 2]; // Z
                numVertices++;
            }
        } 

        const avgX = sumX / numVertices;
        const avgY = sumY / numVertices;
        const avgZ = sumZ / numVertices;

        // Camera setup based on the center vertex
        const camera = new THREE.PerspectiveCamera(60, 1, 1, 5000);
        camera.position.set(0, 0, 3500); 
        camera.lookAt(avgX, avgY, avgZ); 

        const minZ = 3480;
        const {finalVertices, finalIndices} = SurfaceExtruder(vertices, minZ, gridX, gridY);

        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setIndex( finalIndices );
        bufferGeometry.setAttribute( 'position', new THREE.BufferAttribute(new Float32Array(finalVertices), 3) );


        // Create a material and mesh
        const material = new THREE.MeshStandardMaterial  ({ color: 0x88cc88, roughness: 0.5, side: THREE.DoubleSide});
        bufferGeometry.translate(-avgX, -avgY, -avgZ);
        bufferGeometry.computeVertexNormals();
        const terrainMesh = new THREE.Mesh(bufferGeometry, material);
        terrainMesh.rotation.x = -Math.PI / 2;
        scene.add(terrainMesh);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(0, 500, 500); // Position above and slightly in front
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // 🔹 OrbitControls for navigation
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.minDistance = 10;  // Allow very close zoom
        const distance = Math.max(width, height) * 1.1; // Dynamic distance
        // controls.maxDistance = distance * 30; // Limit zoom-out
        controls.enablePan = true;
        controls.target.set(0, 0, 0);
        controls.update();

        // RayCaster
        const rayCaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        

        // Render loop
        const animate = () => 
        {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => mountRef.current.removeChild(renderer.domElement);
    }, [elevation, planeSize]);

    return (
        <div ref={mountRef}>
            <PondModel scene={scene} />
        </div>
    );
    
};

export default TerrainViewer;