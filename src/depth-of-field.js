import * as T from 'three';
import {Pass,FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

// Depth-aware separable lens blur: keep the whole glass object in focus.
export class DepthOfFieldPass extends Pass {
  constructor(scene,camera,getExcluded){
    super();this.scene=scene;this.camera=camera;this.getExcluded=getExcluded;
    this.depthTarget=new T.WebGLRenderTarget(1,1,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
    this.blurTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType});
    this.depthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,blending:T.NoBlending});
    this.uniforms={tColor:{value:null},tDepth:{value:this.depthTarget.texture},focus:{value:12},aperture:{value:.0045},maxblur:{value:.025},focusZone:{value:2.7},nearClip:{value:camera.near},farClip:{value:camera.far},direction:{value:new T.Vector2(1,0)}};
    this.material=new T.ShaderMaterial({uniforms:this.uniforms,depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`
      #include <packing>
      varying vec2 vUv;uniform sampler2D tColor;uniform sampler2D tDepth;
      uniform float focus;uniform float aperture;uniform float maxblur;uniform float focusZone;uniform float nearClip;uniform float farClip;uniform vec2 direction;
      float distanceAt(vec2 uv){return -perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D(tDepth,uv)),nearClip,farClip);}
      void main(){float d=distanceAt(vUv);float coc=min(maxblur,max(abs(d-focus)-focusZone,0.0)*aperture);vec3 sum=vec3(0.0);float weightSum=0.0;
        for(int i=-12;i<=12;i++){float t=float(i)/12.0;vec2 uv=clamp(vUv+direction*coc*t,vec2(.001),vec2(.999));float sd=distanceAt(uv);float w=exp(-t*t*3.0);
          if(d>focus+focusZone && sd<focus+focusZone)w*=.01;
          sum+=texture2D(tColor,uv).rgb*w;weightSum+=w;
        }gl_FragColor=vec4(sum/max(weightSum,.001),1.0);
      }`});this.quad=new FullScreenQuad(this.material);this.aspect=1;
  }
  render(renderer,writeBuffer,readBuffer){
    const oldColor=new T.Color();renderer.getClearColor(oldColor);const oldAlpha=renderer.getClearAlpha(),oldOverride=this.scene.overrideMaterial;
    const hidden=this.getExcluded().filter(Boolean),visible=hidden.map(o=>o.visible);hidden.forEach(o=>o.visible=false);
    try{this.scene.overrideMaterial=this.depthMaterial;renderer.setRenderTarget(this.depthTarget);renderer.setClearColor(0xffffff,1);renderer.clear();renderer.render(this.scene,this.camera);}
    finally{this.scene.overrideMaterial=oldOverride;hidden.forEach((o,i)=>o.visible=visible[i]);renderer.setClearColor(oldColor,oldAlpha);}
    this.uniforms.nearClip.value=this.camera.near;this.uniforms.farClip.value=this.camera.far;
    this.uniforms.tColor.value=readBuffer.texture;this.uniforms.direction.value.set(1,0);renderer.setRenderTarget(this.blurTarget);this.quad.render(renderer);
    this.uniforms.tColor.value=this.blurTarget.texture;this.uniforms.direction.value.set(0,this.aspect);renderer.setRenderTarget(this.renderToScreen?null:writeBuffer);this.quad.render(renderer);
  }
  setSize(w,h){this.aspect=w/h;this.depthTarget.setSize(w,h);this.blurTarget.setSize(w,h);}
  dispose(){this.depthTarget.dispose();this.blurTarget.dispose();this.depthMaterial.dispose();this.material.dispose();this.quad.dispose();}
}
