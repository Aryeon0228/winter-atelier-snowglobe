import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {DepthOfFieldPass} from './depth-of-field.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createCameraEffects(renderer,scene,camera,getTransparentObjects){
  const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
  const composer=new EffectComposer(renderer,target);composer.addPass(new RenderPass(scene,camera));
  const dof=new DepthOfFieldPass(scene,camera,getTransparentObjects);
  composer.addPass(dof);
  const bloom=new UnrealBloomPass(new T.Vector2(1,1),.68,.65,1.05);composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish=new ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0},amount:{value:1},resolution:{value:new T.Vector2(1,1)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`
    uniform sampler2D tDiffuse;uniform float time;uniform float amount;uniform vec2 resolution;varying vec2 vUv;
    void main(){vec2 q=vUv-.5;float edge=dot(q,q);vec2 fringe=q*edge*.002*amount;vec3 c=texture2D(tDiffuse,vUv).rgb;
      c.r=mix(c.r,texture2D(tDiffuse,vUv+fringe).r,.55*amount);c.b=mix(c.b,texture2D(tDiffuse,vUv-fringe).b,.55*amount);
      c=mix(c,(c-.5)*1.035+.5,amount);c*=1.0-amount*.38*smoothstep(.08,.48,edge);
      float grain=fract(sin(dot(floor(vUv*resolution)+mod(time,64.0),vec2(12.9898,78.233)))*43758.5453)-.5;
      c+=grain*.006*amount;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}`});composer.addPass(finish);
  const viewPoint=new T.Vector3();
  return {composer,dof,bloom,
    resize(w,h){composer.setSize(w,h);finish.uniforms.resolution.value.set(w*renderer.getPixelRatio(),h*renderer.getPixelRatio());},
    enable(value){dof.enabled=value;bloom.enabled=value;finish.uniforms.amount.value=value?1:0;},
    render(time=0){camera.updateMatrixWorld();viewPoint.set(0,2.1,.25).applyMatrix4(camera.matrixWorldInverse);dof.uniforms.focus.value=-viewPoint.z;finish.uniforms.time.value=time;composer.render();}
  };
}
