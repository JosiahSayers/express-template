import { Environment } from '../environment';

export class TestEnvironment extends Environment {
    static get apiBase(): string {
        return `${process.env.TEST_API_LOCATION}:${this.port}`;
    }
}
