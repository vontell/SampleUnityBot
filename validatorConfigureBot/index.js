import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator} from "../rg";

let rgValidator = new RGValidator();

let charType = Math.round(Math.random() * 1000000) % 4;

let bot;

export function configureBot(qaBot) {
  bot = qaBot;
  console.log(`onfigureBot called, charType: ${bot.characterType}`);
  charType = CharInfo.type.indexOf(bot.characterType);
}

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  console.log(`Tick number ${tickInfo.tick}: ${bot.getState()}`);
  
}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}