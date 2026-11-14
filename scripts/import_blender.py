"""Open this file in Blender Text Editor, then Run Script. Adds a collection without clearing the scene."""
import bpy
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
model = PROJECT / 'docs/assets/snowglobe.glb'
if not model.exists():
    raise FileNotFoundError(model)
collection = bpy.data.collections.new('Winter Atelier imported')
bpy.context.scene.collection.children.link(collection)
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(model))
for obj in set(bpy.data.objects) - before:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)
print('Imported Winter Atelier. Save your .blend from File > Save As.')
