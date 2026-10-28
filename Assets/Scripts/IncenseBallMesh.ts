// Code-authored articulated MeshBuilder asset: smooth tubes, lathed bowl,
// and an openwork spherical lattice. All dimensions are centimeters.
export class IncenseBallMesh {
  private vertices: number[] = [];
  private indices: number[] = [];
  private vertex(p: vec3, n: vec3): number {
    const i=this.vertices.length/10;
    this.vertices.push(p.x,p.y,p.z,n.x,n.y,n.z,1,1,1,1); return i;
  }
  tube(points: vec3[], radius: number, sides=8): this {
    const start=this.vertices.length/10;
    for(let i=0;i<points.length;i++) {
      const t=points[Math.min(i+1,points.length-1)].sub(points[Math.max(0,i-1)]).normalize();
      const ref=Math.abs(t.y)<0.9?vec3.up():vec3.right();
      const a=t.cross(ref).normalize(), b=t.cross(a).normalize();
      for(let j=0;j<=sides;j++) {
        const u=j/sides*Math.PI*2,n=a.uniformScale(Math.cos(u)).add(b.uniformScale(Math.sin(u)));
        this.vertex(points[i].add(n.uniformScale(radius)),n);
      }
    }
    for(let i=0;i<points.length-1;i++)for(let j=0;j<sides;j++) {
      const a=start+i*(sides+1)+j,b=a+sides+1;
      this.indices.push(a,a+1,b,a+1,b+1,b);
    }
    return this;
  }
  circle(radius:number,y=0,tubeRadius=0.35,segments=64):this {
    const p:vec3[]=[];
    for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;p.push(new vec3(Math.cos(a)*radius,y,Math.sin(a)*radius));}
    return this.tube(p,tubeRadius);
  }
  lathe(profile:number[][],segments=64):this {
    const start=this.vertices.length/10,P=profile.length;
    for(let i=0;i<=segments;i++)for(let j=0;j<P;j++){
      const th=i/segments*Math.PI*2,prev=profile[Math.max(0,j-1)],next=profile[Math.min(P-1,j+1)];
      const n=new vec3(next[1]-prev[1],prev[0]-next[0],0).normalize();
      this.vertex(new vec3(profile[j][0]*Math.cos(th),profile[j][1],profile[j][0]*Math.sin(th)),new vec3(n.x*Math.cos(th),n.y,n.x*Math.sin(th)));
    }
    for(let i=0;i<segments;i++)for(let j=0;j<P-1;j++){
      const a=start+i*P+j,b=a+P;this.indices.push(a,a+1,b+1,a,b+1,b);
    }
    return this;
  }
  box(size:vec3,center:vec3=vec3.zero()):this {
    const h=size.uniformScale(0.5);
    const faces=[[[1,0,0],[h.x,-h.y,-h.z],[h.x,h.y,-h.z],[h.x,h.y,h.z],[h.x,-h.y,h.z]],
      [[-1,0,0],[-h.x,-h.y,h.z],[-h.x,h.y,h.z],[-h.x,h.y,-h.z],[-h.x,-h.y,-h.z]],
      [[0,1,0],[-h.x,h.y,-h.z],[-h.x,h.y,h.z],[h.x,h.y,h.z],[h.x,h.y,-h.z]],
      [[0,-1,0],[-h.x,-h.y,h.z],[-h.x,-h.y,-h.z],[h.x,-h.y,-h.z],[h.x,-h.y,h.z]],
      [[0,0,1],[-h.x,-h.y,h.z],[h.x,-h.y,h.z],[h.x,h.y,h.z],[-h.x,h.y,h.z]],
      [[0,0,-1],[h.x,-h.y,-h.z],[-h.x,-h.y,-h.z],[-h.x,h.y,-h.z],[h.x,h.y,-h.z]]];
    for(const f of faces){const n=new vec3(f[0][0],f[0][1],f[0][2]),s=this.vertices.length/10;
      for(let j=1;j<=4;j++)this.vertex(new vec3(f[j][0],f[j][1],f[j][2]).add(center),n);
      this.indices.push(s,s+1,s+2,s,s+2,s+3);}
    return this;
  }
  build(parent:SceneObject,name:string,mat:Material):RenderMeshVisual {
    const so=global.scene.createSceneObject(name);so.setParent(parent);
    const b=new MeshBuilder([{name:"position",components:3},{name:"normal",components:3,normalized:true},{name:"color",components:4}]);
    b.topology=MeshTopology.Triangles;b.indexType=MeshIndexType.UInt16;
    b.appendVerticesInterleaved(this.vertices);b.appendIndices(this.indices);b.updateMesh();
    const r=so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;r.mesh=b.getMesh();r.mainMaterial=mat;return r;
  }
  static shell(sign:number,detail:boolean):IncenseBallMesh {
    const m=new IncenseBallMesh();m.circle(14.65,0,0.35);
    // Dense silver bands enclose genuine openwork gaps, not an opaque sphere.
    for(let k=1;k<=5;k++){
      const t=k/6*Math.PI/2;m.circle(Math.cos(t)*14.65,sign*Math.sin(t)*14.65,0.34);
    }
    for(let k=0;k<24;k++) {
      const phi=k/24*Math.PI*2,p:vec3[]=[];
      for(let j=0;j<=24;j++){const t=j/24*Math.PI/2;p.push(new vec3(14.65*Math.cos(t)*Math.cos(phi),sign*14.65*Math.sin(t),14.65*Math.cos(t)*Math.sin(phi)));}
      m.tube(p,0.31);
    }
    if(detail)for(let row=0;row<4;row++)for(let col=0;col<12;col++){
      const p:vec3[]=[];for(let j=0;j<=24;j++){
        const a=j/24*Math.PI*2,t=(row+0.5)/6*Math.PI/2+Math.sin(a)*0.105,phi=(col+0.5)/12*Math.PI*2+Math.cos(a)*0.17;
        p.push(new vec3(14.66*Math.cos(t)*Math.cos(phi),sign*14.66*Math.sin(t),14.66*Math.cos(t)*Math.sin(phi)));}
      m.tube(p,0.14,6);
    }
    return m;
  }
  static ring(radius:number):IncenseBallMesh {
    return new IncenseBallMesh().lathe([[radius-0.6,-0.45],[radius+0.6,-0.45],[radius+0.6,0.45],[radius-0.6,0.45],[radius-0.6,-0.45]]);
  }
  static cup():IncenseBallMesh {
    return new IncenseBallMesh().lathe([[0,-5.4],[2,-5.4],[3.6,-4.8],[5.1,-2.9],[5.5,-0.3],[5.5,0],[5,0.25],[4.85,-0.2],[4.6,-2.6],[3.2,-4.1],[1.5,-4.8],[0,-4.8]]).circle(5.25,0,0.25);
  }
}
