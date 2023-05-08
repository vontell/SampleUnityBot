
 
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

  getEnemy: (tickInfo, id) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1).find(entry => entry.id == id);
  },

  getAlly: (tickInfo, id) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 0).find(entry => entry.id == id);
  },

  nearestEnemy: (tickInfo, position) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1).toSorted((a,b) => MathFunctions.distanceSq(position, a.position) - MathFunctions.distanceSq(position, b.position));
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

const MathFunctions = {
  distanceSq: (position1, position2) => {
    return Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2) + Math.pow(position2.z - position1.z, 2);
  }
}

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`)
  charType = CharInfo.type.indexOf(characterType)
}


let CURRENT_ABILITY = 0;

let lastEnemyId = -1;

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  console.log(`Running 'runTurn' with new tickInfo`)

  const myPlayer = BossRoomBot.getAlly(tickInfo, playerId);

  // Some abilities require an enemy/ally id and position
  const abilities = CharInfo.abilities[charType];
  console.log(`Considering abilities ${JSON.stringify(abilities)}`);
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];
  console.log(`Trying out ability ${ability}`);
  if (CharInfo.abilityTargets[charType][abilityIndex] == 1) {
      const enemies = BossRoomBot.getEnemies(tickInfo);
      console.log(`Found ${enemies.length} enemies!`);
      let randomEnemy = BossRoomBot.getEnemy(tickInfo, lastEnemyId);
      if (!randomEnemy) {
        randomEnemy = BossRoomBot.nearestEnemy(tickInfo, myPlayer.position);
      }
      if (randomEnemy) {
        lastEnemyId = randomEnemy.id;
        BossRoomBot.startAbility(ability, randomEnemy.position, randomEnemy.id, actionQueue);
      } else {
        lastEnemyId = -1;
      }
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
