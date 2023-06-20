import { MathFunctions, RGBot} from "./rg";


export const CharInfo = {

    type: ["Mage", "Rogue", "Tank", "Archer"],
    abilities: [[0,1], [0,1,2], [0,1], [0,1,2]],
    // teamId
    abilityTargets: [[1,0], [1,1,-1], [1,-1], [1,1,1]]
}

export const BossRoomBot = {

    getEntitiesOnTeam: (rg, team) => {
        return Object.values(rg.getState().gameState).filter(e => e.team === team);
    },

    getEnemies: (rg) => {
        return getEntitiesOnTeam(rg, 1).filter(entry => !entry.broken);
    },

    getAllies: (rg) => {
        return getEntitiesOnTeam(rg, 0);
    },

    getEnemy: (rg, id) => {
        return getEntitiesOnTeam(rg, 1).find(entry => entry.id == id);
    },

    getAlly: (rg, id) => {
        return getEntitiesOnTeam(rg, 0).find(entry => entry.id == id);
    },

    nearestEnemy: (rg) => {
        const position = rg.getBot().position;
        return getEntitiesOnTeam(rg, 1).filter(entry => !entry.broken).sort((a,b) => rg.MathFunctions.distanceSq(position, a.position) - rg.MathFunctions.distanceSq(position, b.position)).find(() => true);
    },

    getDoorSwitch: (rg) => {
        return rg.findEntity("FloorSwitch");
    },

    getHumans: (rg) => {
        return rg.findEntities("HumanPlayer");
    },

    startAbility: (ability, position, targetId, rg) => {
        rg.performAction("PerformSkill", {
            skillId: ability,
            targetId: targetId,
            xPosition: position != null ? position.x : null,
            yPosition: position != null ? position.y : null,
            zPosition: position != null ? position.z : null
        });
    },

    followObject: (target, range, rg) => {
        rg.performAction("FollowObject", {
            targetId: target.id,
            range: range
        })
    }
}