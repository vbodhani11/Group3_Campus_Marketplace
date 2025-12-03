/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    stubCampusRestrictions(restrictions: Record<string, any>): Chainable<void>;
  }
}
