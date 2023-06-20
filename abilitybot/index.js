import { CharInfo } from "../bossroom";

/**
 * Defines the type of character that the game should use for this bot.
 */
export function getCharacterType() {
    return CharInfo.type[0]; // Healer
}

export async function configureBot(rg) {
    rg.automatedTestMode = true;

    // validate that we're in the game
    await rg.waitForScene("BossRoom");

    // find the closest human player and use a heal ability on them
    const target = await rg.findNearestEntity("HumanPlayer");
    await rg.entityExists(target);

    let skillId = CharInfo.abilities[rg.characterType][1]
    rg.performAction("PerformSkill", {
        skillId: skillId,
        targetId: target.id,
        xPosition: target.position.x,
        yPosition: target.position.y,
        zPosition: target.position.z
    })

    // validate the heal goes on cooldown and then recovers from cooldown
    await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], false);
    await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], true); 


    // find the closest enemy and use the basic attack until it dies
    target = await rg.findNearestEntity("Imp");
    await rg.entityExists(enemy);

    skillId = CharInfo.abilities[rg.characterType][0];
    while(rg.getState(enemy.id)) {

        // const originalEnemyHealth = rg.getState(enemy.id).health;
    
        // perform an attack
        rg.performAction("PerformSkill", {
            skillId: skillId,
            targetId: target.id,
            xPosition: target.position.x,
            yPosition: target.position.y,
            zPosition: target.position.z
        })

        // validate the attack goes on cooldown and then recovers from cooldown
        await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], false);
        await rg.entityHasAttribute(rg.getBot(), ["isOnCooldown", `ability${skillId}Available`], true); 
        
        // validate the enemy took damage
        // TODO figure out how to do this
        // const newHealth = rg.getState(enemy.id).health;
        // rgValidator.validate(`[${charName}] Damage Given - Offense Ability #` + ability, t + 1000, (newTick) => {
        //     const enemyState = BossRoomBot.getEnemy(newTick, randomEnemy.id);
        //     return !enemyState || enemyState.health < originalHealth;
        //   });
    }

}