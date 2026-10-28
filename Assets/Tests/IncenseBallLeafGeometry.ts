import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, nextFrame} from "Leaf.lspkg/Utils/common/Utils"

export type Bounds = {min: vec3; max: vec3; points?:vec3[]}
export type Pose = {position: vec3; rotation: quat; scale: vec3}

export function check(condition: boolean, message: string): void {
  expect(condition, message).toBe(true)
}

export function object(name: string): SceneObject {
  const found = findSceneObjectByName(name)
  if (!found) throw new Error(`Required scene object not found: ${name}`)
  return found
}

export function visible(object: SceneObject): boolean {
  for (let current: SceneObject | null = object; current; current = current.getParent()) {
    if (!current.enabled) return false
  }
  return true
}

export function walk(root: SceneObject, visit: (object: SceneObject) => void): void {
  visit(root)
  for (let i = 0; i < root.getChildrenCount(); i++) walk(root.getChild(i), visit)
}

/** Read vertices: engine world AABBs inflate a rotated sphere's bounding cube. */
export function bounds(root: SceneObject): Bounds {
  let min = new vec3(1e20, 1e20, 1e20)
  let max = new vec3(-1e20, -1e20, -1e20)
  let count = 0
  const points:vec3[]=[]
  const include=(point:vec3)=>{min=vec3.min(min,point);max=vec3.max(max,point);points.push(point);count++}
  walk(root, (object) => {
    if (!visible(object)) return
    const transform=object.getTransform().getWorldTransform()
    const meshes=object.getComponents("Component.RenderMeshVisual") as RenderMeshVisual[]
    for(const visual of meshes) {
      if (!visual.enabled) continue
      const positions=visual.mesh.getVertexDataForAttribute("position")
      for(let i=0;i<positions.length;i+=3) include(transform.multiplyPoint(new vec3(positions[i],positions[i+1],positions[i+2])))
    }
    const texts=object.getComponents("Component.Text") as Text[]
    for(const text of texts) {
      if(!text.enabled || !text.text.length)continue
      const rect=text.getBoundingBox()
      for(const x of [rect.left,rect.right])for(const y of [rect.bottom,rect.top])include(transform.multiplyPoint(new vec3(x,y,0)))
    }
    if(!meshes.length && !texts.length) {
      for(const visual of object.getComponents("Component.BaseMeshVisual") as BaseMeshVisual[]) {
        if(!visual.enabled)continue
        include(visual.worldAabbMin());include(visual.worldAabbMax())
      }
    }
  })
  check(count > 0, `No enabled rendered bounds for ${root.name}`)
  return {min, max, points}
}

export function union(items: Bounds[]): Bounds {
  check(items.length > 0, "Cannot measure an empty bounds set")
  return items.reduce((a, b) => ({min: vec3.min(a.min, b.min), max: vec3.max(a.max, b.max), points:[...(a.points||[]),...(b.points||[])]}))
}

export function size(box: Bounds): vec3 { return box.max.sub(box.min) }

export function assertInView(camera: Camera, box: Bounds, label: string): void {
  const transform = camera.getTransform()
  const forward = transform.getWorldRotation().multiplyVec3(new vec3(0, 0, -1))
  const corners:vec3[]=[]
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])corners.push(new vec3(x,y,z))
  for(const point of box.points && box.points.length ? box.points : corners) {
        check(point.sub(transform.getWorldPosition()).dot(forward) > 0, `${label} is behind the viewer`)
        const screen = camera.worldSpaceToScreenSpace(point)
        check(screen.x >= 0 && screen.x <= 1 && screen.y >= 0 && screen.y <= 1,
          `${label} exceeds view: (${screen.x.toFixed(3)}, ${screen.y.toFixed(3)})`)
  }
}

export function tiltDegrees(object: SceneObject): number {
  const up = object.getTransform().getWorldRotation().multiplyVec3(vec3.up()).normalize()
  return Math.acos(Math.max(-1, Math.min(1, up.dot(vec3.up())))) * 180 / Math.PI
}

export function pose(object: SceneObject): Pose {
  const t = object.getTransform()
  return {position: t.getWorldPosition(), rotation: t.getWorldRotation(), scale: t.getWorldScale()}
}

export function rotationError(a: quat, b: quat): number {
  const d = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w)
  return 2 * Math.acos(Math.max(0, Math.min(1, d))) * 180 / Math.PI
}

export function assertPose(object: SceneObject, before: Pose): void {
  const after = pose(object)
  check(after.position.distance(before.position) < 0.05, `${object.name} did not restore its position`)
  check(rotationError(after.rotation, before.rotation) < 0.1, `${object.name} did not restore its rotation`)
  check(after.scale.distance(before.scale) < 0.001, `${object.name} did not restore its scale`)
}

export async function until(condition: () => boolean, timeoutMs: number, message: string): Promise<void> {
  const start = getTime()
  while (!condition()) {
    if ((getTime() - start) * 1000 > timeoutMs) throw new Error(message)
    await nextFrame()
  }
}

export function evidence(id: string, values: object): void {
  print(`[INCENSE LEAF EVIDENCE] ${id} ${JSON.stringify(serializable(values))}`)
}

function serializable(value:any):any {
  if(value===null || typeof value!=="object")return value
  if(Array.isArray(value))return value.map(serializable)
  if(typeof value.x==="number" && typeof value.y==="number") {
    const result:any={x:value.x,y:value.y}
    if(typeof value.z==="number")result.z=value.z
    if(typeof value.w==="number")result.w=value.w
    return result
  }
  const result:any={}
  for(const key of Object.keys(value))result[key]=serializable(value[key])
  return result
}
