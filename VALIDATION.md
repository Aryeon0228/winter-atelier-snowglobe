## Gift opening / confetti / snowman placement

- Rebuilt gifts as hollow boxes with independent lids; lid ribbons and bows follow their lids. Click or keyboard button triggers anticipation, lift, one burst, hover and automatic closing over 2.7 seconds. Nine gifts keep separate states; palette rebuild preserves the pose; repeated clicks on an active gift do not restart it.
- Confetti uses a fixed pool of 360 instanced paper pieces, 40 per burst, with bounded motion inside the dome, above the snow, and complete expiry. Idle frames skip pool updates. Scene export removes confetti and restores cloned lids to closed poses.
- Lowered snowman's shared Y coordinate from 0.625 to 0.565 in both live and downloadable scenes.
- 16 automated tests pass, including hollow cavity raycast, bow/lid hierarchy, exact closing/export restoration, independent/repeated clicks, delayed single burst, palette rebind, 30/120 fps timing, pool bounds and expiry.
- Inspected four offline renders of the actual gift pose and particle calculations (closed, burst, hover, closed again). These are not browser screenshots; live browser interaction remains unverified.
- Regenerated gift models, combined scene and ZIP. Standalone gift: 0 glTF errors / 0 warnings. Combined scene: 0 errors / 1 existing tree tangent warning; confirmed nine lid nodes and updated snowman translation.

# Validation

## Scarf follow-through

- Converted both hanging scarf ends to independent top-anchored groups, preserving the resting placement. Added position/normal morph targets that bend progressively toward the free tips.
- Offset takeoff/landing responses produce independent outward flaps; a smooth fade settles both tails at 2.4 seconds while the existing jump remains 1.6 seconds. The collar follows the body.
- Twelve tests pass, including fixed scarf attachments, moving/bending free tips, left/right timing differences, landing follow-through and export/rest restoration without mutating the live model.
- Inspected a 37-frame offline render sequence with the actual morph deformation baked for preview. Browser inspection remains unavailable.
- Rebuilt standalone and combined GLBs and ZIP. glTF validation: snowman 0 errors / 0 warnings; combined scene 0 errors / 1 existing tangent warning.


## Mailbox letter interaction

- Built a hollow mailbox with a hinged door and envelope. The door opens first; the envelope emerges and a native modal dialog opens after 0.85 seconds. Closing returns the envelope and door to rest.
- Added object clicking and a keyboard-accessible open button, labeled To/From/message fields, 300-character limit, localStorage draft recovery and PNG export combining the current WebGL canvas with the letter. Input is handled as plain text. Storage failures leave the editor and download available.
- Eleven tests pass: mailbox timing/close/rebind/export restoration, draft round-trip/malformed and blocked storage, Korean line wrapping and long multiline card layout, mocked dialog/form input/save/download/close integration, plus prior snowman and tree tests. Native modal focus and real browser PNG download remain unverified because browser control is unavailable.
- Inspected an offline render of the opened mailbox. Regenerated static downloads and preview. glTF validation: mailbox 0 errors / 0 warnings; full scene 0 errors / 1 existing tangent warning.


## Snowman click jump

- Split the existing model into body (with scarf), head (with eyes) and independent tilted hat without changing its resting appearance.
- A 1.6-second reaction adds anticipation/squash, jump, head and hat separation, staggered landing and settling. Eyes widen while surprised. Repeated clicks during a jump do not restart it. Palette changes rebind the current pose to the replacement model.
- Snowman ray hits are handled before the tree’s ornament limit; camera drags and cancelled/multiple-pointer gestures do not trigger clicks. Added a keyboard-accessible button for the same action.
- Seven automated tests pass, covering this action and existing tree motion: visible separation, ground clearance, ordered landing, finite transforms, exact rest restoration, palette rebind, repeated clicks and frame-rate consistency.
- Inspected a 25-frame offline sequence generated with the same model and pose function. This is not a live-browser recording; the browser connection remains unavailable.
- Standalone and combined GLBs were rebuilt and validated: 0 errors; combined scene retains one tangent warning. Web export restores the cloned snowman to rest without altering the live pose. Animation is not baked into GLB clips.


## Small tilted hat

