// d3-geo needs clockwise exterior rings. Flip any polygon whose spherical area
// exceeds a hemisphere (i.e. it was wound the GeoJSON/RFC7946 way).
import { geoArea } from "d3-geo";
import fs from "fs";
const file = "src/lib/geo/region.json";
const geo = JSON.parse(fs.readFileSync(file));
let flipped = 0;
for (const k of ["land", "lakes"]) for (const f of geo[k].features) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [];
  for (const rings of polys) {
    if (geoArea({ type: "Polygon", coordinates: rings }) > 2 * Math.PI) { rings.forEach((r) => r.reverse()); flipped++; }
  }
}
fs.writeFileSync(file, JSON.stringify(geo));
console.log("flipped", flipped);
