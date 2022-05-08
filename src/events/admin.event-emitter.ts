import { EventEmitter } from "events";

export class AdminEmitter extends EventEmitter {
  private static adminEventInstance: AdminEmitter;

  constructor() {
    super();
  }

  public static getInstance() {
    if (!AdminEmitter.adminEventInstance) {
      AdminEmitter.adminEventInstance = new AdminEmitter();
    }
    return AdminEmitter.adminEventInstance;
  }
}
