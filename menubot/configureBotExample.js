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
 * Let server know if I have finished my processing
 * @returns {boolean} true if done processing and ready to be torn down
 */
 export function isComplete() {
  return rg ? rg.isComplete() : false;
}

/**
 * Start running my test scenario
 */
export async function configureBot(rgObject) {

  rg = rgObject;
  rg.automatedTestMode = true;

  // validate we're on the main menu
  await rg.waitForScene("MainMenu");

  // get to the character select screen
  const profileMenuButton = await rg.findEntity("ProfileMenuButton");
  await rg.entityHasAttribute(profileMenuButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: profileMenuButton.id});

  const selectProfileButton = await rg.findEntity("SelectProfileButton");
  await rg.entityHasAttribute(selectProfileButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: selectProfileButton.id});

  const startWithRGButton = await rg.findEntity("StartWithRGButton");
  await rg.entityHasAttribute(startWithRGButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: startWithRGButton.id});

  const rgHostButton = await rg.findEntity("RGHostButton");
  await rg.entityHasAttribute(rgHostButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: rgHostButton.id});


  // now we should be at character select
  await rg.entityDoesNotExist(profileMenuButton);
  await rg.entityDoesNotExist(selectProfileButton);
  await rg.entityDoesNotExist(startWithRGButton);
  await rg.entityDoesNotExist(rgHostButton);
  await rg.waitForScene("CharSelect");

  // select a character and get to the game screen
  const seat7Button = await rg.findEntity("Seat7Button");
  await rg.entityHasAttribute(seat7Button, "interactable", true);
  rg.performAction("ClickButton", {targetId: seat7Button.id});

  const readyButton = await rg.findEntity("ReadyButton");
  await rg.entityHasAttribute(readyButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: readyButton.id});


  // we should be in the dungeon now
  await rg.entityDoesNotExist(seat7Button);
  await rg.entityDoesNotExist(readyButton);
  await rg.waitForScene("BossRoom");

  // dismiss the help dialogs so we can start playing
  const cheatsCancelButton = await rg.findEntity("CheatsCancelButton");
  await rg.entityHasAttribute(cheatsCancelButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: cheatsCancelButton.id});

  const gameHUDStartButton = await rg.findEntity("GameHUDStartButton");
  await rg.entityHasAttribute(gameHUDStartButton, "interactable", true);
  rg.performAction("ClickButton", {targetId: gameHUDStartButton.id});

  // HUD should have been dismissed, 
  // which means our buttons should also no longer be on the screen
  await rg.entityDoesNotExist(cheatsCancelButton);
  await rg.entityDoesNotExist(gameHUDStartButton);


  // we're done!
  rg.complete()
}