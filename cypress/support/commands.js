// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('geraToken', (email, senha) => {
    cy.request({
        method: 'POST',
        url: 'login',
        body: {
            email: email,
            password: senha
        },
         
    }).then((response) => {
        expect(response.status).to.equal(200)
        return response.body.token
    })
})

Cypress.Commands.add('cadastrarUsuario', (nome, email, senha) => {
    cy.api({
        method: 'POST',
        url: 'users',
        body: {
            "name": nome,
            "email": email,
            "password": senha
        }
    }).then(response => {
        expect(response.status).to.equal(201)
        return response.body.user.id
    })
})
/*
Cypress.Commands.add('atualizarLivro', (token, bookId, title, author) => {
  return cy.api({
    method: 'POST',
    url: `books/${bookId}`,
    headers: { 'Authorization' : token },
    body: {
      title,
      author,
      description: 'Descrição atualizada do livro',
      category: 'Categoria atualizada',
      editor: 'Editora Atualizada',
      language: 'Português',
      publication_year: 2000,
      pages: 300,
      format: 'Físico',
      total_copies: 10,
      available_copies: 5
    }
    
  })
})
*/
Cypress.Commands.add('criarLivro', (title, token,author) => {
    cy.api({
               method: 'POST',
               url: 'books',
               headers: { Authorization: `Bearer ${token}` },
               body: {
                    "title": title,
                    "author": author,
                    "description": "Romance naturalista que retrata a vida em um cortiço",
                    "category": "Literatura Brasileira",
                    isbn: `978-85-260-${Date.now()}`,
                    "editor": "Editora Ática",
                    "language": "Português",
                    "publication_year": 1890,
                    "pages": 312,
                    "format": "Físico",
                    "total_copies": 4,
                    "available_copies": 4
               }

          }).then(response=> {
            expect(response.status).to.equal(201)
            return response.body.book.id
          })
})
