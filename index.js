
 
const RGBot = {

  getEntitiesOnTeam: (tickInfo, team) => {
    return Object.values(tickInfo.gameState).filter(bot => bot.team === team);
  }

}

const CharInfo = {
  
  type: ["Mage", "Rogue", "Tank", "Archer"],
  abilities: [[0,1], [0,1,2], [0,1], [0,1,2]],
  // teamId
  abilityTargets: [[1,0], [1,1,0], [1,0], [1,1,1]]

}

const BossRoomBot = {

  getEnemies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1);
  },
  
  getAllies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 0);
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
//test
}

class RGValidator {

}

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot() {
  console.log(`Unity bot configureBot function called, charType: ${charType} !`)
}


let CURRENT_ABILITY = 0;

export async function runTurn(tickInfo, mostRecentMatchInfo, actionQueue) {

  console.log(`Running 'runTurn' with new tickInfo`)

  // Some abilities require an enemy/ally id and position
  const abilities = CharInfo.abilities[charType];
  console.log(`Considering abilities ${JSON.stringify(abilities)}`);
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];
  console.log(`Trying out ability ${ability}`);
  if (CharInfo.abilityTargets[charType][abilityIndex] == 1) {
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
  return CharInfo.type[charType];
}
