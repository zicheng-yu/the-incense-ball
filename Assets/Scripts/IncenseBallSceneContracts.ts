export const PART_NAMES = ["Shell half 1", "Shell half 2", "Outer ring", "Inner ring", "Incense cup"];
export const CARD_COPY = [
  "This is one half of the openwork silver case around the rings and incense cup.",
  "Together, the two shell halves enclose the rings and incense cup.",
  "This ring turns on a pair of pivot pins inside the shell.",
  "This ring turns on a second pair of pivot pins, at right angles to the first.",
  "The cup holds the glowing ember and stays upright while the shell rolls."
];
// Display coordinates are relative to the exhibit center. The two rows include
// 7 cm clear gaps; all five tags fit inside a 43 x 34 cm rectangle.
export const DISPLAY_POSITIONS = [
  new vec3(-11, 10, 0), new vec3(11, 10, 0),
  new vec3(-17, -8, 0), new vec3(1, -8, 0), new vec3(16.2, -8, 0)
];
export const DISPLAY_ROTATIONS = [
  quat.angleAxis(-Math.PI/2, vec3.right()), quat.angleAxis(Math.PI/2, vec3.right()),
  quat.angleAxis(Math.PI/4, vec3.right()), quat.angleAxis(Math.PI/4, vec3.right()), quat.quatIdentity()
];
export const CONTRACTS = {
  exhibit: "Incense Exhibit", controller: "IncenseBallMain", ball: "Incense Ball",
  stand: "Incense Stand", button: "Incense Main Button", card: "Incense Inspection Card",
  smoke: "Incense Smoke", ember: "Incense Ember", ui: "Incense Exhibit UI"
};
