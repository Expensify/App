const { expect } = require('chai');
const { mount } = require('@cypress/react');

describe('Reproduce Issue 90776', () => {
    it('should return to the screen before Workspaces screen after double-clicking the back button', () => {
        cy.visit('/'); // Open App
        cy.get('[data-testid="sign-in-button"]').click(); // Sign in with a new account (don't create a workspace during onboarding)
        cy.get('[data-testid="create-workspace-fab"]').click(); // Tap on FAB button > Create Workspace > Tap Confirm
        cy.wait(2000); // Wait for the workspace creation to complete

        cy.get('[data-testid="back-button"]').click(); // Press the back button on browser once
        cy.get('[data-testid="back-button"]').click(); // Press the back button on browser twice

        cy.url().should('include', '/'); // Ensure user is returned to the home screen
    });
});