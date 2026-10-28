import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {IncenseBallExhibitUI} from "./IncenseBallExhibitUI";
import {IncenseBallMesh as Mesh} from "./IncenseBallMesh";
import {PART_NAMES,DISPLAY_POSITIONS,DISPLAY_ROTATIONS} from "./IncenseBallSceneContracts";

type Pose={position:vec3,rotation:quat,scale:number};
type Part={root:SceneObject,visual:SceneObject,material:Material,pins:Material,collider:ColliderComponent,interaction:Interactable,hover:boolean};
type Phase="assembled"|"disassembling"|"exploded"|"assembling";
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{x=clamp(x,0,1);return x*x*(3-2*x);};

@component
export class IncenseBallMain extends BaseScriptComponent {
  @input @hint("Passive UIKit exhibit view") ui:IncenseBallExhibitUI;
  @input @hint("Unit-scale collider for the assembled ball") ball:SceneObject;
  @input @hint("Silver shell half 1 target root") shell1:SceneObject;
  @input @hint("Silver shell half 2 target root") shell2:SceneObject;
  @input @hint("Outer gimbal ring target root") outerRing:SceneObject;
  @input @hint("Inner gimbal ring target root") innerRing:SceneObject;
  @input @hint("Incense cup target root") cup:SceneObject;
  @input @hint("World-vertical smoke root") smoke:SceneObject;
  @input @hint("Stand top is 15 cm below the assembled ball center") stand:SceneObject;
  @input @hint("Silver PBR material template") silver:Material;
  @input @hint("Emissive material template") glow:Material;
  @input @hint("Stone plinth material template") stone:Material;
  @input @hint("Soft mechanical pivot sound") pivotClick:AudioTrackAsset;
  @input @hint("Soft inspection sound") selectClick:AudioTrackAsset;
  @input @hint("Duration of the five-part disassembly") transitionSeconds:number=2.5;
  @input @hint("Seconds to retain the cutaway after releasing") releaseHoldSeconds:number=2;
  @input @hint("Seconds until the untouched assembled ball displays its hint") hintDelaySeconds:number=5;
  @input @hint("Shell rotation per centimeter of hand drag") rollRadiansPerCm:number=0.1333333;
  @input @hint("Add the fine openwork petal bands") ornamentalDetail:boolean=true;

  private parts:Part[]=[];
  private phase:Phase="assembled";
  private rolling=false;
  private selected=-1;
  private pendingSelection=-1;
  private selectionTime=0;
  private selectionReturning=false;
  private selectionStart:Pose;
  private inspectionAngle=0;
  private time=0;
  private lastTouch=0;
  private firstTouch=-1;
  private releaseTime=-100;
  private transitionStart=0;
  private returnThenAssemble=false;
  private center=vec3.zero();
  private shellRotation=quat.angleAxis(0.61,vec3.up());
  private saved:Pose[]=[];
  private startPoses:Pose[]=[];
  private ballInteraction:Interactable;
  private ballCollider:ColliderComponent;
  private audio:AudioComponent;
  private smokeMaterial:Material;
  private smokeFlow:{object:SceneObject,material:Material}[]=[];
  private ember:SceneObject;
  private clickStage=-1;
  public ready=false;

