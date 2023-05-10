import {BossRoomBot, CharInfo} from "./bossroom";
import {MathFunctions, RGValidator} from "./rg";

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${getCharacterType()} - characterType: ${characterType}`);
}


let CURRENT_ABILITY = 0;

let lastEnemyId = -1;

let rgValidator = new RGValidator();

/**
 * Outline of our bot algorithm. For every tick:
 *  - If the bot is standing on the switch, do nothing
 *  - If the bot is not near the player, move within range of the player
 *  - If an enemy is within a certain distance of a player, attack that enemy
 *  - If the switch is within a range of 5 units from the bot, move onto the switch
 */
export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // First, get all the information needed to perform the various checks
  const myState = BossRoomBot.getAlly(tickInfo, playerId);
  const doorSwitchState = BossRoomBot.getDoorSwitch(tickInfo);

  // If the bot is standing on the switch, do nothing
  console.log(doorSwitchState)
  if (doorSwitchState && doorSwitchState.isOn) return;

  // If the switch is within a range of 15 units from the bot, move onto the switch
  if (doorSwitchState && MathFunctions.distanceSq(myState.position, doorSwitchState.position) < 15) {
    BossRoomBot.moveTowards(doorSwitchState, actionQueue);
    return;
  }

  // If the bot is not near the player, move within range of the player
  const humanPlayer = BossRoomBot.getHumans(tickInfo)[0];
  if (humanPlayer && MathFunctions.distanceSq(humanPlayer.position, myState.position) > 7) {
    BossRoomBot.moveTowards(humanPlayer, actionQueue);
    return;
  }

  // Otherwise, attack nearby enemies, if there is one
  const nearbyEnemy = BossRoomBot.nearestEnemy(tickInfo, myState.position);
  if (nearbyEnemy) {
    BossRoomBot.startAbility(1, nearbyEnemy.position, nearbyEnemy.id, actionQueue);
  }

}

/**
 * Selects an ability for this character, and queues that action.
 */
function selectAbility(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {
  const myPlayer = BossRoomBot.getAlly(tickInfo, playerId);
  const t = tickInfo.tick;
  const charName = CharInfo.type[charType];

  // Select an ability
  const abilities = CharInfo.abilities[charType];
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];
  const targetType = CharInfo.abilityTargets[charType][abilityIndex]

  // If the ability requires an enemy, select the most recently referenced enemy, or the nearest enemy.
  if (targetType === 1) {
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

      rgValidator.validate(`[${charName}] Ability on Cooldown - Offense Ability #` + ability, t + 100, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === true; // turns null into false;
      });

      rgValidator.validate(`[${charName}] Ability Recovered from Cooldown - Offense Ability #` + ability, t + 1000, (newTick) => {
        const myState = BossRoomBot.getAlly(newTick, playerId);
        let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
        return isOnCooldown === false; // turns null into false;
      });

      const originalHealth = randomEnemy.health;
      rgValidator.validate(`[${charName}] Damage Given - Offense Ability #` + ability, t + 1000, (newTick) => {
        const enemyState = BossRoomBot.getEnemy(newTick, randomEnemy.id);
        return enemyState.health < originalHealth;
      });

    } else {
      lastEnemyId = -1;
    }
  } else {
    // Otherwise, this ability might require an ally - select a random one.
    const allies = BossRoomBot.getAllies(tickInfo);
    let randomAlly;
    if (targetType === -1){
      randomAlly = null;
    } else {
      randomAlly = allies[Math.floor(Math.random() * allies.length)];
    }
    BossRoomBot.startAbility(ability, randomAlly ? randomAlly.position : null, randomAlly ? randomAlly.id : null, actionQueue);

    // This was an ally ability used on a target. Run two validations
    // 1. That a cooldown is now present
    // 2. That the cooldown goes away at some point in the future

    rgValidator.validate(`[${charName}] Ability on Cooldown - Ally Ability #` + ability, t + 100, (newTick) => {
      const myState = BossRoomBot.getAlly(newTick, playerId);
      let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
      return isOnCooldown === true; // turns null into false;
    });

    rgValidator.validate(`[${charName}] Ability Recovered from Cooldown - Ally Ability #` + ability, t + 1000, (newTick) => {
      const myState = BossRoomBot.getAlly(newTick, playerId);
      let isOnCooldown = myState.isOnCooldown[`ability${ability}Available`];
      return isOnCooldown === false; // turns null into false;
    });

  }

  CURRENT_ABILITY++;

}

/**
 * Defines the type of character that the game should use for this bot (in this case an Archer)
 */
export function getCharacterType() {
  return "Archer";
}
