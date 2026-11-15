// Return the top hook when any nested mesh of an existing ornament is hit.
export function findOrnamentHit(object,items){
  for(let node=object;node;node=node.parent){const item=items.get(node);if(item)return {anchor:node,item};}
  return null;
}
