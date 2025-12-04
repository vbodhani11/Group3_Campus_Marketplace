/// <reference types="cypress" />
Cypress.Commands.add("stubCampusRestrictions", (restrictions) => {
    cy.intercept("GET", "https://ywfwphdahaaojipuohsi.supabase.co/rest/v1/app_settings*", {
        statusCode: 200,
        body: { restrictions }
    }).as("appSettings");
});
export {};
