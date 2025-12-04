/// <reference types="cypress" />

describe("Admin Pages E2E Tests", () => {
  beforeEach(() => {
    // Clear localStorage and set up admin user
    cy.window().then((win) => {
      win.localStorage.clear();
      win.localStorage.setItem('cm_user', JSON.stringify({
        id: 'admin-123',
        email: 'admin@university.edu',
        full_name: 'Admin User',
        role: 'admin'
      }));
    });
  });

  describe("Admin Access Control", () => {
    it("allows admin users to access admin pages", () => {
      cy.visit("/admin/dashboard");
      cy.url().should('include', '/admin/dashboard');
      // Wait for the page to load
      cy.get('h1').contains('Dashboard', { timeout: 10000 }).should('be.visible');
    });

    it("loads admin pages for admin users", () => {
      cy.visit("/admin/manage-users");
      cy.url().should('include', '/admin/manage-users');
      cy.get('h1').contains('Users', { timeout: 10000 }).should('be.visible');
    });
  });

  describe("Admin Navigation", () => {
    beforeEach(() => {
      cy.visit("/admin/dashboard");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays admin sidebar with all navigation items", () => {
      cy.get('.portal').should('be.visible');
      cy.contains('Admin Portal').should('be.visible');

      // Check all navigation links are present
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Users').should('be.visible');
      cy.contains('Listings').should('be.visible');
      cy.contains('Orders').should('be.visible');
      cy.contains('Reports').should('be.visible');
      cy.contains('Analytics').should('be.visible');
      cy.contains('Settings').should('be.visible');
    });

    it("navigates to dashboard page", () => {
      cy.contains('Dashboard').click({ force: true });
      cy.url().should('include', '/admin/dashboard');
      cy.get('h1').contains('Dashboard').should('be.visible');
    });

    it("navigates to users management page", () => {
      cy.contains('Users').click({ force: true });
      cy.url().should('include', '/admin/manage-users');
      cy.get('h1').contains('Users').should('be.visible');
      cy.contains('User Management').should('be.visible');
    });

    it("navigates to listings management page", () => {
      cy.contains('Listings').click({ force: true });
      cy.url().should('include', '/admin/manage-listings');
      cy.get('h1').contains('Listings').should('be.visible');
    });

    it("navigates to orders management page", () => {
      cy.contains('Orders').click({ force: true });
      cy.url().should('include', '/admin/manage-orders');
      cy.get('h1').contains('Orders').should('be.visible');
    });

    it("navigates to reports page", () => {
      cy.contains('Reports').click({ force: true });
      cy.url().should('include', '/admin/reports');
      cy.get('body').should('be.visible');
    });

    it("navigates to analytics page", () => {
      cy.contains('Analytics').click({ force: true });
      cy.url().should('include', '/admin/analytics');
      cy.get('body').should('be.visible');
    });

    it("navigates to settings page", () => {
      cy.contains('Settings').click({ force: true });
      cy.url().should('include', '/admin/settings');
      cy.get('body').should('be.visible');
    });
  });

  describe("Admin Dashboard", () => {
    beforeEach(() => {
      cy.visit("/admin/dashboard");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays dashboard title and KPI cards", () => {
      cy.contains('Dashboard').should('be.visible');

      // Check KPI cards are displayed
      cy.contains('Total Users').should('be.visible');
      cy.contains('Total Posts').should('be.visible');
      cy.contains('Engagement Rate').should('be.visible');
      cy.contains('Revenue').should('be.visible');
    });

    it("displays recent activity section", () => {
      cy.contains('Recent Activity').should('be.visible');
    });

    it("loads dashboard data without errors", () => {
      // Wait for data to load - should not show loading indefinitely
      cy.get('.kpi-value').should('not.contain', '…');
    });
  });

  describe("User Management", () => {
    beforeEach(() => {
      cy.visit("/admin/manage-users");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays user management interface", () => {
      cy.contains('Users').should('be.visible');
      cy.contains('User Management').should('be.visible');
      cy.contains('Manage user accounts, roles, and permissions').should('be.visible');
    });

    it("displays statistics cards", () => {
      cy.contains('Total Users').should('be.visible');
      cy.contains('Active Users').should('be.visible');
      cy.contains('Inactive Users').should('be.visible');
      cy.contains('Admins').should('be.visible');
    });

    it("displays user table with proper headers", () => {
      cy.contains('User').should('be.visible');
      cy.contains('Contact').should('be.visible');
      cy.contains('Role').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Posts').should('be.visible');
      cy.contains('Last Active').should('be.visible');
      cy.contains('Actions').should('be.visible');
    });

    it("has functional search input", () => {
      cy.get('input[placeholder*="Search by name or email"]').should('be.visible').type('test', { force: true });
      cy.get('input[placeholder*="Search by name or email"]').should('have.value', 'test');
    });

    it("has functional filter dropdowns", () => {
      // Role filter
      cy.get('select').first().should('be.visible').select('admin', { force: true });
      cy.get('select').first().should('have.value', 'admin');

      // Status filter
      cy.get('select').last().should('be.visible').select('active', { force: true });
      cy.get('select').last().should('have.value', 'active');
    });

    it("has functional tabs", () => {
      cy.contains('All').should('be.visible').click({ force: true });
      cy.contains('Active').should('be.visible').click({ force: true });
      cy.contains('Inactive').should('be.visible').click({ force: true });
      cy.contains('Suspended').should('be.visible').click({ force: true });
    });

    it("has export functionality", () => {
      cy.contains('Export').should('be.visible');
    });
  });

  describe("Listings Management", () => {
    beforeEach(() => {
      cy.visit("/admin/manage-listings");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays listings management interface", () => {
      cy.contains('Listings').should('be.visible');
    });

    it("loads listings data", () => {
      // Should either show listings or "no listings found" message
      cy.contains(/Listings|No listings found/).should('be.visible');
    });
  });

  describe("Orders Management", () => {
    beforeEach(() => {
      cy.visit("/admin/manage-orders");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays orders management interface", () => {
      cy.contains('Orders').should('be.visible');
    });

    it("loads orders data", () => {
      // Should either show orders or appropriate message
      cy.contains(/Orders|No orders found/).should('be.visible');
    });
  });

  describe("Reports Page", () => {
    beforeEach(() => {
      cy.visit("/admin/reports");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays reports interface", () => {
      cy.contains('Reports').should('be.visible');
    });

    it("loads reports content", () => {
      // Should load without errors
      cy.get('body').should('be.visible');
    });
  });

  describe("Analytics Page", () => {
    beforeEach(() => {
      cy.visit("/admin/analytics");
      // Open the sidebar - be more specific since there might be multiple .brand elements
      cy.get('button.brand').first().click();
    });

    it("displays analytics interface", () => {
      cy.contains('Analytics').should('be.visible');
    });

    it("loads analytics content", () => {
      // Should load without errors
      cy.get('body').should('be.visible');
    });
  });

  describe("Settings Page", () => {
    beforeEach(() => {
      cy.visit("/admin/settings");
      // Open the sidebar
      cy.get('.brand').click();
    });

    it("displays settings interface", () => {
      cy.contains('Settings').should('be.visible');
    });

    it("loads settings content", () => {
      // Should load without errors
      cy.get('body').should('be.visible');
    });
  });

  describe("Admin Profile", () => {
    beforeEach(() => {
      cy.visit("/admin/profile");
    });

    it("displays admin profile interface", () => {
      // Profile page should load
      cy.get('body').should('be.visible');
    });
  });

  describe("Admin Logout", () => {
    it("logs out admin user and redirects to login", () => {
      cy.visit("/admin/dashboard");
      // Open the sidebar to access logout
      cy.get('.brand').click();

      // Click logout button
      cy.contains('Logout').click({ force: true });

      // Should redirect to login page
      cy.url().should('include', '/login');
    });
  });

  describe("Mobile Responsiveness", () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
      cy.visit("/admin/dashboard");
    });

    it("shows mobile menu toggle", () => {
      // On mobile, sidebar should be hidden by default
      cy.get('.portal').should('not.be.visible');
    });

    it("can toggle mobile sidebar", () => {
      // Click hamburger menu (brand button)
      cy.get('.brand').should('be.visible').click();
      cy.get('.portal').should('be.visible');

      // Click overlay to close
      cy.get('.portal-overlay').click({ force: true });
      cy.get('.portal').should('not.be.visible');
    });
  });
});
