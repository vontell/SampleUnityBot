export function configureBot() {
  console.log("Unity bot configureBot function called!")
}

export async function runTurn(tickInfo, mostRecentMatchInfo, api) {

  let allObjects = Object.values(tickInfo)
  let humanPlayer = allObjects.find(o => o.type === "HumanPlayer")
  let botPlayer = allObjects.find(o => o.type === "BotPlayer")
  if (humanPlayer && botPlayer) {
    console.log(`Received ${allObjects.length} object states`)
    console.log("HUMAN PLAYER\n", humanPlayer)
    console.log("BOT PLAYER\n", botPlayer)
    // Example logic - if the bot is at least 5 away from the player, move towards the player
    let hp = humanPlayer.position;
    let bp = botPlayer.position;
    let desiredRange = 5;
    let distance = Math.sqrt(Math.pow(hp.x - bp.x, 2) + Math.pow(hp.y - bp.y, 2) + Math.pow(hp.z - bp.z, 2));
    console.log(`Distance is ${distance}, and range is ${desiredRange}`);
    if (distance > desiredRange) {
      console.log("Sending action");
      api.sendAction("FollowObject", {targetId: humanPlayer.id, range: 5})
    }
  }

}