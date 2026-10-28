import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign,FlexAlignSelf,FlexDirection,FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {CARD_COPY,PART_NAMES,DISPLAY_POSITIONS} from "./IncenseBallSceneContracts";

const TYPE_SCALE={Title:{size:54,weight:700},Body:{size:39,weight:500},Button:{size:48,weight:500},Caption:{size:38,weight:500}};
function applyTextRole(t:Text,role:keyof typeof TYPE_SCALE,scale=1){t.size=TYPE_SCALE[role].size*scale;(t as Text & {weight?:number}).weight=TYPE_SCALE[role].weight;}

@component
export class IncenseBallExhibitUI extends BaseScriptComponent {
  @input @hint("World-space front-edge button anchor") buttonAnchor:SceneObject;
  @input @hint("World-space title anchor") titleAnchor:SceneObject;
  @input @hint("World-space rolling-hint anchor") hintAnchor:SceneObject;
  @input @hint("World-space inspection card anchor") cardAnchor:SceneObject;
  @input @hint("World-space two-tier name-tag anchor") tagsAnchor:SceneObject;
  @input @hint("Button width in centimeters") buttonWidth:number=25;
  @input @hint("Button target height in centimeters") buttonHeight:number=8;
  @input @hint("Title shown before the first interaction") titleCopy:string="Tang-dynasty silver incense ball";
  @input @hint("Text scale for all exhibit labels") textScale:number=1.2;
  public onAction=new Event<void>();
  public ready=false;
  public button:Button;
  private buttonText:Text;
  private titleText:Text;
  private cardTitle:Text;
  private cardBody:Text;
  private tags:SceneObject[]=[];
  private cardVisible=false;
  private buttonLabel="Take apart";

  onAwake(){this.createEvent("OnStartEvent").bind(()=>this.build());}
  private build(){
    this.sceneObject.createComponent("Component.Canvas");
    this.button=this.buttonAnchor.createComponent(Button.getTypeName()) as Button;
    this.button.size=new vec3(this.buttonWidth,this.buttonHeight,1);
    this.button.onInitialized.add(()=>{this.button.size=new vec3(this.buttonWidth,this.buttonHeight,1);});
    this.button.onTriggerUp.add(()=>this.onAction.invoke());
    const buttonLayout=this.stack(this.buttonAnchor,this.buttonWidth,3,0.7);
    this.buttonText=this.row(buttonLayout,"Incense Main Button Label",this.buttonLabel,"Button",3);
    this.titleText=this.row(this.stack(this.titleAnchor,48,3,0),"Incense Title",this.titleCopy,"Title",3);
    this.row(this.stack(this.hintAnchor,27,3,0),"Incense Roll Hint","Pinch and drag to roll","Body",3);
    const plate=this.cardAnchor.createComponent(BackPlate.getTypeName()) as BackPlate;
    plate.size=new vec2(22,9);
    const cardLayout=this.stack(this.cardAnchor,20,7.5,0.7);
    this.cardTitle=this.row(cardLayout,"Incense Card Title","","Title",1.8);
    this.cardBody=this.row(cardLayout,"Incense Card Copy","","Body",4.7);
    this.cardBody.horizontalOverflow=HorizontalOverflow.Wrap;
    for(let i=0;i<5;i++){
      const tag=this.obj(this.tagsAnchor,PART_NAMES[i]+" Tag");
      const p=DISPLAY_POSITIONS[i];tag.getTransform().setLocalPosition(new vec3(p.x,i<2?p.y-9:p.y-6,5));
      const width=i<2?15:14;
      this.row(this.stack(tag,width,2,0),PART_NAMES[i]+" Name",PART_NAMES[i],"Caption",2);
      this.tags.push(tag);
    }
    this.cardAnchor.enabled=false;this.tagsAnchor.enabled=false;this.hintAnchor.enabled=false;
    this.ready=true;
  }
  setAssemblyState(exploded:boolean,busy:boolean){
    if(!this.ready)return;
    this.buttonLabel=exploded?"Put together":"Take apart";
    this.buttonText.text=this.buttonLabel;
    this.button.inactive=busy;
    this.button.opacity=busy?0.45:1;
  }
  setTagsVisible(value:boolean){if(this.ready)this.tagsAnchor.enabled=value;}
  setHintVisible(value:boolean){if(this.ready)this.hintAnchor.enabled=value;}
  setTitleOpacity(alpha:number){if(this.titleText){this.titleText.textFill.color=new vec4(0.96,0.98,1,alpha);this.titleAnchor.enabled=alpha>0.001;}}
  showCard(index:number){if(!this.ready)return;this.cardTitle.text=PART_NAMES[index];this.cardBody.text=CARD_COPY[index];this.cardAnchor.enabled=true;this.cardVisible=true;}
  hideCard(){if(this.ready)this.cardAnchor.enabled=false;this.cardVisible=false;}
  getSnapshot(){return {ready:this.ready,buttonLabel:this.buttonLabel,cardVisible:this.cardVisible,tagsVisible:this.tagsAnchor.enabled,hintVisible:this.hintAnchor.enabled};}
  private obj(parent:SceneObject,name:string){const o=global.scene.createSceneObject(name);o.setParent(parent);return o;}
  private stack(parent:SceneObject,w:number,h:number,z:number){
    const o=this.obj(parent,"Content");o.getTransform().setLocalPosition(new vec3(0,0,z));
    const f=o.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    f.autoDiscoverItemsOnStart=false;
    f.width=w;f.height=h;f.direction=FlexDirection.Column;f.alignItems=FlexAlign.Stretch;f.justifyContent=FlexJustify.Center;f.rowGap=0.35;
    return o;
  }
  private row(parent:SceneObject,name:string,copy:string,role:keyof typeof TYPE_SCALE,height:number){
    const o=this.obj(parent,name),t=o.createComponent("Component.Text") as Text;
    t.text=copy;t.depthTest=true;applyTextRole(t,role,this.textScale);
    t.textFill.color=new vec4(0.96,0.98,1,1);t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
    t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;
    t.layoutRect=Rect.create(-0.5,0.5,-0.5,0.5);
    const item=o.createComponent(FlexItem.getTypeName()) as FlexItem;item.alignSelf=FlexAlignSelf.Stretch;item.overrideHeight=height;item.flexShrink=0;
    (parent.getComponent(FlexLayout.getTypeName()) as FlexLayout).addItems([item]);return t;
  }
}
