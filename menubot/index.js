import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator, RGBot} from "../rg";

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}

let rgValidator = new RGValidator();

let botComplete = false;

// flags for clicking the 4 buttons we need to click
let stateFlags = [false,false,false,false]

export async function runTurn(playerId, tickInfo, mostRecentMatchInfo, actionQueue) {

  // On each state, run through the validations and see if any failed or passed
  rgValidator.checkValidations(tickInfo);

  const t = tickInfo.tick;
  const sceneName = tickInfo.sceneName;

  // too spammy but good for debugging
  console.log(`Processing tickInfo: ${JSON.stringify(tickInfo)}`)

  switch (sceneName) {
    case "MainMenu":
      const hostButton = getInteractableButton(tickInfo, "RGHostButton");
      if (hostButton && !stateFlags[1]) {
        clickButton(hostButton.id, actionQueue);
        stateFlags[1] = true
      }

      const startButton = getInteractableButton(tickInfo, "StartWithRGButton");
      if (startButton && !stateFlags[0]) {
        clickButton(startButton.id, actionQueue);
        stateFlags[0] = true
      }

      break;
    case "CharSelect":
      const readyButton = getInteractableButton(tickInfo, "ReadyButton");
      if (readyButton && !stateFlags[3]) {
        clickButton(readyButton.id, actionQueue);
        stateFlags[3] = true
      }

      const seat7Button = getInteractableButton(tickInfo, "Seat7Button");
      if (seat7Button && !stateFlags[2]) {
        clickButton(seat7Button.id, actionQueue);
        stateFlags[2] = true
      }

      break;
    default:
      // teardown myself
      console.log(`Game started, bot is Complete`)
      botComplete = true;
      break;
  }

}

function getInteractableButton(tickInfo, buttonName) {
  const buttons = RGBot.getEntitiesOfType(tickInfo, buttonName);
  //console.log(`Found buttons: ${JSON.stringify(buttons)}`)
  if (buttons && buttons.length > 0) {
    const button = buttons[0];
    if (button.interactable) {
      //console.log(`Returning button: ${JSON.stringify(button)}`)
      return button;
    }
  }
  return null;
}

function clickButton(targetId, actionQueue) {
  console.log(`Clicking button: ${targetId}`)
  const input = {
    targetId: targetId
  }
  actionQueue.queue("ClickButton", input)
}

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
  return CharInfo.type[charType];
}

/**
 * Let server know if i have finished my processing
 * @returns {boolean} true if done processing and ready to be torn down
 */
export function isComplete() {
  return botComplete;
}

/**
    One of ...
    SPAWNABLE - Server disconnects/ends bot on match/game-scene teardown
    PERSISTENT - Bot is responsible for disconnecting / ending itself
 */
export function getBotLifecycle() {
  return 'PERSISTENT';
}

export function isSpawnable() {
  return false;
}