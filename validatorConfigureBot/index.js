import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator} from "../rg";

let rgValidator = new RGValidator();
let charType = 1; // fixed to rogue character
let botComplete = false;

// flags for clicking the 6 buttons we need to click to start the game
let stateFlags = {
  "RGHostButton":false,
  "StartWithRGButton":false,
  "SelectProfileButton":false,
  "ProfileMenuButton":false,
  "ReadyButton":false,
  "Seat7Button":false,
}

export function configureBot(bot) {
  console.log(`BOTCODE: charTypeWas: ${bot.characterType}`);
  charType = CharInfo.type.indexOf(bot.characterType);

}


// function getEntitiesByType(state, objectType) {
//   const entities = Object.values(state.gameState).filter(e => e.type === type);
// }


// function waitForScene(bot) {
//   const sceneName = bot.getState().sceneName;

// }


export async function runTurn(bot) {
  console.log(`BOTCODE Tick number ${tickInfo.tick}: ${JSON.stringify(bot.getState())}`);
}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}