  onAwake(){
    this.createEvent("OnStartEvent").bind(()=>this.start());
    this.createEvent("UpdateEvent").bind(()=>this.update());
  }
  private start(){
    if(!this.ui||!this.ball||!this.silver||!this.glow||!this.stone){console.error("IncenseBall: required scene references missing");return;}
    const roots=[this.shell1,this.shell2,this.outerRing,this.innerRing,this.cup];
    roots.forEach((root,i)=>{
      const visual=root.getChild(0),mat=this.silver.clone(),pins=this.glow.clone();
      mat.mainPass.baseColor=new vec4(0.82,0.87,0.93,1);mat.mainPass.metallic=0.82;mat.mainPass.roughness=0.24;
      mat.mainPass.twoSided=true;
      pins.mainPass.baseColor=new vec4(0.32,0.78,1,1);
      const collider=root.createComponent("Physics.ColliderComponent") as ColliderComponent;
      const shape=Shape.createBoxShape();shape.size=new vec3(i<2?15:i===2?13:i===3?11:8,i<2?15:i===4?8:11,9);collider.shape=shape;
      const interaction=root.createComponent(Interactable.getTypeName()) as Interactable;
      interaction.targetingMode=3;
      const part:Part={root,visual,material:mat,pins,collider,interaction,hover:false};
      interaction.onHoverEnter.add(()=>{part.hover=true;});interaction.onHoverExit.add(()=>{part.hover=false;});
      interaction.onTriggerEnd.add(()=>this.selectPart(i));
      this.parts.push(part);this.buildPart(i,part);
    });
    const ballShape=Shape.createSphereShape();ballShape.radius=15;
    this.ballCollider=this.ball.createComponent("Physics.ColliderComponent") as ColliderComponent;this.ballCollider.shape=ballShape;
    this.ballInteraction=this.ball.createComponent(Interactable.getTypeName()) as Interactable;
    this.ballInteraction.enableInstantDrag=true;this.ballInteraction.keepHoverOnTrigger=true;this.ballInteraction.targetingMode=3;
    this.ballInteraction.onTriggerStart.add(()=>{if(this.phase==="assembled"){this.rolling=true;this.touch();}});
    this.ballInteraction.onDragUpdate.add(e=>this.roll(e.dragVector));
    this.ballInteraction.onTriggerEnd.add(()=>this.release());
    this.ballInteraction.onTriggerCanceled.add(()=>this.release());
    this.ui.onAction.add(()=>this.action());
    this.audio=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;
    this.audio.playbackMode=Audio.PlaybackMode.LowLatency;this.audio.volume=0.22;
    this.buildStand();this.buildSmoke();this.levelMechanism();this.setTargets();this.ready=true;
    console.log("IncenseBall ready: 30 cm ball, five articulated parts, UIKit action");
  }
  private buildPart(i:number,p:Part){
    if(i<2){Mesh.shell(i===0?1:-1,this.ornamentalDetail).build(p.visual,PART_NAMES[i]+" Silver",p.material);
      // A matched pair of shell bearing holes on the first (X) axis.
      for(const sign of [-1,1]){
        const ring=new Mesh(),points:vec3[]=[];
        for(let j=0;j<=24;j++){const a=j/24*Math.PI*2;points.push(new vec3(sign*14.3,Math.cos(a)*0.8,Math.sin(a)*0.8));}
        ring.tube(points,0.16).build(p.visual,"Shell X bearing "+sign,p.pins);
      }
    }else if(i<4){
      const radius=i===2?11.6:8.8;Mesh.ring(radius).build(p.visual,PART_NAMES[i]+" Silver",p.material);
      const pins=new Mesh();
      for(const s of [-1,1]){
        if(i===2)pins.tube([new vec3(s*11,0,0),new vec3(s*14.25,0,0)],0.32);
        else pins.tube([new vec3(0,0,s*8.3),new vec3(0,0,s*11.5)],0.32);
      }
      pins.build(p.visual,i===2?"Outer X pivot pins":"Inner Z pivot pins",p.pins);
      if(i===2){
        const sockets=new Mesh();for(const s of [-1,1]){
          const pts:vec3[]=[];for(let j=0;j<=24;j++){const a=j/24*Math.PI*2;pts.push(new vec3(Math.cos(a)*0.65,Math.sin(a)*0.65,s*11.55));}sockets.tube(pts,0.18);}
        sockets.build(p.visual,"Outer Z bearing holes",p.pins);
      }
    }else{
      Mesh.cup().build(p.visual,"Incense cup Silver",p.material);
      new Mesh().tube([new vec3(-8.8,0,0),new vec3(-5.4,0,0)],0.3).tube([new vec3(5.4,0,0),new vec3(8.8,0,0)],0.3).build(p.visual,"Cup supports",p.pins);
      const mat=this.glow.clone();mat.mainPass.baseColor=new vec4(1,0.28,0.035,1);
      this.ember=new Mesh().lathe([[0,-2.2],[0.8,-2],[1.45,-1.4],[1.2,-0.8],[0,-0.5]],24).build(p.visual,"Incense Ember",mat).getSceneObject();
    }
  }
  private buildStand(){
    const mat=this.stone.clone();mat.mainPass.baseColor=new vec4(0.48,0.60,0.68,1);mat.mainPass.metallic=0.05;mat.mainPass.roughness=0.75;
    new Mesh().box(new vec3(54,2,42)).box(new vec3(38,34,28),new vec3(0,-18,0)).box(new vec3(46,2,34),new vec3(0,-36,0)).build(this.stand,"Museum plinth",mat);
    const trim=this.silver.clone();trim.mainPass.baseColor=new vec4(0.8,0.86,0.9,1);trim.mainPass.metallic=0.8;trim.mainPass.roughness=0.28;
    new Mesh().box(new vec3(54,0.3,0.5),new vec3(0,-0.5,21)).build(this.stand,"Plinth silver edge",trim);
  }
  private buildSmoke(){
    this.smokeMaterial=this.glow.clone();this.smokeMaterial.mainPass.baseColor=new vec4(0.83,0.91,1,0.34);
    this.smokeMaterial.mainPass.blendMode=BlendMode.Normal;this.smokeMaterial.mainPass.depthWrite=false;
    const pts:vec3[]=[];for(let i=0;i<=40;i++){const h=i*0.5;pts.push(new vec3(Math.sin(h*0.5)*0.35,h,Math.cos(h*0.4)*0.25));}
    new Mesh().tube(pts,0.13,6).build(this.smoke,"Upward smoke",this.smokeMaterial);
    for(let i=0;i<3;i++){
      const m=this.glow.clone();m.mainPass.blendMode=BlendMode.Normal;m.mainPass.depthWrite=false;
      const points:vec3[]=[];for(let k=0;k<=10;k++)points.push(new vec3(Math.sin(k*0.35)*0.3,k*0.18,Math.cos(k*0.35)*0.2));
      const object=new Mesh().tube(points,0.17,6).build(this.smoke,"Rising smoke wisp "+(i+1),m).getSceneObject();
      this.smokeFlow.push({object,material:m});
    }
  }
  private touch(){this.lastTouch=this.time;if(this.firstTouch<0)this.firstTouch=this.time;this.ui.setHintVisible(false);}
  private release(){if(this.rolling){this.rolling=false;this.releaseTime=this.time;this.lastTouch=this.time;}}
  private roll(delta:vec3){
    if(!this.rolling||this.phase!=="assembled")return;
    const dx=clamp(delta.x,-8,8),dz=clamp(Math.abs(delta.z)>0.05?delta.z:-delta.y,-8,8);
    const len=Math.sqrt(dx*dx+dz*dz);if(len<0.0001)return;
    this.shellRotation=quat.angleAxis(len*this.rollRadiansPerCm,new vec3(dz,0,-dx).normalize()).multiply(this.shellRotation);
    this.center=new vec3(clamp(this.center.x+dx*0.32,-11,11),0,clamp(this.center.z+dz*0.32,-5,5));
    this.lastTouch=this.time;this.levelMechanism();
  }
  private levelMechanism(){
    const localUp=this.shellRotation.invert().multiplyVec3(vec3.up());
    const outerAngle=Math.atan2(localUp.z,localUp.y),innerAngle=-Math.asin(clamp(localUp.x,-1,1));
    const outer=this.shellRotation.multiply(quat.angleAxis(outerAngle,vec3.right()));
    const inner=outer.multiply(quat.angleAxis(innerAngle,vec3.forward()));
    [this.shellRotation,this.shellRotation,outer,inner,inner].forEach((q,i)=>this.pose(i,{position:this.center,rotation:q,scale:1}));
    this.ball.getTransform().setLocalPosition(this.center);
  }
  private pose(i:number,p:Pose){const part=this.parts[i];part.root.getTransform().setLocalPosition(p.position);part.visual.getTransform().setLocalRotation(p.rotation);part.visual.getTransform().setLocalScale(vec3.one().uniformScale(p.scale));}
  private readPose(i:number):Pose {const p=this.parts[i];return {position:p.root.getTransform().getLocalPosition(),rotation:p.visual.getTransform().getLocalRotation(),scale:p.visual.getTransform().getLocalScale().x};}
  private mix(a:Pose,b:Pose,t:number):Pose{return {position:vec3.lerp(a.position,b.position,t),rotation:quat.slerp(a.rotation,b.rotation,t),scale:a.scale+(b.scale-a.scale)*t};}
  private displayPose(i:number):Pose{return {position:DISPLAY_POSITIONS[i],rotation:DISPLAY_ROTATIONS[i],scale:0.5};}
  private action(){
    if(!this.ready||this.phase==="assembling"||this.phase==="disassembling")return;
    this.touch();this.release();
    if(this.phase==="assembled"){
      this.saved=this.parts.map((_,i)=>this.readPose(i));this.startPoses=this.saved;
      this.phase="disassembling";this.transitionStart=this.time;this.clickStage=-1;this.ui.setAssemblyState(false,true);this.setTargets();
    }else if(this.selected>=0){this.returnThenAssemble=true;this.beginReturn(-1);this.ui.setAssemblyState(true,true);}
    else this.beginAssembly();
  }
  private beginAssembly(){this.phase="assembling";this.transitionStart=this.time;this.startPoses=this.parts.map((_,i)=>this.readPose(i));this.ui.hideCard();this.ui.setTagsVisible(false);this.ui.setAssemblyState(true,true);this.clickStage=-1;this.setTargets();}
  private selectPart(i:number){
    if(this.phase!=="exploded"||this.selectionTime>0)return;
    this.touch();this.sound(this.selectClick);
    if(this.selected>=0)this.beginReturn(this.selected===i?-1:i);
    else this.beginInspect(i);
  }
  private beginInspect(i:number){this.selected=i;this.pendingSelection=-1;this.selectionReturning=false;this.selectionStart=this.readPose(i);this.selectionTime=0.001;this.inspectionAngle=0;this.ui.showCard(i);}
  private beginReturn(next:number){this.pendingSelection=next;this.selectionReturning=true;this.selectionStart=this.readPose(this.selected);this.selectionTime=0.001;this.ui.hideCard();}
  private inspectionPose(i:number):Pose{
    // Front-and-center inspection station: 20 cm closer than the display.
    return {position:new vec3(-3,8,20),rotation:quat.angleAxis(this.inspectionAngle,vec3.up()).multiply(DISPLAY_ROTATIONS[i]),scale:1};
  }
  private setTargets(){
    const assembled=this.phase==="assembled";this.ballCollider.enabled=assembled;this.ballInteraction.enabled=assembled;
    this.parts.forEach(p=>{p.collider.enabled=this.phase==="exploded";p.interaction.enabled=this.phase==="exploded";});
  }
  private sound(track:AudioTrackAsset){if(track&&this.audio){this.audio.audioTrack=track;this.audio.play(1);}}
  private update(){
    if(!this.ready)return;const dt=getDeltaTime();this.time+=dt;
    this.ui.setTitleOpacity(this.firstTouch<0?1:1-smooth((this.time-this.firstTouch)/0.6));
    this.ui.setHintVisible(this.phase==="assembled"&&!this.rolling&&this.time-this.lastTouch>=this.hintDelaySeconds);
    if(this.phase==="disassembling"||this.phase==="assembling"){
      const elapsed=this.time-this.transitionStart,reverse=this.phase==="assembling";
      const delays=reverse?[1.3,1.3,0.9,0.45,0]:[0,0,0.5,0.95,1.4];
      this.parts.forEach((_,i)=>{
        const duration=this.transitionSeconds-delays[i],t=smooth((elapsed-delays[i])/duration);
        const goal=reverse?this.saved[i]:this.displayPose(i);let pose=this.mix(this.startPoses[i],goal,t);
        // Egress follows each visible pivot axis before settling into its tier.
        if(!reverse&&i>=2){const axis=this.saved[i].rotation.multiplyVec3(i===2?vec3.right():vec3.forward());pose.position=pose.position.add(axis.uniformScale(Math.sin(t*Math.PI)*3));}
        this.pose(i,pose);
      });
      const stage=Math.min(4,Math.floor(elapsed/0.5));if(stage>this.clickStage){this.sound(this.pivotClick);this.clickStage=stage;}
      if(elapsed>=this.transitionSeconds){
        this.phase=reverse?"assembled":"exploded";
        this.parts.forEach((_,i)=>this.pose(i,reverse?this.saved[i]:this.displayPose(i)));
        this.ui.setTagsVisible(!reverse);this.ui.setAssemblyState(!reverse,false);this.setTargets();this.lastTouch=this.time;
      }
    }
    if(this.phase==="exploded"&&this.selected>=0){
      if(this.selectionTime>0){
        this.selectionTime+=dt;const t=smooth(this.selectionTime/0.45),i=this.selected;
        this.pose(i,this.mix(this.selectionStart,this.selectionReturning?this.displayPose(i):this.inspectionPose(i),t));
        if(this.selectionTime>=0.45){this.selectionTime=0;
          if(this.selectionReturning){this.selected=-1;this.selectionReturning=false;
            if(this.returnThenAssemble){this.returnThenAssemble=false;this.beginAssembly();}
            else if(this.pendingSelection>=0)this.beginInspect(this.pendingSelection);
          }
        }
      }else{this.inspectionAngle+=dt*0.2;this.pose(this.selected,this.inspectionPose(this.selected));}
    }
    const ghost=this.phase==="assembled"?(this.rolling?0.22:0.22+0.78*smooth((this.time-this.releaseTime-this.releaseHoldSeconds)/0.45)):1;
    this.parts.forEach((p,i)=>{
      const dim=this.selected>=0&&i!==this.selected?0.38:1;
      const brightness=dim*(this.selected===i?1.22:p.hover?1.12:1);
      p.material.mainPass.baseColor=new vec4(0.82*brightness,0.87*brightness,0.93*brightness,i<2?ghost:1);
      p.material.mainPass.blendMode=i<2&&ghost<0.99?BlendMode.Normal:BlendMode.Disabled;
      p.material.mainPass.depthWrite=!(i<2&&ghost<0.99);
      const glow=this.phase==="assembled"?0.8:this.selected===i?1.5:p.hover?1.2:0.48;
      p.pins.mainPass.baseColor=new vec4(0.22*glow,0.72*glow,glow,1);
      const shape=p.collider.shape as BoxShape;const full=i===this.selected?2:1;
      shape.size=new vec3((i<2?15:i===2?14:i===3?11:8)*full,(i<2?15:i===4?8:11)*full,9*full);
    });
    // Smoke lives outside the rotating cup hierarchy, so its rise is world up.
    const cupPose=this.parts[4].visual.getTransform();
    this.smoke.getTransform().setWorldPosition(cupPose.getWorldPosition().add(vec3.up().uniformScale(0.3)));
    this.smoke.getTransform().setWorldRotation(quat.quatIdentity());
    this.smoke.getTransform().setLocalScale(vec3.one().uniformScale(this.parts[4].visual.getTransform().getLocalScale().x));
    this.smokeMaterial.mainPass.baseColor=new vec4(0.83,0.91,1,0.25+Math.sin(this.time*1.2)*0.04);
    this.smokeFlow.forEach((w,i)=>{
      const h=(this.time*3.4+i*6)%18;
      w.object.getTransform().setLocalPosition(new vec3(Math.sin(h*0.5)*0.3,h,Math.cos(h*0.4)*0.2));
      w.material.mainPass.baseColor=new vec4(0.86,0.94,1,0.55*Math.sin(h/18*Math.PI));
    });
  }
  public getSnapshot(){
    return {ready:this.ready,phase:this.phase,rolling:this.rolling,selected:this.selected,selectionBusy:this.selectionTime>0,
      center:this.center,shellRotation:this.shellRotation,shellOpacity:this.parts.length?this.parts[0].material.mainPass.baseColor.w:1,
      parts:this.parts.map((p,i)=>({name:PART_NAMES[i],position:p.root.getTransform().getWorldPosition(),rotation:p.visual.getTransform().getWorldRotation(),scale:p.visual.getTransform().getLocalScale().x,color:p.material.mainPass.baseColor})),
      ui:this.ui?this.ui.getSnapshot():null};
  }
}
