import { CharInfo } from "../bossroom";

let rg = null;

/**
 * Defines the type of character that the game should use for this bot.
 */
 export function getCharacterType() {
  return CharInfo.type[1]; // fixed to rogue character
}

/**
 * One of ...
 * MANAGED - Server disconnects/ends bot on match/game-scene teardown
 * PERSISTENT - Bot is responsible for disconnecting / ending itself
 */
export function getBotLifecycle() {
  return 'PERSISTENT';
}

/**
 * @returns {boolean} true if I'm an in-game character, or false if I'm an invisible navigator/observer/etc.
 */
export function isSpawnable() {
  return false;
}

/**
 * Let server know if i have finished my processing
 * @returns {boolean} true if done processing and ready to be torn down
 */
export function isComplete() {
  return rg ? rg.isComplete() : false;
}


// flags for clicking the 6 buttons we need to click to start the game
let stateFlags = {
  "RGHostButton":false,
  "StartWithRGButton":false,
  "SelectProfileButton":false,
  "ProfileMenuButton":false,
  "ReadyButton":false,
  "Seat7Button":false,
}

let playedGame = false;

export async function configureBot(rgObject) {
  rg = rgObject;
}

export async function runTurn(rgObject) {

  switch (rg.getState().sceneName) {
    case "MainMenu":

      if (playedGame) {
        rg.complete()
      } else {
        const hostButton = await getInteractableButton("RGHostButton");
        if (hostButton && stateFlags["StartWithRGButton"] && !stateFlags["RGHostButton"]) {
          rg.performAction("ClickButton", {targetId: hostButton.id});
          stateFlags["RGHostButton"] = true
        }

        const startButton = await getInteractableButton("StartWithRGButton");
        if (startButton && stateFlags["SelectProfileButton"] && !stateFlags["StartWithRGButton"]) {
          rg.performAction("ClickButton", {targetId: startButton.id});
          stateFlags["StartWithRGButton"] = true
        }

        const selectProfileButton = await getInteractableButton("SelectProfileButton");
        if (selectProfileButton && stateFlags["ProfileMenuButton"] && !stateFlags["SelectProfileButton"]) {
          rg.performAction("ClickButton", {targetId: selectProfileButton.id});
          stateFlags["SelectProfileButton"] = true
        }

        const profileMenuButton = await getInteractableButton("ProfileMenuButton");
        if (profileMenuButton && !stateFlags["ProfileMenuButton"]) {
          rg.performAction("ClickButton", {targetId: profileMenuButton.id});
          stateFlags["ProfileMenuButton"] = true
        }
      }

      break;
    case "CharSelect":
      if (playedGame) {
        rg.complete()
      } else {
        const readyButton = await getInteractableButton("ReadyButton");
        if (readyButton && stateFlags["Seat7Button"] && !stateFlags["ReadyButton"]) {
          rg.performAction("ClickButton", {targetId: readyButton.id});
          stateFlags["ReadyButton"] = true
        }

        const seat7Button = await getInteractableButton("Seat7Button");
        if (seat7Button && !stateFlags["Seat7Button"]) {
          rg.performAction("ClickButton", {targetId: seat7Button.id});
          stateFlags["Seat7Button"] = true
        }
      }

      break;
    case "BossRoom":
      playedGame = true;

      const GameHUDStartButton = await getInteractableButton("GameHUDStartButton");
      if (GameHUDStartButton && stateFlags["CheatsCancelButton"] && !stateFlags["GameHUDStartButton"]) {
        rg.performAction("ClickButton", {targetId: GameHUDStartButton.id});
        stateFlags["GameHUDStartButton"] = true
      }

      const CheatsCancelButton = await getInteractableButton("CheatsCancelButton");
      if (CheatsCancelButton && !stateFlags["CheatsCancelButton"]) {
        rg.performAction("ClickButton", {targetId: CheatsCancelButton.id});
        stateFlags["CheatsCancelButton"] = true
      }

      break;
    case "PostGame":
    default:
      // teardown myself
      rg.complete()
      break;
  }

}

async function getInteractableButton(buttonName) {
  const button = await rg.findEntityByType(buttonName);
  if (await rg.entityHasAttribute(button, "interactable", true)) {
    return button;
  }
  return null;
}