import {MathFunctions, RGBot} from "./rg";


export const CharInfo = {

    type: ["Mage", "Rogue", "Tank", "Archer"],
    abilities: [[0,1], [0,1,2], [0,1], [0,1,2]],
    // teamId
    abilityTargets: [[1,0], [1,1,-1], [1,-1], [1,1,1]]

}

export const BossRoomBot = {

    getEnemies: (tickInfo) => {
        return RGBot.getEntitiesOnTeam(tickInfo, 1).filter(entry => !entry.broken);
    },

    getAllies: (tickInfo) => {
        return RGBot.getEntitiesOnTeam(tickInfo, 0);
    },

    getEnemy: (tickInfo, id) => {
        return RGBot.getEntitiesOnTeam(tickInfo, 1).find(entry => entry.id == id);
    },

    getAlly: (tickInfo, id) => {
        return RGBot.getEntitiesOnTeam(tickInfo, 0).find(entry => entry.id == id);
    },

    nearestEnemy: (tickInfo, position) => {
        return RGBot.getEntitiesOnTeam(tickInfo, 1).filter(entry => !entry.broken).sort((a,b) => MathFunctions.distanceSq(position, a.position) - MathFunctions.distanceSq(position, b.position)).find(() => true);
    },

    getDoorSwitch: (tickInfo) => {
        return RGBot.getEntitiesOfType(tickInfo, "FloorSwitch")[0];
    },

    getHumans: (tickInfo) => {
        return RGBot.getEntitiesOfType(tickInfo, "HumanPlayer");
    },

    startAbility: (ability, position, targetId, actionQueue) => {
        const input = {
            skillId: ability,
            targetId: targetId,
            xPosition: position != null ? position.x : null,
            yPosition: position != null ? position.y : null,
            zPosition: position != null ? position.z : null
        }
        // console.log(`Using ability ${ability} on targetId: ${targetId} at position: ${input.xPosition}, ${input.yPosition}, ${input.zPosition}`)
        actionQueue.queue("PerformSkill", input)
    },

    followObject: (target, range, actionQueue) => {
        const input = {
            targetId: target.id,
            range: range
        }
        actionQueue.queue("FollowObject", input)
    }
}