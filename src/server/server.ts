export class EventServer {
  private endpoints: string[];

  constructor() {
    this.endpoints = [];
  }

  add(endpoint: string): void {
    this.endpoints.push(endpoint);
  }

  has(endpoint: string): boolean {
    return this.endpoints.includes(endpoint);
  }
}
