/// <reference types="cypress" />
describe("Registration campus email behavior", () => {
    it("blocks registration with non-.edu email when campusEmailRequired = true", () => {
        cy.stubCampusRestrictions({ campusEmailRequired: true });
        cy.visit("/register");
        cy.wait("@appSettings");
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });
        cy.get('[data-testid="register-name"]').type("Test User");
        cy.get('[data-testid="register-email"]').type("user@gmail.com");
        cy.get('[data-testid="register-password"]').type("Password123!");
        cy.get('[data-testid="register-confirm"]').type("Password123!");
        cy.get('[data-testid="register-submit"]').click();
        cy.get("@alert").should("have.been.calledWith", "You must use a campus (.edu) email address to create an account.");
    });
    it("allows non-.edu email when campusEmailRequired = false", () => {
        cy.stubCampusRestrictions({ campusEmailRequired: false });
        cy.visit("/register");
        cy.wait("@appSettings");
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });
        cy.get('[data-testid="register-name"]').type("Test User");
        cy.get('[data-testid="register-email"]').type("user@gmail.com");
        cy.get('[data-testid="register-password"]').type("Password123!");
        cy.get('[data-testid="register-confirm"]').type("Password123!");
        cy.get('[data-testid="register-submit"]').click();
        // Should NOT show the campus-only alert
        cy.get("@alert").should("not.have.been.calledWith", "You must use a campus (.edu) email address to create an account.");
    });
});
export {};
