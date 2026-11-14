# Validation

## Current miniature tree version

- Removed the angel, rig, animation updates, wave control and angel download. Current combined GLB contains no angel nodes, skins or animations.
- Tree, ribbon and ornaments share a parent with uniform scale 0.25. Gifts use 0.1375 / 0.1125 / 0.095, exactly one quarter of their former 0.55 / 0.45 / 0.38 scales.
- Combined GLB contains nine named gift groups arranged around the tree. Dome and base retain their previous size.
- Browser render inspected with winter room, glass reflections, DOF, bloom, snow crystals and snowdrifts.
- Ornament add/undo changed the count from 16 to 17 and back. Snow and Classic palette changes completed. No browser error logs during these actions or GLB export.
- Downloaded the current complete scene and replaced the public GLB (8,249,228 bytes).
- Khronos glTF Validator with maxIssues 100000: **0 errors, 1 warning**. The tree material uses runtime-generated tangent space; other viewers can shade it differently.
- Production bundle builds successfully. No API key or runtime paid API is required.

Snowdrifts are static geometry; flakes do not physically accumulate. Glass/DOF/bloom are real-time raster approximations. The GLB excludes the room, environment lighting, web post-processing and snow particles. Blender and Unity imports have not been validated: Blender previously failed at Metal initialization in this environment.

## Earlier release checks

The original release was inspected at desktop and 390 × 844 layouts. Public GitHub Pages loaded the assets and served the ornament ZIP. GitHub repository visibility was verified PUBLIC. Glass visibility controls were removed in a previous update. Camera effect controls were previously checked with their defaults restored afterward.
