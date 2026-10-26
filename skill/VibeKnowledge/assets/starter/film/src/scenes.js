// Author knowledge-specific geometry here. Return true when a custom scene is drawn.
// ctx already has scene opacity; multiply it in child effects rather than overwrite it.
function customScene(ctx,time,scene,config){return false;}

function drawScene(ctx,time,scene,config){
 if(customScene(ctx,time,scene,config))return;
 if(scene.mode==='population'||scene.mode==='focus')population(ctx,time,scene);
 else throw new Error('Implement this knowledge scene: '+scene.id);
}
