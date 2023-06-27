/**
 * Defines the type of character that the game should use for this bot.
 */
 export function getCharacterType() {
  return "";
}

export function configureBot(rgObject) {
  console.log(`Unity bot configureBot function called`);
  console.log(rgObject)
}

let rg = null;

export async function runTurn(rgObject) {

  console.log("inside run turn")

  let powerUps = rgObject.findEntities("PowerUp")
  if (powerUps) {
    console.log(powerUps[0].position)
    rgObject.performAction("MoveToPosition", powerUps[0].position)
  }

}