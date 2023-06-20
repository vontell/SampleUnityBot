
export const CharInfo = {

    type: ["Mage", "Rogue", "Tank", "Archer"],
    abilities: [[0,1], [0,1,2], [0,1], [0,1,2]],
    // teamId
    abilityTargets: [[1,0], [1,1,-1], [1,-1], [1,1,1]]
}

export class BossRoomBot {

    static getEntitiesOnTeam(rg, team) {
        return Object.values(rg.getState().gameState).filter(e => e.team === team);
    };

    static getEnemies(rg) {
        return this.getEntitiesOnTeam(rg, 1).filter(entry => !entry.broken);
    };

    static getAllies(rg) {
        return this.getEntitiesOnTeam(rg, 0);
    };

    static getEnemy(rg, id) {
        return this.getEntitiesOnTeam(rg, 1).find(entry => entry.id == id);
    };

    static getAlly(rg, id) {
        return this.getEntitiesOnTeam(rg, 0).find(entry => entry.id == id);
    };

    static nearestEnemy(rg) {
        const position = rg.getBot().position;
        return this.getEntitiesOnTeam(rg, 1).filter(entry => !entry.broken).sort((a,b) => rg.MathFunctions.distanceSq(position, a.position) - rg.MathFunctions.distanceSq(position, b.position)).find(() => true);
    };

    static getDoorSwitch(rg) {
        return rg.findEntity("FloorSwitch");
    };

    static getHumans(rg) {
        return rg.findEntities("HumanPlayer");
    };

    static startAbility(ability, position, targetId, rg) {
        rg.performAction("PerformSkill", {
            skillId: ability,
            targetId: targetId,
            xPosition: position != null ? position.x : null,
            yPosition: position != null ? position.y : null,
            zPosition: position != null ? position.z : null
        });
    };

    static followObject(target, range, rg) {
        rg.performAction("FollowObject", {
            targetId: target.id,
            range: range
        })
    };
}