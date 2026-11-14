# Validation

## Current cinematic / rigged version

- Browser render inspected with winter room, glass reflections/refraction, depth-based DOF, bloom, snow crystals and snowdrifts.
- No browser error logs during loading, palette/ornament changes, animation toggling or exports.
- Glass visibility control removed; dome remains present.
- Camera controls checked: DOF 0%, bloom 0%, environment 150%, effect toggle. Defaults restored after the comparison.
- Ornament add/undo and palette switches checked with the rig running.
- Seated rig inspected from front, side and three-quarter views; dress/boot/wing weights adjusted for this pose.
- Exported angel contains one skin, **17 joints**, JOINTS_0 / WEIGHTS_0 attributes and the **6-second Seated_Gentle_Wave** animation.
- Exported rig reloaded with GLTFLoader and its animation played in a separate preview.
- PNG capture uses the post-processing compositor. Rigged angel and complete scene GLB downloads completed.
- Khronos glTF Validator, unlimited issue collection: revised angel, combined scene, dome and snow base all report **0 errors**.
- Rigged angel has 2 warnings; combined scene has 3: runtime-generated tangent space and a skinned mesh under a transformed parent. Browser round-trip was inspected; other engines may handle hierarchy/tangents differently. Dome and snow base have 0 warnings.
- Production bundle built successfully. No API key or runtime paid API is required.

The rig is specific to the seated pose and wrist wave. Arbitrary retargeted motions, walking, cloth simulation, Blender and Unity imports have not been validated. Snowdrifts are static geometry; flakes do not physically accumulate. Glass/DOF/bloom are real-time raster approximations, not offline path tracing.

## Initial release checks

The original release was inspected at desktop and 390 × 844 layouts. Public GitHub Pages loaded the assets and served the ornament ZIP. GitHub repository visibility was verified PUBLIC. The original 18 GLB files reported 0 validator errors. Blender failed at startup in Metal initialization, so no Blender execution is claimed.

## Joint correction

Reduced the previously excessive elbow rotations (about 89° / 66°) to about 26° / 17°, reduced wrist wave amplitude from ±14° to ±6°, and removed the opposing ankle rotation. Smoothed skin weights across welded mesh adjacency near arm and leg joints, keeping four normalized influences per vertex. Inspected front and three-quarter views at both extrema of the wave, then inspected the assembled scene. Re-exported the angel and full scene.
