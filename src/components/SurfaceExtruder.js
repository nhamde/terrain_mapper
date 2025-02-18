const setFaceVertexIndices = (gridX, gridY, startIndex = 0) =>
{
    const indices = [];

    for (let y = 0; y < gridY - 1; y++)
    {
        for (let x = 0; x < gridX - 1; x++)
        {
            const i1 = startIndex + y * gridX + x;
            const i2 = i1 + 1;
            const i3 = startIndex + (y + 1) * gridX + x;
            const i4 = i3 + 1;
    
            indices.push(i1, i3, i2, i2, i3, i4);
        }
    }
    return indices;
};

export const SurfaceExtruder = (surfaceVertices, minZ, gridX, gridY) =>
{
    // Top and Base Vertices
    const topVertices = [...surfaceVertices];  // Original surface
    const baseVertices = surfaceVertices.map((val, id) => (id % 3 === 2 ? minZ : val));  // Flattened surface

    // Side Faces Vertices
    const frontTop = topVertices.slice(((gridY - 1) * gridX) * 3);
    const frontBase = baseVertices.slice(((gridY - 1) * gridX) * 3);
    const frontVertices = [...frontTop, ...frontBase];

    const backTop = topVertices.slice(0, gridX * 3);
    const backBase = baseVertices.slice(0, gridX * 3);
    const backVertices = [...backTop, ...backBase];

    const leftTop = [];
    const leftBase = [];
    const rightTop = [];
    const rightBase = [];

    for (let y = 0; y < gridY; y++)
    {
        leftTop.push(...topVertices.slice((y * gridX) * 3, (y * gridX) * 3 + 3));
        leftBase.push(...baseVertices.slice((y * gridX) * 3, (y * gridX) * 3 + 3));

        rightTop.push(...topVertices.slice((y * gridX + gridX - 1) * 3, (y * gridX + gridX) * 3));
        rightBase.push(...baseVertices.slice((y * gridX + gridX - 1) * 3, (y * gridX + gridX) * 3));
    }

    const leftVertices = [...leftTop, ...leftBase];
    const rightVertices = [...rightTop, ...rightBase];

    // Generating Indices
    const topSurfaceIndices = setFaceVertexIndices(gridX, gridY);
    const vertexOffsetAfterTopSurface = topVertices.length / 3;

    const baseSurfaceIndices = setFaceVertexIndices(gridX, gridY, vertexOffsetAfterTopSurface);
    const vertexOffsetAfterBaseSurface = vertexOffsetAfterTopSurface + baseVertices.length / 3;

    const frontIndices = setFaceVertexIndices(gridX, 2, vertexOffsetAfterBaseSurface);
    const vertexOffsetAfterFrontSurface = vertexOffsetAfterBaseSurface + frontVertices.length / 3;

    const backIndices = setFaceVertexIndices(gridX, 2, vertexOffsetAfterFrontSurface);
    const vertexOffsetAfterBackSurface = vertexOffsetAfterFrontSurface + backVertices.length / 3;

    const leftIndices = setFaceVertexIndices(gridY, 2, vertexOffsetAfterBackSurface);
    const vertexOffsetAfterLeftSurface = vertexOffsetAfterBackSurface + leftVertices.length / 3;

    const rightIndices = setFaceVertexIndices(gridY, 2, vertexOffsetAfterLeftSurface);

    // Final Combined Data
    const finalVertices = [
        ...topVertices,
        ...baseVertices,
        ...frontVertices,
        ...backVertices,
        ...leftVertices,
        ...rightVertices
    ];

    const finalIndices = [
        ...topSurfaceIndices,
        ...baseSurfaceIndices,
        ...frontIndices,
        ...backIndices,
        ...leftIndices,
        ...rightIndices
    ];

    return { finalVertices, finalIndices };
};
