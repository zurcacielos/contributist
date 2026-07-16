export interface StlPillar {
  col: number; // 0 to 52
  row: number; // 0 to 6
  yearIndex: number; // index of the year
  level: number; // 0 to 4
}

// Generates an ASCII STL file content for the 3D grid
export function generateSTL(
  pillars: StlPillar[],
  numYears: number,
  heightMultiplier: number,
  baseThickness: number,
  spacing: number
): string {
  const pillarSize = 1.0;
  const yearGap = 2; // spacing between years

  let stl = "solid contributist_3d\n";

  // Helper to append a triangle to the STL string
  const addTriangle = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) => {
    // Calculate normal vector
    const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    const nx = u[1] * v[2] - u[2] * v[1];
    const ny = u[2] * v[0] - u[0] * v[2];
    const nz = u[0] * v[1] - u[1] * v[0];
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

    stl += `  facet normal ${nx / len} ${ny / len} ${nz / len}\n`;
    stl += "    outer loop\n";
    stl += `      vertex ${p1[0]} ${p1[1]} ${p1[2]}\n`;
    stl += `      vertex ${p2[0]} ${p2[1]} ${p2[2]}\n`;
    stl += `      vertex ${p3[0]} ${p3[1]} ${p3[2]}\n`;
    stl += "    endloop\n";
    stl += "  endfacet\n";
  };

  // Helper to append a box to the STL string
  const addBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number
  ) => {
    const xMin = x - w / 2;
    const xMax = x + w / 2;
    const yMin = y;
    const yMax = y + h;
    const zMin = z - d / 2;
    const zMax = z + d / 2;

    const v0: [number, number, number] = [xMin, yMin, zMin];
    const v1: [number, number, number] = [xMax, yMin, zMin];
    const v2: [number, number, number] = [xMax, yMax, zMin];
    const v3: [number, number, number] = [xMin, yMax, zMin];
    const v4: [number, number, number] = [xMin, yMin, zMax];
    const v5: [number, number, number] = [xMax, yMin, zMax];
    const v6: [number, number, number] = [xMax, yMax, zMax];
    const v7: [number, number, number] = [xMin, yMax, zMax];

    // Front (zMin)
    addTriangle(v0, v2, v1);
    addTriangle(v0, v3, v2);

    // Back (zMax)
    addTriangle(v5, v6, v4);
    addTriangle(v4, v6, v7);

    // Left (xMin)
    addTriangle(v4, v3, v0);
    addTriangle(v4, v7, v3);

    // Right (xMax)
    addTriangle(v1, v2, v5);
    addTriangle(v5, v2, v6);

    // Top (yMax)
    addTriangle(v3, v6, v2);
    addTriangle(v3, v7, v6);

    // Bottom (yMin)
    addTriangle(v4, v1, v5);
    addTriangle(v4, v0, v1);
  };

  // 1. Generate Base Plate
  const totalWeeks = 53;
  const totalRows = numYears * 7 + (numYears - 1) * yearGap;
  
  const baseWidth = totalWeeks * spacing;
  const baseDepth = totalRows * spacing;
  
  const baseX = (totalWeeks - 1) * spacing / 2;
  const baseZ = (totalRows - 1) * spacing / 2;

  // Add the solid base plate below y = 0
  addBox(baseX, -baseThickness, baseZ, baseWidth, baseThickness, baseDepth);

  // 2. Generate Pillars for each day
  pillars.forEach((p) => {
    const px = p.col * spacing;
    const pz = (p.yearIndex * (7 + yearGap) + p.row) * spacing;
    
    // Pillar height based on contribution level
    // Level 0 gets a tiny height so it is visible as a textured grid cell
    const ph = p.level === 0 ? 0.2 : p.level * heightMultiplier;

    addBox(px, 0, pz, pillarSize, ph, pillarSize);
  });

  stl += "endsolid contributist_3d\n";
  return stl;
}

// Generates an OBJ file content for the 3D grid
export function generateOBJ(
  pillars: StlPillar[],
  numYears: number,
  heightMultiplier: number,
  baseThickness: number,
  spacing: number
): string {
  const pillarSize = 1.0;
  const yearGap = 2;

  let obj = "# Contributist 3D Trophy OBJ Export\n";
  let vCount = 0;

  const addBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number
  ) => {
    const xMin = x - w / 2;
    const xMax = x + w / 2;
    const yMin = y;
    const yMax = y + h;
    const zMin = z - d / 2;
    const zMax = z + d / 2;

    obj += `v ${xMin} ${yMin} ${zMin}\n`; // 1
    obj += `v ${xMax} ${yMin} ${zMin}\n`; // 2
    obj += `v ${xMax} ${yMax} ${zMin}\n`; // 3
    obj += `v ${xMin} ${yMax} ${zMin}\n`; // 4
    obj += `v ${xMin} ${yMin} ${zMax}\n`; // 5
    obj += `v ${xMax} ${yMin} ${zMax}\n`; // 6
    obj += `v ${xMax} ${yMax} ${zMax}\n`; // 7
    obj += `v ${xMin} ${yMax} ${zMax}\n`; // 8

    const base = vCount;
    // 6 faces
    obj += `f ${base + 1} ${base + 3} ${base + 2}\n`;
    obj += `f ${base + 1} ${base + 4} ${base + 3}\n`;
    
    obj += `f ${base + 6} ${base + 7} ${base + 5}\n`;
    obj += `f ${base + 5} ${base + 7} ${base + 8}\n`;
    
    obj += `f ${base + 5} ${base + 4} ${base + 1}\n`;
    obj += `f ${base + 5} ${base + 8} ${base + 4}\n`;
    
    obj += `f ${base + 2} ${base + 3} ${base + 6}\n`;
    obj += `f ${base + 6} ${base + 3} ${base + 7}\n`;
    
    obj += `f ${base + 4} ${base + 7} ${base + 3}\n`;
    obj += `f ${base + 4} ${base + 8} ${base + 7}\n`;
    
    obj += `f ${base + 5} ${base + 2} ${base + 6}\n`;
    obj += `f ${base + 5} ${base + 1} ${base + 2}\n`;

    vCount += 8;
  };

  // 1. Generate Base Plate
  const totalWeeks = 53;
  const totalRows = numYears * 7 + (numYears - 1) * yearGap;
  const baseWidth = totalWeeks * spacing;
  const baseDepth = totalRows * spacing;
  const baseX = (totalWeeks - 1) * spacing / 2;
  const baseZ = (totalRows - 1) * spacing / 2;

  obj += "g base_plate\n";
  addBox(baseX, -baseThickness, baseZ, baseWidth, baseThickness, baseDepth);

  // 2. Generate Pillars
  obj += "g pillars\n";
  pillars.forEach((p) => {
    const px = p.col * spacing;
    const pz = (p.yearIndex * (7 + yearGap) + p.row) * spacing;
    const ph = p.level === 0 ? 0.2 : p.level * heightMultiplier;
    addBox(px, 0, pz, pillarSize, ph, pillarSize);
  });

  return obj;
}
