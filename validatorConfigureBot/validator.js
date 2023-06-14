
////////////////////////////
// bot + validator will be one object eventually as "rg"
////////////////////////////

import { resolve } from "path";

/**
 * Perform assertions against a primitive value
 */
class Matchers {
    constructor(actual) {
        this.actual = actual;
    }

    toEqual(expected) {
        if(expected !== this.actual) {
            console.error(`Fail - Expected value ${expected} but was ${this.actual}`)
        }
    }
   
}

export default class Validator {
  
    /**
     * Reference to the bot for easy access to state.
     * This needs to be passed in the constructor, 
     * but the user ideally won't interact with it from thereon.
     */
    #bot;

    /**
     * Returns the full state object, or the state for the entity with the given id
     * @param id Optional id. If passed, will return the state for the entity with this id
     * @returns The current state on the bot object
     */
    state(id = null) {
        if(id == null) {
            return this.#bot.getState();
        } else {
            return (this.#bot.getState().gameState)[id];
        }
    }
          
    /**
     * Default timeout in milliseconds
     * The validator will retry until a condition succeeds.
     * If this timeout is hit first, then the validator will report a failure.
     * @type number
     */
    #defaultTimeout = 5000;
  
    /**
     * The specified timeout, or the configured default if no override is given
     * @param {object} opts
     */
    #timeout(opts = {}) {
        return opts.timeout || defaultTimeout;
    }
  
    #complete = false;

    constructor(bot) {
        this.#bot = bot;
    }
  
    /**
     * Set the default timeout in milliseconds
     * The validator will retry until a condition succeeds.
     * If this timeout is hit first, then the validator will report a failure.
     * @param {number} timeout
     */
    setDefaultTimeout(timeout) {
        this.#defaultTimeout = timeout;
    }

    complete() {
        this.#complete = true;
    }

    isComplete() {
        return this.#complete;
    }
  
    /**
     * @param {string} sceneName The name of the scene
     */
    expect(sceneName) {
        return new Matchers(sceneName);
    }
  
    async findEntityByType(objectType) {
        console.log(`finding entity of type ${objectType}`)
        return await this.wait(() => {
            const entities = findEntitiesByType(objectType);
            const entity = entities.length > 0 ? entity[0] : null;
            return entity;
        });       
    }
  
    findEntitiesByType(objectType) {
      const entities = Object.values(this.state()).filter(e => e.objectType === objectType);
      return !entities ? [] : entities
    }

    wait(callback) {
        const start = Date.now();

        function waitFor(resolve, reject) {
            const result = callback()
            console.log(`res ${result}`)
            if(result) {
                resolve(result);
            }
            else if (Date.now() - start >= this.#timeout()) {
                resolve(null);
            }
            else {
                setTimeout(waitFor.bind(this, resolve, reject), 500);
            }
        }

        return new Promise(waitFor);
    }
  
  }