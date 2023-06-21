import { CharInfo } from "../bossroom";

let charType = 0; // Healer

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
    return CharInfo.type[charType]; 
}

export async function configureBot(rg) {
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
    target = await rg.findNearestEntity("Imp", { x: -0.9, y: -100.0, z: 30.0 });
    await rg.entityExists(target);

    // approach the entity
    rg.performAction("FollowObject", {
        targetId: target.id,
        range: 5,
    });

    // validate that it is within certain range
    // rg.distanceLessThan(rg.getBot(), target, 6);

    // queue three attacks
    // const args = {
    //     skillId: skillId,
    //     targetId: target.id,
    //     xPosition: target.position.x,
    //     yPosition: target.position.y,
    //     zPosition: target.position.z
    // }
    // rg.performAction("PerformSkill", args)
    // rg.performAction("PerformSkill", args)
    // rg.performAction("PerformSkill", args)

    skillId = CharInfo.abilities[charType][0];
    while(rg.getState(target.id)) {

        const originalEnemyHealth = rg.getState(enemy.id).health;
    
        // perform an attack
        rg.performAction("PerformSkill", {
            skillId: skillId,
            targetId: target.id,
            xPosition: target.position.x,
            yPosition: target.position.y,
            zPosition: target.position.z
        })

        // validate that the attack recovers from cooldown
        await rg.entityHasAttribute(target, "health", originalEnemyHealth - 30);
    
        // validate the enemy took damage
        // TODO figure out how to do this
        // const newHealth = rg.getState(enemy.id).health;
        // rgValidator.validate(`[${charName}] Damage Given - Offense Ability #` + ability, t + 1000, (newTick) => {
        //     const enemyState = BossRoomBot.getEnemy(newTick, randomEnemy.id);
        //     return !enemyState || enemyState.health < originalHealth;
        //   });
    }
    await rg.entityDoesNotExist(target);

}