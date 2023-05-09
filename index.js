
 
const RGBot = {

  getEntitiesOnTeam: (tickInfo, team) => {
    return Object.values(tickInfo.gameState).filter(bot => bot.team === team);
  }

}

const CharInfo = {
  
  type: ["Mage", "Rogue", "Tank", "Archer"],
  abilities: [[0,1], [0,1,2], [0,1], [0,1,2]],
  // teamId
  abilityTargets: [[1,0], [1,1,-1], [1,-1], [1,1,1]]

}

const BossRoomBot = {

  getEnemies: (tickInfo) => {
    return RGBot.getEntitiesOnTeam(tickInfo, 1).filter(entry => !entry.broken);
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
    return RGBot.getEntitiesOnTeam(tickInfo, 1).filter(entry => !entry.broken).sort((a,b) => MathFunctions.distanceSq(position, a.position) - MathFunctions.distanceSq(position, b.position)).find(() => true);
  },

  startAbility: (ability, position, targetId, actionQueue) => {
    const input = {
      skillId: ability,
      targetId: targetId,
      xPosition: position != null ? position.x : null,
      yPosition: position != null ? position.y : null,
      zPosition: position != null ? position.z : null
    }
    console.log(`Using abilility ${ability} on targetId: ${targetId} at position: ${input.xPosition}, ${input.yPosition}, ${input.zPosition}`)
    actionQueue.queue("PerformSkill", input)
  }
}

/**
 * Allows a bot to define a set of specifications for bot behavior.
 * The validator queues up a test that needs to validate before the
 * given tick timeout is reached.
 */
class RGValidator {

  constructor() {
    this.validations = [];
  }

  /**
   * Clears all existing validations.
   */
  clearValidations = () => {
    this.validations = {};
  }

  validate = (name, timeout, validatorFunction) => {
    if (this.validations.hasOwnProperty(name)) return;
    this.validations[name] = ["WAITING", timeout, validatorFunction];
  }

  checkValidations = (tickInfo) => {
    for (let name in this.validations) {
      const [status, timeout, validatorFunction] = this.validations[name];
      if (status !== "WAITING") continue;
      if (timeout <= tickInfo.tick) {
        console.log(`× ${name} FAILED`);
        this.validations[name][0] = "FAILED";
      }
      else if (!validatorFunction(tickInfo)) {
        // Continue waiting
      } else {
        console.log(`✓ ${name} PASSED`);
        this.validations[name][0] = "PASSED";
      }
    }
  }

}

const MathFunctions = {
  distanceSq: (position1, position2) => {
    return Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2) + Math.pow(position2.z - position1.z, 2);
  }
}

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}


let CURRENT_ABILITY = 0;

let lastEnemyId = -1;

let rgValidator = new RGValidator();

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // On each state, run through the validations and see if any failed or passed
  rgValidator.checkValidations(tickInfo);

  // select 1 ability per update
  selectAbility(playerId, tickInfo, mostRecentMatchInfo, actionQueue);

  //TODO: Add script sensors to the door and button so that a bot can walk to a button if door not open
}

function selectAbility(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {
  const myPlayer = BossRoomBot.getAlly(tickInfo, playerId);
  const t = tickInfo.tick;

  // Some abilities require an enemy/ally id and position
  const abilities = CharInfo.abilities[charType];
  console.log(`Considering abilities ${JSON.stringify(abilities)}`);
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];
  console.log(`Trying out ability ${ability}`);
  const targetType = CharInfo.abilityTargets[charType][abilityIndex]
  if (targetType === 1) {
    const enemies = BossRoomBot.getEnemies(tickInfo);
    console.log(`Found ${enemies.length} enemies!`);
    let randomEnemy = BossRoomBot.getEnemy(tickInfo, lastEnemyId);
    if (!randomEnemy) {
      randomEnemy = BossRoomBot.nearestEnemy(tickInfo, myPlayer.position);
    }
    if (randomEnemy) {
      lastEnemyId = randomEnemy.id;
      BossRoomBot.startAbility(ability, randomEnemy.position, randomEnemy.id, actionQueue);
      // This was an offensive ability used on a target. Run three validations
      // 1. That a cooldown is now present
      // 2. That the cooldown goes away at some point in the future
      // 3. That the target has lost health
      rgValidator.validate(`[${charType}] Ability on Cooldown - Offense Ability #` + ability, t + 100, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        console.log("Checking for in cooldown")
        console.log(myState);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === true; // turns null into false;
      });
      rgValidator.validate(`[${charType}] Ability Recovered from Cooldown - Offense Ability #` + ability, t + 1000, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        console.log("Checking for passed cooldown")
        console.log(myState);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === false; // turns null into false;
      });
      const originalHealth = randomEnemy.health;
      rgValidator.validate(`[${charType}] Damage Given - Offense Ability #` + ability, t + 1000, (newTick) => {
        console.log(`Checking health of enemy (originally ${originalHealth})`)
        const enemyState = BossRoomBot.getEnemy(newTick, randomEnemy.id);
        console.log(enemyState);
        return enemyState.health < originalHealth;
      });
    } else {
      lastEnemyId = -1;
    }
  } else {
    const allies = BossRoomBot.getAllies(tickInfo);
    console.log(`Found ${allies.length} allies!`);
    let randomAlly;
    if (targetType === -1){
      randomAlly = null;
    } else {
      randomAlly = allies[Math.floor(Math.random() * allies.length)];
    }
    BossRoomBot.startAbility(ability, randomAlly ? randomAlly.position : null, randomAlly ? randomAlly.id : null, actionQueue);
  }
  CURRENT_ABILITY++;
}

export function getCharacterType() {
  return CharInfo.type[charType];
}
