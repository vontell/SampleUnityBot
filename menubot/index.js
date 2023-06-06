import {BossRoomBot, CharInfo} from "../bossroom";
import {RGValidator, RGBot} from "../rg";

let charType = Math.round(Math.random() * 1000000) % 4;

export function configureBot(characterType) {
  console.log(`Unity bot configureBot function called, charType: ${charType} - characterType: ${characterType}`);
  charType = CharInfo.type.indexOf(characterType);
}

let rgValidator = new RGValidator();

let botComplete = false;

// flags for clicking the 6 buttons we need to click to start the game
let stateFlags = [false,false,false,false,false,false]

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
      if (hostButton && stateFlags[0] && !stateFlags[1]) {
        clickButton(hostButton.id, actionQueue);
        stateFlags[1] = true
      }

      const startButton = getInteractableButton(tickInfo, "StartWithRGButton");
      if (startButton && stateFlags[5] && !stateFlags[0]) {
        clickButton(startButton.id, actionQueue);
        stateFlags[0] = true
      }

      const selectProfileButton = getInteractableButton(tickInfo, "SelectProfileButton");
      if (selectProfileButton && stateFlags[4] && !stateFlags[5]) {
        clickButton(selectProfileButton.id, actionQueue);
        stateFlags[5] = true
      }

      const profileMenuButton = getInteractableButton(tickInfo, "ProfileMenuButton");
      if (profileMenuButton && !stateFlags[4]) {
        clickButton(profileMenuButton.id, actionQueue);
        stateFlags[4] = true
      }

      break;
    case "CharSelect":
      const readyButton = getInteractableButton(tickInfo, "ReadyButton");
      if (readyButton && stateFlags[2] && !stateFlags[3]) {
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
    MANAGED - Server disconnects/ends bot on match/game-scene teardown
    PERSISTENT - Bot is responsible for disconnecting / ending itself
 */
export function getBotLifecycle() {
  return 'PERSISTENT';
}

export function isSpawnable() {
  return false;
}