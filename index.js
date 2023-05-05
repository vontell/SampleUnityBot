

const RGBot = {

  getEntitiesOnTeam: (tickInfo, team) => {
    return Object.values(tickInfo.gameState).filter(bot => bot.team === team);
  }

}

const BossRoomBot = {

  // mage only has 2 abilities, other characterTypes may have more
  abilities: [0, 1],

  getEnemies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1);
  },
  
  getAllies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 0);
  }

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

  console.log(`Running 'runTurn' with new tickInfo`)

  // Some abilities require an enemy/ally id and position
  const ability = BossRoomBot.abilities[CURRENT_ABILITY % BossRoomBot.abilities.length];
  console.log(`Trying out ability ${ability}`);
  if (ability % BossRoomBot.abilities.length == 0) {
      const enemies = BossRoomBot.getEnemies(tickInfo);
      console.log(`Found ${enemies.length} enemies!`);
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      BossRoomBot.startAbility(ability, randomEnemy.position, randomEnemy.id, actionQueue);
  } else {
      const allies = BossRoomBot.getAllies(tickInfo);
      console.log(`Found ${allies.length} allies!`);
      const randomAlly = allies[Math.floor(Math.random() * allies.length)];
      BossRoomBot.startAbility(ability, randomAlly.position, randomAlly.id, actionQueue);
  }
  CURRENT_ABILITY++;

} 

export function getCharacterType() {
  return "Mage";
}