Replaced the snowman’s rounded cap with a pointed cone in a hat group at uniform scale 0.7 (increased from 0.5), tilted 0.29 radians around its brim and lowered to cover more of the head. Inspected the isolated model with the offline renderer. Rebuilt the web bundle, standalone model, full scene and ZIP. glTF validation: snowman 0 errors / 0 warnings; full scene 0 errors / 1 existing tangent warning.


## Simplified snowman

Removed the two blush patches, carrot nose, smile and both mittens from the source mesh. Inspected the new standalone model with the offline renderer. Rebuilt the live bundle, standalone snowman GLB, combined scene and ornament ZIP. glTF validation: snowman 0 errors / 0 warnings; combined scene 0 errors / 1 existing tangent warning. Live browser inspection remains unavailable.


## Hanging ornament / tree reaction update

- Both tree-click and add-button placement bind a pendulum and trigger a shared tree impulse. New decorations append without rebuilding existing scene objects.
- Baubles and bells rotate around their top ring; the tree assembly rotates around its ground contact at (0, 0.63, 0). Spring states survive palette rebuilds and are cleared by decoration reset.
- `node --test tests/tree-motion.test.mjs`: four passing tests cover stationary hooks, unchanged rest positions, fixed tree foot, visible swing, settling after 12 seconds, 30/120 fps consistency, rebinding and 1,000 rapid impulses without instability.
- Export clones reset tree and pendulum rotations to the resting pose; the animation remains a web interaction rather than a baked GLB clip.
- Production build passed. Live browser inspection remains unavailable; these are geometry and simulation checks, not an end-to-end browser test.


## Snowman / mailbox / larger gifts update

- Added procedural snowman and mailbox, including palette-dependent materials. Inspected isolated models and complete arrangement with an offline CPU raster preview; this excludes glass, environment and web post-processing.
- Gift scales are now 0.4125 / 0.3375 / 0.285: exactly 3× the previous version. Shared layout constants drive both the web and downloadable GLB. Nine gifts remain in the asymmetric foreground cluster.
- Updated complete GLB using glTF Transform, retaining transmission, volume, dispersion and sheen extensions. Verified one Snowman and one Christmas_Mailbox node, nine gifts and matching scales/positions.
- Khronos validation: combined scene 0 errors / 1 tangent warning; snowman and mailbox each 0 errors / 0 warnings.
- Production bundle built successfully. The browser connection was unavailable after the application update, so this revision has not been visually checked in the live browser. Previous browser checks below apply to earlier versions.
- Snowman / mailbox interactions are intentionally not implemented yet; they are discussion candidates.


## Current larger tree / asymmetric gifts version

- Removed the angel, rig, animation updates, wave control and angel download. Current combined GLB contains no angel nodes, skins or animations.
- Tree, ribbon and ornaments share a parent with uniform scale 0.75, three times the preceding miniature version. Gifts use 0.1375 / 0.1125 / 0.095, exactly one quarter of their former 0.55 / 0.45 / 0.38 scales.
- Combined GLB contains nine named gift groups arranged asymmetrically beside the tree (seven clustered, two trailing forward). Dome and base retain their previous size.
- Snow starts uniformly throughout the dome volume and respawns across its curved ceiling, rather than a narrow central cap. A 180-second simulation of the actual update loop kept all 500 particles inside the dome; 283 occupied the outer radius beyond 1.5 units.
- Browser shake control and full-scene export completed without errors.
- Browser render inspected with winter room, glass reflections, DOF, bloom, snow crystals and snowdrifts.
- Ornament add/undo changed the count from 16 to 17 and back. Snow and Classic palette changes completed. No browser error logs during these actions or GLB export.
- Downloaded the current complete scene and replaced the public GLB (8,248,964 bytes).
- Khronos glTF Validator with maxIssues 100000: **0 errors, 1 warning**. The tree material uses runtime-generated tangent space; other viewers can shade it differently.
- Production bundle builds successfully. No API key or runtime paid API is required.

Snowdrifts are static geometry; flakes do not physically accumulate. Glass/DOF/bloom are real-time raster approximations. The GLB excludes the room, environment lighting, web post-processing and snow particles. Blender and Unity imports have not been validated: Blender previously failed at Metal initialization in this environment.

## Earlier release checks

The original release was inspected at desktop and 390 × 844 layouts. Public GitHub Pages loaded the assets and served the ornament ZIP. GitHub repository visibility was verified PUBLIC. Glass visibility controls were removed in a previous update. Camera effect controls were previously checked with their defaults restored afterward.
