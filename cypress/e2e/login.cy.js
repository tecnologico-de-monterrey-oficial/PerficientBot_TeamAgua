describe('Login', () => {
  it('Happy Path', () => {
    cy.visit('http://localhost:4200/');

    cy.get('button.login-button').click();

    // cy.get('div');
    // cy.get('div.c839dc723');
    // cy.get('div.c40b2d45e.c4fcfdd0d');
    // cy.get('form.c85d21d7d.cb9c5bae7.c7e67984d');
    // cy.get('button.cfec88f27.c2db40cfb.c4da19f51').click();
  })
})