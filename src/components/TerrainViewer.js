import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import  {SurfaceExtruder}  from "./SurfaceExtruder";

const TerrainViewer = ({ elevationData, planeSize, center }) => 
{
    const mountRef = useRef(null);

    useEffect(() => 
    {
        if (!elevationData) return;

        const { results: elevations, gridX, gridY } = elevationData;
        const width = planeSize.width;
        const height = planeSize.height;

        if (elevations.length !== gridX * gridY) 
        {
            console.error(`Elevation data length mismatch: Expected ${gridX * gridY}, got ${elevations.length}`);
            return;
        }

        // Scene Setup
        const scene = new THREE.Scene();

        const renderer = new THREE.WebGLRenderer();
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
                const elevationValue = elevations[elevationIndex] || 0; 

                const vertexIndex = (y * gridX + x) * 3;
                vertices[vertexIndex + 2] = elevationValue; // Set elevation (Z)

                // Sum X, Y, Z coordinates
                sumX += vertices[vertexIndex];     // X
                sumY += vertices[vertexIndex + 1]; // Y
                sumZ += vertices[vertexIndex + 2]; // Z
                numVertices++;
            }
        } 

        // geometry.attributes.position.needsUpdate = true;
        // geometry.computeVertexNormals();

        // Compute the center vertex (Average of all X, Y, Z)
        const avgX = sumX / numVertices;
        const avgY = sumY / numVertices;
        const avgZ = sumZ / numVertices;
        console.log(`Center Vertex: (${avgX}, ${avgY}, ${avgZ})`);

        // Camera setup based on the center vertex
        const camera = new THREE.PerspectiveCamera(60, 1, 1, 5000);
        const distance = Math.max(width, height) * 1.1; // Dynamic distance
        camera.position.set(0, 0, 0); 
        camera.lookAt(0, 0, 0); 

        const minZ = 3540;
        const {finalVertices, finalIndices} = SurfaceExtruder(vertices, minZ, gridX, gridY);

        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setIndex( finalIndices );
        bufferGeometry.setAttribute( 'position', new THREE.BufferAttribute(new Float32Array(finalVertices), 3) );


        // Create a material and mesh
        const material = new THREE.MeshStandardMaterial({ color: 0x88cc88, wireframe: false, side: THREE.DoubleSide});
        bufferGeometry.translate(-avgX, -avgY, -avgZ);
        const terrainMesh = new THREE.Mesh(bufferGeometry, material);
        terrainMesh.rotation.x = -Math.PI / 2;
        scene.add(terrainMesh);

        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 10, 10).normalize();
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // 🔹 OrbitControls for navigation
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.minDistance = 10;  // Allow very close zoom
        controls.maxDistance = distance * 2; // Limit zoom-out
        controls.enablePan = true;
        controls.target.set(0, 0, 0);
        controls.update();

        // Render loop
        const animate = () => 
        {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => mountRef.current.removeChild(renderer.domElement);
    }, [elevationData, planeSize]);

    return <div ref={mountRef} />;
};

export default TerrainViewer;