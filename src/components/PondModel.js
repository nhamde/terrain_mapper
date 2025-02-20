import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";

const PondModel = ({ scene }) => {
    const pondRef = useRef();
    const [length, setLength] = useState(200);
    const [width, setWidth] = useState(200);
    const [hwl, setHwl] = useState(50);
    const [nwl, setNwl] = useState(30);
    const [safetyLedge, setSafetyLedge] = useState(10);
    const [safetyLedgeLength, setSafetyLedgeLength] = useState(10);
    const [overBoarding, setOverBoarding] = useState(70);
    const [interiorSlope, setInteriorSlope] = useState(1);
    const [bottomSlope, setBottomSlope] = useState(0.5);

    useEffect(() => {
        if (!scene) return;

        if (pondRef.current) {
            pondRef.current.forEach(mesh => scene.remove(mesh));
        }

        const createFace = (v1, v2, v3, v4, color) => {
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
            return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.5, side: THREE.DoubleSide }));
        };

        const levels = [overBoarding, hwl, nwl, safetyLedge];
        const colors = [0x88cc88, 0x77bb77, 0x66aa66, 0x559955];
        const pondGroup = new THREE.Group();

        for (let i = 0; i < levels.length - 1; i++) {
            const topZ = levels[i];
            const bottomZ = levels[i + 1];
            const topLength = length - 2 * (overBoarding - topZ) / interiorSlope;
            const topWidth = width - 2 * (overBoarding - topZ) / interiorSlope;
            const bottomLength = length - 2 * (overBoarding - bottomZ) / interiorSlope;
            const bottomWidth = width - 2 * (overBoarding - bottomZ) / interiorSlope;

            const fl_top = new THREE.Vector3(-topLength / 2, -topWidth / 2, topZ);
            const fr_top = new THREE.Vector3(topLength / 2, -topWidth / 2, topZ);
            const bl_top = new THREE.Vector3(-topLength / 2, topWidth / 2, topZ);
            const br_top = new THREE.Vector3(topLength / 2, topWidth / 2, topZ);

            const fl_bottom = new THREE.Vector3(-bottomLength / 2, -bottomWidth / 2, bottomZ);
            const fr_bottom = new THREE.Vector3(bottomLength / 2, -bottomWidth / 2, bottomZ);
            const bl_bottom = new THREE.Vector3(-bottomLength / 2, bottomWidth / 2, bottomZ);
            const br_bottom = new THREE.Vector3(bottomLength / 2, bottomWidth / 2, bottomZ);

            const color = colors[i];
            pondGroup.add(createFace(fl_top, fr_top, fl_bottom, fr_bottom, color));
            pondGroup.add(createFace(bl_top, br_top, bl_bottom, br_bottom, color));
            pondGroup.add(createFace(fl_top, bl_top, fl_bottom, bl_bottom, color));
            pondGroup.add(createFace(fr_top, br_top, fr_bottom, br_bottom, color));
        }

        

        pondGroup.rotation.x = -Math.PI / 2;
        scene.add(pondGroup);
        pondRef.current = [pondGroup];
    }, [length, width, overBoarding, hwl, nwl, safetyLedge, safetyLedgeLength, interiorSlope, bottomSlope, scene]);

    return (
        <div>
            <label>Length: <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value))} /></label>
            <label>Width: <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value))} /></label>
            <label>HWL: <input type="number" value={hwl} onChange={(e) => setHwl(parseFloat(e.target.value))} /></label>
            <label>NWL: <input type="number" value={nwl} onChange={(e) => setNwl(parseFloat(e.target.value))} /></label>
            <label>Safety Ledge: <input type="number" value={safetyLedge} onChange={(e) => setSafetyLedge(parseFloat(e.target.value))} /></label>
            <label>Safety Ledge Length: <input type="number" value={safetyLedgeLength} onChange={(e) => setSafetyLedgeLength(parseFloat(e.target.value))} /></label>
            <label>Overboarding: <input type="number" value={overBoarding} onChange={(e) => setOverBoarding(parseFloat(e.target.value))} /></label>
            <label>Interior Slope: <input type="number" value={interiorSlope} onChange={(e) => setInteriorSlope(parseFloat(e.target.value))} /></label>
            <label>Bottom Slope: <input type="number" value={bottomSlope} onChange={(e) => setBottomSlope(parseFloat(e.target.value))} /></label>
        </div>
    );
};

export default PondModel;