import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";

const PondModel = ({ scene }) => {
    const pondRef = useRef();
    const [length, setLength] = useState(200);
    const [width, setWidth] = useState(200);
    const [hwl, setHwl] = useState(50);
    const [nwl, setNwl] = useState(10);
    const [interiorSlope, setInteriorSlope] = useState(1);

    useEffect(() => {
        if (!scene) return;

        // Remove previous pond if exists
        if (pondRef.current) {
            pondRef.current.forEach(mesh => scene.remove(mesh));
        }

        // HWL (High Water Level) corners
        const fl_hwl = new THREE.Vector3(-length / 2, -width / 2, hwl);
        const fr_hwl = new THREE.Vector3(length / 2, -width / 2, hwl);
        const bl_hwl = new THREE.Vector3(-length / 2, width / 2, hwl);
        const br_hwl = new THREE.Vector3(length / 2, width / 2, hwl);

        // NWL (Normal Water Level) corners
        const nwlLength = length - 2 * (hwl - nwl) / interiorSlope;
        const nwlWidth = width - 2 * (hwl - nwl) / interiorSlope;
        const fl_nwl = new THREE.Vector3(-nwlLength / 2, -nwlWidth / 2, nwl);
        const fr_nwl = new THREE.Vector3(nwlLength / 2, -nwlWidth / 2, nwl);
        const bl_nwl = new THREE.Vector3(-nwlLength / 2, nwlWidth / 2, nwl);
        const br_nwl = new THREE.Vector3(nwlLength / 2, nwlWidth / 2, nwl);

        const material = new THREE.MeshStandardMaterial({
            color: 0x88cc88,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        // Function to create a face
        const createFace = (v1, v2, v3, v4) => {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                v1.x, v1.y, v1.z,
                v2.x, v2.y, v2.z,
                v3.x, v3.y, v3.z,
                v4.x, v4.y, v4.z
            ]);
            const indices = [
                0, 1, 2,
                2, 1, 3
            ];
            geometry.setIndex(indices);
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
            geometry.computeVertexNormals();
            return new THREE.Mesh(geometry, material);
        };

        // Create all pond faces
        const frontFace = createFace(fl_hwl, fr_hwl, fl_nwl, fr_nwl);
        const backFace = createFace(bl_hwl, br_hwl, bl_nwl, br_nwl);
        const leftFace = createFace(fl_hwl, bl_hwl, fl_nwl, bl_nwl);
        const rightFace = createFace(fr_hwl, br_hwl, fr_nwl, br_nwl);
        const bottomFace = createFace(fl_nwl, fr_nwl, bl_nwl, br_nwl);

        // Group all pond parts
        const pondGroup = new THREE.Group();
        pondGroup.add(frontFace, backFace, leftFace, rightFace, bottomFace);

        // Apply rotation around the X-axis (-90° to align properly)
        pondGroup.rotation.x = -Math.PI / 2;

        // Add to scene
        scene.add(pondGroup);

        // Store reference to remove later
        pondRef.current = [pondGroup];

    }, [length, width, hwl, nwl, interiorSlope, scene]);

    return (
        <div>
            <label>Length: <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value))} /></label>
            <label>Width: <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value))} /></label>
            <label>HWL: <input type="number" value={hwl} onChange={(e) => setHwl(parseFloat(e.target.value))} /></label>
            <label>NWL: <input type="number" value={nwl} onChange={(e) => setNwl(parseFloat(e.target.value))} /></label>
            <label>Interior Slope: <input type="number" value={interiorSlope} onChange={(e) => setInteriorSlope(parseFloat(e.target.value))} /></label>
        </div>
    );
};

export default PondModel;
