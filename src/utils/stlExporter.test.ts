import { describe, it, expect } from "vitest";
import { generateSTL, generateOBJ, StlPillar } from "./stlExporter";

describe("stlExporter", () => {
  const mockPillars: StlPillar[] = [
    { col: 0, row: 0, yearIndex: 0, level: 0 },
    { col: 1, row: 2, yearIndex: 0, level: 3 },
  ];

  it("should generate a valid ASCII STL structure", () => {
    const stl = generateSTL(mockPillars, 1, 2.0, 2.0, 1.2);
    
    // Core file markers
    expect(stl).toContain("solid contributist_3d");
    expect(stl).toContain("endsolid contributist_3d");

    // Check triangle structure elements
    expect(stl).toContain("facet normal");
    expect(stl).toContain("outer loop");
    expect(stl).toContain("vertex");
    expect(stl).toContain("endloop");
    expect(stl).toContain("endfacet");
  });

  it("should generate a valid OBJ mesh structure", () => {
    const obj = generateOBJ(mockPillars, 1, 2.0, 2.0, 1.2);

    expect(obj).toContain("# Contributist 3D Trophy OBJ Export");
    expect(obj).toContain("g base_plate");
    expect(obj).toContain("g pillars");
    
    // Check vertex and face lines
    expect(obj).toContain("v ");
    expect(obj).toContain("f ");
  });
});
