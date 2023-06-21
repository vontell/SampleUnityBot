import { CharInfo } from "../bossroom";

let charType = 0; // Healer
let rg = null;


/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
    return CharInfo.type[charType]; 
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
    return true;
}

export function isComplete() {
    return rg ? rg.isComplete() : false;
}

export async function configureBot(rgObject) {
    rg = rgObject;
    rg.automatedTestMode = true;

    // validate that we're in the game
    await rg.waitForScene("BossRoom");

    // find the closest human player and use a heal ability on them
    let target = await rg.findNearestEntity("HumanPlayer");
    await rg.entityExists(target);

    let skillId = CharInfo.abilities[charType][1]
    rg.performAction("PerformSkill", {
        skillId: skillId,
        targetId: target.id,
        xPosition: target.position.x,
        yPosition: target.position.y,
        zPosition: target.position.z
    })

    // validate that the heal recovers from cooldown
    await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], true); 


    // find the closest enemy and use the basic attack until it dies
    // measure from the position of a known imp, 
    // so the character doesn't try to attack through a wall
    target = await rg.findNearestEntity("Imp", { x: -3.95, y: 0.0, z: -15.5 });
    await rg.entityExists(target);
    await rg.entityHasAttribute(target, "health", 15);

    // approach the entity
    rg.performAction("FollowObject", {
        targetId: target.id,
        range: 5,
    });

    // validate that it is within certain range
    // rg.distanceLessThan(rg.getBot(), target, 6);

    // queue three attacks
    // each one should do 5 damage
    skillId = CharInfo.abilities[charType][0];
    const args = {
        skillId: skillId,
        targetId: target.id,
        xPosition: target.position.x,
        yPosition: target.position.y,
        zPosition: target.position.z
    }
    rg.performAction("PerformSkill", args)
    await rg.entityHasAttribute(target, "health", 10);

    rg.performAction("PerformSkill", args)
    await rg.entityHasAttribute(target, "health", 5);

    rg.performAction("PerformSkill", args)
    await rg.entityDoesNotExist(target);

    rg.complete();
}