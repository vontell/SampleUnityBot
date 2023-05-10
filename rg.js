
export const RGBot = {

    getEntitiesOnTeam: (tickInfo, team) => {
        return Object.values(tickInfo.gameState).filter(e => e.team === team);
    },

    getEntitiesOfType: (tickInfo, type) => {
        return Object.values(tickInfo.gameState).filter(e => e.type === type);
    }

}

/**
 * Allows a bot to define a set of specifications for bot behavior.
 * The validator queues up a test that needs to validate before the
 * given tick timeout is reached.
 */
export class RGValidator {

    constructor() {
        this.validations = [];
    }

    /**
     * Clears all existing validations.
     */
    clearValidations = () => {
        this.validations = {};
    }

    validate = (name, timeout, validatorFunction) => {
        if (this.validations.hasOwnProperty(name)) return;
        this.validations[name] = ["WAITING", timeout, validatorFunction];
    }

    checkValidations = (tickInfo) => {
        for (let name in this.validations) {
            const [status, timeout, validatorFunction] = this.validations[name];
            if (status !== "WAITING") continue;
            if (timeout <= tickInfo.tick) {
                console.log(`× ${name} FAILED`);
                this.validations[name][0] = "FAILED";
            }
            else if (!validatorFunction(tickInfo)) {
                // Continue waiting
            } else {
                console.log(`✓ ${name} PASSED`);
                this.validations[name][0] = "PASSED";
            }
        }
    }

}

export const MathFunctions = {
    distanceSq: (position1, position2) => {
        return Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2) + Math.pow(position2.z - position1.z, 2);
    }
}