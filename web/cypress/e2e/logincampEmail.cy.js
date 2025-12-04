/// <reference types="cypress" />
describe("Login campus email behavior", () => {
    it("blocks STUDENT login with non-.edu email when campusEmailRequired = true", () => {
        cy.stubCampusRestrictions({ campusEmailRequired: true });
        cy.visit("/login");
        cy.wait("@appSettings");
        // Spy on window.alert
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });
        // Ensure student role
        cy.get('[data-testid="role-student"]').click();
        cy.get('[data-testid="login-email"]').type("user@gmail.com");
        cy.get('[data-testid="login-password"]').type("Password123!");
        cy.get('[data-testid="login-submit"]').click();
        cy.get("@alert").should("have.been.calledWith", "Only campus (.edu) email addresses are allowed to use this marketplace.");
    });
    it("allows STUDENT login attempt with .edu email when campusEmailRequired = true", () => {
        cy.stubCampusRestrictions({ campusEmailRequired: true });
        cy.visit("/login");
        cy.wait("@appSettings");
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });
        cy.get('[data-testid="role-student"]').click();
        cy.get('[data-testid="login-email"]').type("student@university.edu");
        cy.get('[data-testid="login-password"]').type("Password123!");
        cy.get('[data-testid="login-submit"]').click();
        cy.get("@alert").should("not.have.been.calledWith", "Only campus (.edu) email addresses are allowed to use this marketplace.");
    });
    it("does NOT enforce .edu for ADMIN login even when campusEmailRequired = true", () => {
        cy.stubCampusRestrictions({ campusEmailRequired: true });
        cy.visit("/login");
        cy.wait("@appSettings");
        cy.window().then((win) => {
            cy.stub(win, "alert").as("alert");
        });
        // Admin role
        cy.get('[data-testid="role-admin"]').click();
        cy.get('[data-testid="login-email"]').type("admin@gmail.com");
        cy.get('[data-testid="login-password"]').type("Password123!");
        cy.get('[data-testid="login-submit"]').click();
        cy.get("@alert").should("not.have.been.calledWith", "Only campus (.edu) email addresses are allowed to use this marketplace.");
    });
});
export {};
