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