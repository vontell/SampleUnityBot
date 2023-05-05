

const RGBot = {

  getEntitiesOnTeam: (tickInfo, team) => {
    return Object.values(tickInfo.gameState).filter(bot => bot.team === team);
  }

} 

const BossRoomBot = {

  abilities: [0, 1, 2],

  getEnemies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1);
  },

  startAbility: (ability, position, targetId, actionQueue) => {
    const input = {
      skillId: ability,
      targetId: targetId,
      xPosition: position.x,
      yPosition: position.y,
      zPosition: position.z
    }
    actionQueue.queue("PerformSkill", input)
  }

}

class RGValidator {

}

export function configureBot() {
  console.log("Unity bot configureBot function called !")
}


let CURRENT_ABILITY = 0;

export async function runTurn(tickInfo, mostRecentMatchInfo, actionQueue) {

  console.log(tickInfo)

  // Collect some initial information that is needed
  const enemies = BossRoomBot.getEnemies(tickInfo);
  console.log(`Found ${enemies.length} enemies!`);

  // Some abilities require an enemy id and position
  const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  const ability = BossRoomBot.abilities[CURRENT_ABILITY % BossRoomBot.abilities.length];
  console.log(`Trying out ability ${ability}`);
  BossRoomBot.startAbility(ability, randomEnemy.position, randomEnemy.id, actionQueue);
  CURRENT_ABILITY++;

}

export function getCharacterType() {
  return "Mage";
}
