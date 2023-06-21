import { BossRoomBot, CharInfo } from "../bossroom";

let charType = Math.round(Math.random() * 1000000) % 4;

/**
 * Defines the type of character that the game should use for this bot.
 */
 export function getCharacterType() {
  return CharInfo.type[charType];
}

export function configureBot(rgObject) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${rgObject.characterType}`);
  charType = CharInfo.type.indexOf(rgObject.characterType);
}

let rg = null;

let CURRENT_ABILITY = 0;

let lastEnemyId = -1;

export async function runTurn(rgObject) {

  rg = rgObject;

  if (rg.getState().sceneName === "BossRoom") {

    // select 1 ability per update
    await selectAbility();

    // TODO: Add script sensors to the door and button so that a bot can walk to a button if door not open
  }
}

/**
 * Selects an ability for this character, and queues that action.
 */
async function selectAbility() {

  // Select an ability
  const abilities = CharInfo.abilities[charType];
  const abilityIndex = CURRENT_ABILITY % abilities.length;
  const ability = abilities[abilityIndex];

  if(!rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${ability}Available`], true)) {
    return;
  }

  const targetType = CharInfo.abilityTargets[charType][abilityIndex]
  let currentTarget;

  if(targetType === -1) 
  {
    currentTarget = null;
  } 
  else if (targetType === 1) {
    // The ability requires an enemy.
    // Select the most recently referenced enemy or the nearest enemy.
    const randomEnemy = rg.findNearestEntity(null, null, (entity) => entity.team === 1 && !entity.broken )
    console.log(JSON.stringify(randomEnemy))
    
    if (randomEnemy) {
      currentTarget = randomEnemy;
      lastEnemyId = randomEnemy.id;
    } else {
      lastEnemyId = -1;
      return;
    }
  } else {
    // Otherwise, this ability requires an ally - select a random one.
    const allies = BossRoomBot.getAllies(rg);
    currentTarget = allies[Math.floor(Math.random() * allies.length)];
  }

  BossRoomBot.startAbility(ability, currentTarget?.position, currentTarget?.id, rg);
  CURRENT_ABILITY++;

}
